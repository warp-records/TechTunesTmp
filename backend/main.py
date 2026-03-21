import os
import uuid
import json
import io
from enum import Enum

import xml_parse

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter, Header, UploadFile
from pydantic import BaseModel

from sqlalchemy.orm import Session
from database import SessionLocal, init_db, UserDB, SessionDB, AvatarDB, SongDB, LessonTileDB

from datetime import datetime
import stripe

router = APIRouter(tags=["webhooks"])

# initialize fastapi
app = FastAPI()
# for stripe webhooks
# app.include_router(webhook_router)
# app.include_router(subscription_router)

# initialie sql database
init_db()


class User(BaseModel):
    username: str
    password: str
    
class BodyBg(BaseModel):
    isTexture: bool
    colorIdx: int | None = None
    bgSrc: str | None = None

class Avatar(BaseModel):
    form: int
    bodyBg: BodyBg
    activeItems: dict


# for webhooks
class StripeEventType(str, Enum):
    INVOICE_PAID           = "invoice.paid"
    SUB_DELETED            = "customer.subscription.deleted"

class StripeEventData(BaseModel):
    object: dict[str, Any]

class StripeWebhookEvent(BaseModel):
    id: str
    type: str
    data: StripeEventData

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_current_user(request: Request, db: Session = Depends(get_db)) -> int:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth.replace("Bearer ", "")
    session = db.query(SessionDB).filter(SessionDB.token == token).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return session.user_id
        
