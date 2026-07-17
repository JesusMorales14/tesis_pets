from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def commit(self) -> None:
        self.db.commit()

    def delete(self, user: User) -> None:
        self.db.delete(user)


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)
