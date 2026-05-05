
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Numeric
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    join_date = Column(DateTime, nullable=False)
    beta_tester = Column(Boolean, nullable=False)
    stripe_customer_id = Column(String, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    auto_donate = Column(String, nullable=True)
    underage = Column(Boolean, nullable=False)
    admin = Column(Boolean, nullable=False)
    restricted = Column(DateTime, nullable=True)
    banned = Column(DateTime, nullable=True)
    ban_message = Column(String, nullable=True)
    score = Column(Integer, nullable=False, default=0)
    
class SessionDB(Base):
    __tablename__ = "sessions"

    token        = Column(String, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=True)
    nonprofit_id = Column(Integer, ForeignKey("nonprofits.id"), nullable=True)

class AvatarDB(Base):
    __tablename__ = "avatars"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    form = Column(Integer, nullable=False)
    bodyTexture = Column(String, nullable=False)
    active_items = Column(Text, nullable=False)
    
class SongDB(Base):
    __tablename__ = "songs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    instrument = Column(String, nullable=False)
    tempo = Column(Integer, nullable=False)
    difficulty = Column(Integer, nullable=True)
    
    musicxml_path = Column(String, nullable=False)
    json_path = Column(String, nullable=False)

class LessonTileDB(Base):
    __tablename__ = "lesson_tiles"

    tile_number = Column(Integer, primary_key=True)
    instrument = Column(String, primary_key=True)
    level = Column(String, primary_key=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)

class NonProfitDB(Base):
    __tablename__ = "nonprofits"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    name          = Column(String, unique=True, nullable=False)
    email         = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_verified        = Column(Boolean, nullable=False, default=False)
    balance            = Column(Integer, nullable=False, default=0)
    stripe_bank_token   = Column(String, nullable=True)

class ProgressDB(Base):
    __tablename__ = "progress"

    user_id       = Column(Integer, ForeignKey("users.id"), primary_key=True)
    instrument    = Column(String, primary_key=True)
    level         = Column(String, primary_key=True)
    unlocked_tile = Column(Integer, nullable=False, default=1)

class UsedKeyDB(Base):
    __tablename__ = "used_keys"

    key      = Column(String, primary_key=True)
    used_by  = Column(Integer, ForeignKey("users.id"), nullable=False)

def init_db():
    Base.metadata.create_all(bind=engine)