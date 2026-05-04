import os
import uuid
import json
import time
import io
import hmac
import hashlib
import base64
import secrets
from enum import Enum

import xml_parse

from dotenv import load_dotenv
from typing import Any
load_dotenv()

LICENSE_SECRET = os.environ.get("LICENSE_SECRET", "")

def _validate_key_signature(key: str) -> bool:
    try:
        clean = key.replace("-", "").upper()
        if len(clean) != 24:
            return False
        raw = base64.b32decode(clean)          # 15 bytes
        rand, stored_mac = raw[:11], raw[11:]  # 11 + 4
        expected = hmac.new(LICENSE_SECRET.encode(), rand, hashlib.sha256).digest()[:4]
        return hmac.compare_digest(stored_mac, expected)
    except Exception:
        return False

import bcrypt
from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter, Header, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from sqlalchemy.orm import Session
from database import SessionLocal, init_db, UserDB, SessionDB, AvatarDB, SongDB, LessonTileDB, NonProfitDB, UsedKeyDB

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

# while in invite only phase
class RegisterRequest(BaseModel):
    username: str
    password: str
    license_key: str
    
PLAIN_SKINS = {'yellow', 'purple', 'white', 'green', 'blue', 'orange', 'pink'}
BETA_ACCESSORIES = {'beta badge'}

class Avatar(BaseModel):
    form: int
    bodyBg: str  # skin name
    activeItems: dict

# decoy: actual score is transmitted via cache_id on /api/me
class LessonScoreSubmission(BaseModel):
    tile_number: int
    instrument: str
    level: str
    score: int


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
    session = db.query(SessionDB).filter(SessionDB.token == token, SessionDB.user_id.isnot(None)).first()

    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return session.user_id

def get_current_nonprofit(request: Request, db: Session = Depends(get_db)) -> int:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = auth.replace("Bearer ", "")
    session = db.query(SessionDB).filter(SessionDB.token == token, SessionDB.nonprofit_id.isnot(None)).first()

    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return session.nonprofit_id

_last_score_token: dict[int, str] = {}

