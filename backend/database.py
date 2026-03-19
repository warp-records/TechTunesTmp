
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
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
    
def init_db():
    Base.metadata.create_all(bind=engine)