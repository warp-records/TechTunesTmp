import uuid

from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel

app = FastAPI()

users = {}
sessions = {}

class User(BaseModel):
    username: str
    password: str
    
@app.post("/api/register")
def register(user: User):
    if user.username in users:
        raise HTTPException(status_code=409, detail="Username already taken")
    
    users[user.username] = user.password
    token = str(uuid.uuid4())
    sessions[token] = user.username
    
    print("Registered: " + user.username + " : " + user.password)
    return { 
        "message": "User created",
        "username": user.username,
        "token": token,
    }

# @app.get("/api/profile")
# def profileData(token: str):
#     if token not in sessions:
#         raise HTTPException(status_code=401, detail="Unauthorized")
    
#     return { "username": sessions[token] }