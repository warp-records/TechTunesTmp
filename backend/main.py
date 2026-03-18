import os
import uuid
import json

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter, Header
from pydantic import BaseModel

from sqlalchemy.orm import Session
from database import SessionLocal, init_db, UserDB, SessionDB, AvatarDB

from datetime import datetime
import stripe
from schemas.webhooks import StripeWebhookEvent, StripeEventType
from routers.webhooks import router as webhook_router
from routers.subscriptions import router as subscription_router
from services.subscription_service import (
    handle_subscription_created,
    handle_subscription_updated,
    handle_subscription_deleted,
    handle_subscription_paused,
    handle_subscription_resumed,
    handle_trial_ending,
    handle_invoice_paid,
    handle_invoice_payment_failed,
)
router = APIRouter(tags=["webhooks"])

# initialize fastapi
app = FastAPI()
# for stripe webhooks
app.include_router(webhook_router)
app.include_router(subscription_router)

# initialie sql database
init_db()


class User(BaseModel):
    username: str
    password: str
    
class Avatar(BaseModel):
    form: int
    bodyTexture: str
    activeItems: dict

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
    

# @app.get("/api/profile")
# def profileData(token: str):
#     if token not in sessions:
#         raise HTTPException(status_code=401, detail="Unauthorized")

#     return { "username": sessions[token] }


# in cents
stripe.api_key = os.environ.get("STRIPE_PRIVATE_TEST_KEY")
SUBSCRIPTION_COST = 2499

class PaymentRequest(BaseModel):
    payment_id: str

# create pay intent
@app.post("/api/pay", tags=["payment"])
def get_secret(body: PaymentRequest, user_id: int = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.id == user_id)
    
    if not db_user.stripe_customer_id:
        customer = stripe.Customer.create()
        db_user.stripe_customer_id = customer.id
        db.commit()
        
    stripe.PaymentMethod.attach(body.payment_id, customer=db_user.stripe_customer_id)
    
    intent = stripe.PaymentIntent.create(
        amount=SUBSCRIPTION_COST,
        currency="usd",
        customer=db_user.stripe_customer_id,
        payment_method=body.payment_id,
        confirm=True,
        automatic_payment_methods={
            "enabled": True,
            "allow_redirects": "never"
        },
    )
    if intent.status == "succeeded":
        return {"success": True }
    else:
        return {"status_code": 400, "content": "error: Payment failed"}

# stripe events
@router.post("/webhook/stripe")
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
        
    parsed = StripeWebhookEvent(**event)
    obj = parsed.data.object
    
    match parsed.type:
        case StripeEventType.INVOICE_PAID:
            await handle_invoice_paid(obj)
        case _:
            pass
    
    return {"received": True}
                

async def handle_invoice(invoice):
    db = SessionLocal()
    
    user = db.query(UserDB).filter(UserDB.stripe_customer_id == invoice.customer).first()
    # stripe payment periods are unix epoch format
    dt = datetime.fromtimestamp(invoice.period_end)
    user.subscription_end = dt
    db.commit()
    
    