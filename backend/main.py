import os
import uuid
import json
from enum import Enum

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter, Header
from pydantic import BaseModel

from sqlalchemy.orm import Session
from database import SessionLocal, init_db, UserDB, SessionDB, AvatarDB

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
    
class Avatar(BaseModel):
    form: int
    bodyTexture: str
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
        
    
@app.post("/api/register")
def register(user: User, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="UsernameTaken")
    
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())    
    
    db_user = UserDB(username=user.username, password_hash=hashed.decode())
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
    db_avatar = db.query(AvatarDB).filter(AvatarDB.user_id == user_id).first()

    if db_avatar:
        db_avatar.form = avatar.form
        db_avatar.bodyTexture = avatar.bodyTexture
        db_avatar.active_items = json.dumps(avatar.activeItems)
    else:
        db_avatar = AvatarDB(
            user_id=user_id,
            form=avatar.form,
            bodyTexture=avatar.bodyTexture,
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
            "bodyTexture": db_avatar.bodyTexture,
            "activeItems": json.loads(db_avatar.active_items),
        }
    }

@app.get("/api/check-premium")
def check_premium(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()
    subscription_end = user_db.subscription_end
    is_premium = subscription_end and subscription_end > datetime.utcnow()
    return {"is_premium": bool(is_premium)}


# @app.get("/api/profile")
# def profileData(token: str):
#     if token not in sessions:
#         raise HTTPException(status_code=401, detail="Unauthorized")

#     return { "username": sessions[token] }


# in cents
stripe.api_key = os.environ.get("STRIPE_PRIVATE_TEST_KEY")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET")
STRIPE_PRICE_ID = os.environ.get("STRIPE_PRICE_ID")

class PaymentRequest(BaseModel):
    payment_id: str

@app.post("/api/pay", tags=["payment"])
def create_subscription(body: PaymentRequest, user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()

    if not db_user.stripe_customer_id:
        customer = stripe.Customer.create()
        db_user.stripe_customer_id = customer.id
        db.commit()

    stripe.PaymentMethod.attach(body.payment_id, customer=db_user.stripe_customer_id)
    stripe.Customer.modify(db_user.stripe_customer_id, invoice_settings={"default_payment_method": body.payment_id})

    subscription = stripe.Subscription.create(
        customer=db_user.stripe_customer_id,
        items=[{"price": STRIPE_PRICE_ID}],
        payment_behavior="default_incomplete",
        payment_settings={
            "payment_method_types": ["card"],
            "save_default_payment_method": "on_subscription",
        },
        expand=["latest_invoice"],
    )

    print(subscription.latest_invoice.ConfirmationSecret)
    return {"client_secret": subscription.latest_invoice.ConfirmationSecret}

# stripe events
@app.post("/webhook/stripe")
async def stripe_webhook(
        request: Request,
        # double check that this is correct
        signature: str = Header(..., alias="Stripe-Signature") ):
    payload = await request.body()
    print(payload)
    
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
    
    