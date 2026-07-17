import os
import secrets
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# SECRET_KEY y ADMIN_CODE NUNCA deben tener un valor por defecto fijo en el
# código fuente: este proyecto es público en GitHub, así que un valor fijo
# aquí equivale a publicarlo. En producción, defínelos como variables de
# entorno (ver backend/.env.example). Sin .env (desarrollo local / tests /
# CI), se genera un valor aleatorio distinto en cada arranque del proceso:
# los tokens dejan de ser válidos al reiniciar y el código de admin cambia
# cada vez, pero es la única opción que no expone un secreto real en el
# repositorio. ADMIN_CODE generado se imprime una vez para poder usarlo en
# desarrollo local.
SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
EXPIRE_DAYS = int(os.getenv("TOKEN_EXPIRE_DAYS", "7"))

ADMIN_CODE = os.getenv("ADMIN_CODE")
if not ADMIN_CODE:
    ADMIN_CODE = secrets.token_hex(8)
    print(f"[auth_utils] ADMIN_CODE no definido en el entorno — usando uno generado para esta sesión: {ADMIN_CODE}")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_token(user_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(days=EXPIRE_DAYS)
    return jwt.encode(
        {"user_id": user_id, "role": role, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
