import uuid

from fastapi import FastAPI, Request
from fastapi import HTTPException
from pydantic import BaseModel, field_validator

app = FastAPI()

users = {}
sessions = {}
avatars = {}

class User(BaseModel):
    username: str
    password: str
    
@app.post("/api/register")
def register(user: User):
    if user.username in users:
        raise HTTPException(status_code=409, detail="UsernameTaken")
        
    users[user.username] = user.password
    token = str(uuid.uuid4())
    sessions[token] = user.username
    
    print("Registered: " + user.username + " : " + user.password)
    return { 
        "message": "User created",
        "username": user.username,
        "token": token,
    }

@app.get("/api/check-username/{username}")
def check_username(username: str):
    return { "taken": username in  users }

# TODO: sanitize to prevent XSS
class Avatar(BaseModel):
    form: int
    bodyColor: str
    activeItems: dict
    eye: str
    
    @field_validator('bodyColor')
    @classmethod
    def valid_hex(cls, v):
        if not v.startswith('#') or len(v) not in (4, 7):
            raise ValueError('Must be a hex color like #FFF or #FF00FF')
        return v
            
        

@app.post("/api/save-avatar/", tags=["avatar"])
def save_avatar(request: Request, avatar: Avatar):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer" ) or auth not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user = sessions[auth]
    avatars[user] = avatar
    
@app.get("/api/get-avatar/", tags=["avatar"])
def get_avatar(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer" ) or auth not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user = sessions[auth]
    return { "avatar": avatars[user] }
    

# @app.get("/api/profile")
# def profileData(token: str):
#     if token not in sessions:
#         raise HTTPException(status_code=401, detail="Unauthorized")

#     return { "username": sessions[token] }