# decode obfuscated score
def handle_score(_t: str, token: str, user: UserDB, db: Session):
    if _last_score_token.get(user.id) == _t:
        return
    token_key = int(token.replace('-', '')[:8], 16)
    encoded = int(_t.replace('-', '')[:8], 16)
    bucket = int(time.time() // 5)
    score = encoded ^ token_key ^ bucket
    if not (10 <= score <= 10000):
        score = encoded ^ token_key ^ (bucket - 1)
    if not (10 <= score <= 10000):
        return
    _last_score_token[user.id] = _t
    user.score += score
    db.commit()

@app.get("/api/me")
# _t looks like a cache-busting param; score=0 means regular request
def me(request: Request, user_id: int = Depends(get_current_user), db: Session = Depends(get_db), _t: str | None = None):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is not None:
        if _t is not None:
            token = request.headers.get("Authorization", "").replace("Bearer ", "")
            handle_score(_t, token, user, db)
        return {
            # either the user wasn't underage
            # or there exists a payment which verifies them
            "needs_verification": user.underage and user.stripe_customer_id is None,
            "admin": user.admin,
            "restricted": user.restricted,
            "banned": user.banned,
            "ban_message": user.ban_message,
            "beta_tester": user.beta_tester,
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
    
@app.get("/api/get_score")
def get_score(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return { "score": user.score }

@app.post("/api/register")
def register(user: RegisterRequest, underage: bool, db: Session = Depends(get_db)):
    if not _validate_key_signature(user.license_key):
        raise HTTPException(status_code=400, detail="InvalidKey")

    normalized = user.license_key.replace("-", "").upper()
    already_used = db.query(UsedKeyDB).filter(UsedKeyDB.key == normalized).first()
    if already_used:
        raise HTTPException(status_code=409, detail="KeyAlreadyUsed")

    existing = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="UsernameTaken")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    db_user = UserDB(
        username=user.username,
        password_hash=hashed.decode(),
        underage=underage,
        admin=False,
        join_date=datetime.utcnow(),
        beta_tester=False,
    )
    db.add(db_user)
    db.flush()

    db.add(UsedKeyDB(key=normalized, used_by=db_user.id))

    token = str(uuid.uuid4())
    db_session = SessionDB(token=token, user_id=db_user.id)
    db.add(db_session)

    db_avatar = AvatarDB(
        user_id=db_user.id,
        form=0,
        bodyTexture=json.dumps("white"),
        active_items=json.dumps({}),
    )
    db.add(db_avatar)

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
    if avatar.bodyBg not in PLAIN_SKINS and not is_premium(user_id, db):
        raise HTTPException(status_code=403, detail="Premium required to use this skin")

    accessory = avatar.activeItems.get("accessory") if isinstance(avatar.activeItems, dict) else None
    if isinstance(accessory, dict) and accessory.get("name") in BETA_ACCESSORIES:
        user_db = db.query(UserDB).filter(UserDB.id == user_id).first()
        if not user_db or not user_db.beta_tester:
            raise HTTPException(status_code=403, detail="Beta tester exclusive accessory")
        
    db_avatar = db.query(AvatarDB).filter(AvatarDB.user_id == user_id).first()
    # solid colors use a numeric index, textures use a filename string
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()


    if db_avatar:
        db_avatar.form = avatar.form
        db_avatar.bodyTexture = json.dumps(avatar.bodyBg)
        db_avatar.active_items = json.dumps(avatar.activeItems)
    else:
        db_avatar = AvatarDB(
            user_id=user_id,
            form=avatar.form,
            bodyTexture=json.dumps(avatar.bodyBg),
            active_items=json.dumps(avatar.activeItems),
        )
        db.add(db_avatar)

    db.commit()

@app.get("/api/get-avatar/", tags=["avatar"])
def get_avatar(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    db_avatar = db.query(AvatarDB).filter(AvatarDB.user_id == user_id).first()
    if not db_avatar:
        raise HTTPException(status_code=404, detail="No avatar found")

    raw = json.loads(db_avatar.bodyTexture)
    body_skin = raw if isinstance(raw, str) else 'white'  # backward compat with old dict format

    return {
        "avatar": {
            "form": db_avatar.form,
            "bodyBg": body_skin,
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

def _generate_license_key() -> str:
    rand = secrets.token_bytes(11)
    mac = hmac.new(LICENSE_SECRET.encode(), rand, hashlib.sha256).digest()[:4]
    raw = rand + mac
    encoded = base64.b32encode(raw).decode()
    return f"{encoded[0:4]}-{encoded[4:8]}-{encoded[8:12]}-{encoded[12:16]}-{encoded[16:20]}-{encoded[20:24]}"

@app.post("/api/generate_invite_key", tags=["admin"])
def generate_invite_key(_: None = Depends(is_admin)):
    return { "key": _generate_license_key() }

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

# decoy endpoint: score param is ignored, real score comes via cache_id on /api/me
@app.post("/api/submit_lesson_score", tags=["songs"])
def submit_lesson_score(body: LessonScoreSubmission, _: int = Depends(get_current_user)):
    return {"ok": True}

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

# NON PROFITS
#
#
#

class NonProfitRequest(BaseModel):
    name: str
    email: str
    password: str
    stripe_bank_token: str = "0"

class NonProfitLogin(BaseModel):
    email: str
    password: str

@app.post("/api/nonprofit/request", tags=["nonprofit"])
def nonprofit_request(body: NonProfitRequest, db: Session = Depends(get_db)):
    if db.query(NonProfitDB).filter(NonProfitDB.name == body.name).first():
        raise HTTPException(status_code=409, detail="NameTaken")
    if db.query(NonProfitDB).filter(NonProfitDB.email == body.email).first():
        raise HTTPException(status_code=409, detail="EmailTaken")
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt())
    db.add(NonProfitDB(name=body.name, email=body.email, password_hash=hashed.decode(), stripe_bank_token=body.stripe_bank_token))
    db.commit()
    return {"message": "Request submitted"}

@app.post("/api/nonprofit/login", tags=["nonprofit"])
def nonprofit_login(body: NonProfitLogin, db: Session = Depends(get_db)):
    np = db.query(NonProfitDB).filter(NonProfitDB.email == body.email).first()
    if not np or not bcrypt.checkpw(body.password.encode(), np.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Bad login")
    if not np.is_verified:
        raise HTTPException(status_code=403, detail="Account pending approval")
    token = str(uuid.uuid4())
    db.add(SessionDB(token=token, nonprofit_id=np.id))
    db.commit()
    return {"message": "Logged in", "name": np.name, "token": token}

@app.get("/api/nonprofit/me", tags=["nonprofit"])
def nonprofit_me(nonprofit_id: int = Depends(get_current_nonprofit), db: Session = Depends(get_db)):
    np = db.query(NonProfitDB).filter(NonProfitDB.id == nonprofit_id).first()
    return {"name": np.name, "email": np.email, "balance": np.balance}

@app.get("/api/admin/nonprofit/list", tags=["nonprofit", "admin"])
def nonprofit_list(_: None = Depends(is_admin), db: Session = Depends(get_db)):
    return [
        {"id": np.id, "name": np.name, "email": np.email, "is_verified": np.is_verified, "balance": np.balance}
        for np in db.query(NonProfitDB).all()
    ]

@app.post("/api/admin/nonprofit/approve", tags=["nonprofit", "admin"])
def nonprofit_approve(nonprofit_id: int, _: None = Depends(is_admin), db: Session = Depends(get_db)):
    np = db.query(NonProfitDB).filter(NonProfitDB.id == nonprofit_id).first()
    if not np:
        raise HTTPException(status_code=404, detail="Not found")
    np.is_verified = True
    db.commit()
    return {"ok": True}

@app.delete("/api/admin/nonprofit/reject", tags=["nonprofit", "admin"])
def nonprofit_reject(nonprofit_id: int, _: None = Depends(is_admin), db: Session = Depends(get_db)):
    np = db.query(NonProfitDB).filter(NonProfitDB.id == nonprofit_id).first()
    if not np:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(np)
    
    db.commit()
    return {"ok": True}


FINANCIAL_ACCOUNT_ID = os.environ.get("FINANCIAL_ACCOUNT_ID")
@app.post("/api/nonprofit/withdrawal")
def nonprofit_withdrawal(nonprofit_id: int, db: Session = Depends(get_db)):
    pass
    # initialize stripe customer data for withdrawals
    # customer = stripe.Customer.create(
    #     description="Charity Name",
    #     email="no@thank.you"
    # )
    
    # setup_intent = stripe.SetupIntent.create(
    #     customer=customer.id,
    #     flow_directions=["outbound"],
    #     payment_method_types=["us_bank_account"],
    #     payment_method_data={
    #         "type": "us_bank_account",
    #         "us_bank_account": {
    #             "routing_number": "110000000",
    #             "account_number": "000123456789",
    #             "account_holder_type": "individual",
    #         },
    #         "billing_details": {"name": "John Doe"},
    #     }
    # )
    
    # payment_method_id = setup_intent["payment_method"]
    
    # outbound_payment = stripe.treasury.OutboundPayment.create(
    #     financial_account=FINANCIAL_ACCOUNT_ID,
    #     amount=100,
    #     currency="usd",
    #     customer=customer.id,
    #     destination_payment_method=payment_method_id,
    #     description="Test outboud payment",
    # )
    
    # features = stripe.treasury.FinancialAccount.update_features(
    # FINANCIAL_ACCOUNT_ID,
    # outbound_payments={
    #     "ach": {
    #         "requested": True,
    #     },
    #     "us_domestic_wire": {
    #         "requested": True,
    #     }
    # }
    # )

# DIST_DIR = os.path.join(os.path.dirname(__file__), "../frontend/dist")
# app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

# @app.get("/{full_path:path}")
# def serve_frontend(full_path: str):
#     file = os.path.join(DIST_DIR, full_path)
#     if os.path.isfile(file):
#         return FileResponse(file)
#     return FileResponse(os.path.join(DIST_DIR, "index.html"))

# charity payments



# setup_intent = stripe.SetupIntent.create(
#     customer=customer.id,
#     flow_directions=["outbound"],
#     payment_method_types=["us_bank_account"],
#     payment_method_data={
#         "type": "us_bank_account",
#         "us_bank_account": {
#             "routing_number": "110000000",
#             "account_number": "000123456789",
#             "account_holder_type": "individual",
#         },
#         "billing_details": {"name": "John Doe"},
#     }
# )


    
    
    
