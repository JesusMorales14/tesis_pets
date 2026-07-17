from fastapi import APIRouter, Depends

from services.payment_service import PaymentService, get_payment_service

router = APIRouter(tags=["payment-config"])


@router.get("/payment-config")
def get_payment_config(service: PaymentService = Depends(get_payment_service)):
    return service.get_payment_config()
