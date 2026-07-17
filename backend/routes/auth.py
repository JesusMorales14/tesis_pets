from fastapi import APIRouter, Depends, Request

from models import User
from rate_limiter import limiter
from schemas.auth import RegisterBody, LoginBody, ChangePasswordBody
from services.auth_service import (
    AuthService, get_auth_service, get_current_user, user_out,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, body: RegisterBody, service: AuthService = Depends(get_auth_service)):
    return service.register(body)


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, body: LoginBody, service: AuthService = Depends(get_auth_service)):
    return service.login(body)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return user_out(current_user)


@router.put("/change-password")
def change_password(
    body: ChangePasswordBody,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.change_password(current_user, body)


@router.get("/me/export")
def export_my_data(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.export_my_data(current_user)


@router.delete("/me")
def delete_my_account(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.delete_my_account(current_user)
