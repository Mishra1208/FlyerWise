"""
FlyerWise Database Connection

SQLAlchemy engine and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings


import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

logger = logging.getLogger("flyerwise.database")
settings = get_settings()

raw_url = os.getenv("DATABASE_URL") or settings.database_url

if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+psycopg://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Attempt to connect to primary DB, fallback to SQLite if PostgreSQL is unreachable in cloud
try:
    if "sqlite" in raw_url:
        engine = create_engine(raw_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(raw_url, pool_size=10, max_overflow=20, pool_pre_ping=True, connect_args={"connect_timeout": 3})
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("✅ Primary database connection verified!")
except Exception as err:
    seed_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "flyerwise_seed.db"))
    cloud_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "flyerwise_cloud.db"))
    
    if os.path.exists(seed_path) and not os.path.exists(cloud_path):
        import shutil
        shutil.copyfile(seed_path, cloud_path)
        logger.info("🎉 Seeded cloud database with 19,300+ grocery products!")

    target_db = cloud_path if os.path.exists(cloud_path) else (seed_path if os.path.exists(seed_path) else "flyerwise_fallback.db")
    engine = create_engine(f"sqlite:///{target_db}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """
    Dependency that provides a database session.
    Used in FastAPI endpoint dependency injection.

    Usage:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
