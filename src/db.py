from sqlalchemy import ARRAY, create_engine, Column, Integer, String,Float
from sqlalchemy.orm import sessionmaker, declarative_base
from pgvector.sqlalchemy import Vector

DB_URL = "postgresql+psycopg2://postgres:Welkome01$@localhost:5432/artscope"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Artwork(Base):
    __tablename__ = "artworks"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    artist = Column(String)
    description = Column(String)
    embedding = Column(ARRAY(Float))  # MobileNet output dimension

Base.metadata.create_all(engine)
