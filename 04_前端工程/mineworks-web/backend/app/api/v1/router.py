from fastapi import APIRouter
from app.api.v1.routes import auth, billing, dry_solids, health, history, slurry_density

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(billing.router)
api_router.include_router(dry_solids.router)
api_router.include_router(slurry_density.router)
api_router.include_router(history.router)
