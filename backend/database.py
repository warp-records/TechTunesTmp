
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///techtunes.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    stripe_customer_id = Column(String, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    auto_donate = Column(String, nullable=True)
    underage = Column(Boolean, nullable=False)
    admin = Column(Boolean, nullable=False)
    restricted = Column(DateTime, nullable=True)
    banned = Column(DateTime, nullable=True)
    ban_message = Column(String, nullable=True)
    
class SessionDB(Base):
    __tablename__ = "sessions"
    
    token = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
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

    id = Column(Integer, primary_key=True, autoincrement=True)
    tile_number = Column(Integer, nullable=False)
    instrument = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)