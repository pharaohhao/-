"""初始化管理员账号"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal
from app.models import User
from app.core.security import hash_password

ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@relationship.local"
ADMIN_PASSWORD = "admin123"

db = SessionLocal()
existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()

if existing:
    existing.is_admin = True
    existing.password_hash = hash_password(ADMIN_PASSWORD)
    db.commit()
    print(f"管理员已更新: {ADMIN_USERNAME}")
else:
    user = User(
        username=ADMIN_USERNAME,
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        is_admin=True,
    )
    db.add(user)
    db.commit()
    print(f"管理员已创建: {ADMIN_USERNAME}")

print(f"用户名: {ADMIN_USERNAME}")
print(f"密码: {ADMIN_PASSWORD}")
db.close()
