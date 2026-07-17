"""Instancia del rate limiter, en su propio módulo hoja para evitar
import circular entre main.py y routes/*.py (los routers necesitan
@limiter.limit(...) pero main.py necesita importar los routers)."""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