@app.get("/api/me")
def me(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is not None:
        return {
            # either the user wasn't underage
            # or there exists a payment which verifies them
            "needs_verification": user.underage and user.stripe_customer_id is None,
            "admin": user.admin,
            "restricted": user.restricted,
            "banned": user.banned,
            "ban_message": user.ban_message,
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
    
@app.post("/api/register")
def register(user: User, underage: bool, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="UsernameTaken")
    
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())    
    
    db_user = UserDB(
        username=user.username, 
        password_hash=hashed.decode(), 
        underage=underage, 
        admin=False
    )
    db.add(db_user)
    db.flush()
    
    token = str(uuid.uuid4())
    db_session = SessionDB(token=token, user_id=db_user.id)
    db.add(db_session)
    
    db.commit()
    
    return { 
        "message": "User created",
        "username": user.username,
        "token": token,
    }

@app.get("/api/check-username/{username}")
def check_username(username: str, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.username == username).first()
    
    return { "taken": existing is not None }

            
@app.post("/api/login", tags=["auth"])
def login(user: User, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    
    if not db_user or not bcrypt.checkpw(user.password.encode(), db_user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Bad login")
        
    token = str(uuid.uuid4())
    db_session = SessionDB(token=token, user_id=db_user.id)
    db.add(db_session)
    db.commit()
        
    return { 
        "message": "Logged in",
        "username": user.username,
        "token": token,
    }
        

@app.post("/api/save-avatar/", tags=["avatar"])
def save_avatar(avatar: Avatar, user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    if avatar.bodyBg.isTexture and not is_premium(user_id, db):
        raise HTTPException(status_code=403, detail="Premium required to use textures")
        
    db_avatar = db.query(AvatarDB).filter(AvatarDB.user_id == user_id).first()
    # solid colors use a numeric index, textures use a filename string
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()


    if db_avatar:
        db_avatar.form = avatar.form
        db_avatar.bodyTexture = json.dumps(avatar.bodyBg.model_dump())
        db_avatar.active_items = json.dumps(avatar.activeItems)
    else:
        db_avatar = AvatarDB(
            user_id=user_id,
            form=avatar.form,
            bodyTexture=json.dumps(avatar.bodyBg.model_dump()),
            active_items=json.dumps(avatar.activeItems),
        )
        db.add(db_avatar)

    db.commit()

@app.get("/api/get-avatar/", tags=["avatar"])
def get_avatar(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    db_avatar = db.query(AvatarDB).filter(AvatarDB.user_id == user_id).first()
    if not db_avatar:
        raise HTTPException(status_code=404, detail="No avatar found")

    return {
        "avatar": {
            "form": db_avatar.form,
            "bodyBg": json.loads(db_avatar.bodyTexture),
            "activeItems": json.loads(db_avatar.active_items),
        }
    }

def is_premium(user_id: int, db: Session):
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()
    subscription_end = user_db.subscription_end
    return subscription_end and subscription_end > datetime.utcnow()

@app.get("/api/check-premium")
def check_premium(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"is_premium": is_premium(user_id, db)}


class AutoDonateRequest(BaseModel):
    charity: str

@app.post("/api/set-auto-donate")
def set_auto_donate(body: AutoDonateRequest, user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_premium(user_id, db):
        raise HTTPException(status_code=403, detail="Premium required")
        
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    db_user.auto_donate = body.charity
    db.commit()
    return {"auto_donate": db_user.auto_donate}

@app.get("/api/get-auto-donate")
def get_auto_donate(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_premium(user_id, db):
        raise HTTPException(status_code=403, detail="Premium required")
        
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    return {"auto_donate": db_user.auto_donate}



# @app.get("/api/profile")
# def profileData(token: str):
#     if token not in sessions:
#         raise HTTPException(status_code=401, detail="Unauthorized")

#     return { "username": sessions[token] }


# PAYMENT
# 
# 
# 
stripe.api_key = os.environ.get("STRIPE_PRIVATE_TEST_KEY")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET")
STRIPE_SUB_PRICE_ID = os.environ.get("STRIPE_SUB_PRICE_ID")
STRIPE_VERIFY_PRICE_ID = os.environ.get("STRIPE_VERIFY_PRICE_ID")

class PaymentRequest(BaseModel):
    payment_id: str

# pay_type is either "subscription" or "verification"
@app.post("/api/pay/{pay_type}", tags=["payment"])
def create_subscription(body: PaymentRequest, pay_type: str, user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()

    if not db_user.stripe_customer_id:
        customer = stripe.Customer.create()
        db_user.stripe_customer_id = customer.id
        db.commit()

    stripe.PaymentMethod.attach(body.payment_id, customer=db_user.stripe_customer_id)
    stripe.Customer.modify(db_user.stripe_customer_id, invoice_settings={"default_payment_method": body.payment_id})

    match pay_type:
        case "subscription":
            subscription = stripe.Subscription.create(
                customer=db_user.stripe_customer_id,
                items=[{"price": STRIPE_SUB_PRICE_ID}],
                payment_behavior="default_incomplete",
                payment_settings={
                    "payment_method_types": ["card"],
                    "save_default_payment_method": "on_subscription",
                },
                expand=["latest_invoice"],
            )
        
            return {"client_secret": subscription.latest_invoice.ConfirmationSecret}
        case "verify":
            price = stripe.Price.create(
                product=STRIPE_VERIFY_PRICE_ID,
                currency="usd",
                unit_amount=0,
            )
            return {}
        case _:
            raise HTTPException(status_code=403, detail="Invalid payment type")

# stripe events
@app.post("/webhook/stripe")
async def stripe_webhook(
        request: Request,
        # double check that this is correct
        signature: str = Header(..., alias="Stripe-Signature") ):
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError: 
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    if event["type"] == "invoice.finalized":
        await handle_invoice(event["data"]["object"])
    
    return {"received": True}
                

async def handle_invoice(invoice):
    db = SessionLocal()
    
    user = db.query(UserDB).filter(UserDB.stripe_customer_id == invoice["customer"]).first()
    # stripe payment periods are unix epoch format
    dt = datetime.fromtimestamp(invoice["lines"]["data"][0]["period"]["end"])
    user.subscription_end = dt
    db.commit()
    

# ADMIN
# 
# 
# 


def is_admin(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user or not user.admin:
        raise HTTPException(status_code=403, detail="Forbidden")

class BanRequest(BaseModel):
    ban_user_id: int
    ban_time: datetime
    ban_message: str | None = None

@app.post("/api/ban", tags=["admin"])
def ban_user(body: BanRequest, user_id: int = Depends(get_current_user), db: Session = Depends(get_db), _: None = Depends(is_admin)):

    target = db.query(UserDB).filter(UserDB.id == body.ban_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.banned = body.ban_time
    target.ban_message = body.ban_message
    db.commit()
    return {"ok": True}

@app.post("/api/unban", tags=["admin"])
def unban_user(ban_user_id: int, user_id: int = Depends(get_current_user), db: Session = Depends(get_db), _: None = Depends(is_admin)):

    target = db.query(UserDB).filter(UserDB.id == ban_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.banned = None
    target.ban_message = None
    db.commit()
    return {"ok": True}

@app.get("/api/fetch_user_list", tags=["admin"])
def fetch_user_list(user_id: int = Depends(get_current_user), db: Session = Depends(get_db), _: None = Depends(is_admin)):

    users = db.query(UserDB).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "stripe_customer_id": u.stripe_customer_id,
            "subscription_end": u.subscription_end,
            "auto_donate": u.auto_donate,
            "underage": u.underage,
            "admin": u.admin,
            "restricted": u.restricted,
            "banned": u.banned,
            "ban_message": u.ban_message,
        }
        for u in users
    ]

# SONGS
# 
# 
# 

SONGDB_MUSICXML_DIR = "songdb/musicxml"
SONGDB_JSON_DIR = "songdb/json"
os.makedirs(SONGDB_MUSICXML_DIR, exist_ok=True)
os.makedirs(SONGDB_JSON_DIR, exist_ok=True)

@app.post("/api/upload_song", tags=["songs", "admin"])
async def upload_song(song_file: UploadFile, _: None = Depends(is_admin), db: Session = Depends(get_db)):
    contents = await song_file.read()
    try:
        song, skipped = xml_parse.parse_song(io.BytesIO(contents), allow_unplayable=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    existing = db.query(SongDB).filter(SongDB.name == song.name).first()

    if existing:
        musicxml_path = existing.musicxml_path
        json_path = existing.json_path
    else:
        file_id = str(uuid.uuid4())
        musicxml_path = os.path.join(SONGDB_MUSICXML_DIR, f"{file_id}.mxl")
        json_path = os.path.join(SONGDB_JSON_DIR, f"{file_id}.json")

    with open(musicxml_path, "wb") as f:
        f.write(contents)
    with open(json_path, "w") as f:
        f.write(song.to_json())

    if existing:
        existing.instrument = song.instrument
        existing.tempo = song.tempo
    else:
        db.add(SongDB(
            name=song.name,
            instrument=song.instrument,
            tempo=song.tempo,
            musicxml_path=musicxml_path,
            json_path=json_path,
        ))
    db.commit()

    return { "name": song.name, "skipped_notes": skipped }

@app.get("/api/all_songs_meta", tags=["songs"])
def all_songs_meta(db: Session = Depends(get_db)):
    songs = db.query(SongDB).all()
    return [
        { "id": s.id, "name": s.name, "instrument": s.instrument, "tempo": s.tempo, "difficulty": s.difficulty }
        for s in songs
    ]

@app.get("/api/song_meta", tags=["songs"])
def song_meta(song_id: int, db: Session = Depends(get_db)):
    song = db.query(SongDB).filter(SongDB.id == song_id).first()
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return {
        "id": song.id,
        "name": song.name,
        "instrument": song.instrument,
        "tempo": song.tempo,
        "difficulty": song.difficulty,
    }

@app.get("/api/lesson_tile", tags=["songs"])
def get_lesson_tile(tile_number: int, instrument: str, level: str, db: Session = Depends(get_db)):
    tile = db.query(LessonTileDB).filter(
        LessonTileDB.tile_number == tile_number,
        LessonTileDB.instrument == instrument,
        LessonTileDB.level == level,
    ).first()
    if tile is None or tile.song_id is None:
        raise HTTPException(status_code=404, detail="No lesson assigned to this tile")
    song = db.query(SongDB).filter(SongDB.id == tile.song_id).first()
    with open(song.json_path, "r") as f:
        song_data = json.load(f)
    return {
        "id": song.id,
        "name": song.name,
        "instrument": song.instrument,
        "tempo": song.tempo,
        "difficulty": song.difficulty,
        "data": song_data,
    }

@app.post("/api/assign_lesson_tile", tags=["songs", "admin"])
def assign_lesson_tile(
    tile_number: int,
    instrument: str,
    level: str,
    song_id: int,
    _: None = Depends(is_admin),
    db: Session = Depends(get_db),
):
    if db.query(SongDB).filter(SongDB.id == song_id).first() is None:
        raise HTTPException(status_code=404, detail="Song not found")

    tile = db.query(LessonTileDB).filter(
        LessonTileDB.tile_number == tile_number,
        LessonTileDB.instrument == instrument,
        LessonTileDB.level == level,
    ).first()

    if tile:
        tile.song_id = song_id
    else:
        db.add(LessonTileDB(tile_number=tile_number, instrument=instrument, level=level, song_id=song_id))

    db.commit()
    return { "tile_number": tile_number, "instrument": instrument, "level": level, "song_id": song_id }
