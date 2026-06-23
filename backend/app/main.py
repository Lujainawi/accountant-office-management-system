import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.clients import router as clients_router
from app.routes.dashboard import router as dashboard_router
from app.routes.documents import router as documents_router
from app.routes.health import router as health_router
from app.routes.integrations import router as integrations_router
from app.routes.payments import router as payments_router
from app.routes.reports import router as reports_router
from app.routes.settings import router as settings_router
from app.routes.tasks import router as tasks_router
from app.routes.vat import router as vat_router

logger = logging.getLogger(__name__)

UNEXPECTED_ERROR_MESSAGE = "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר."


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Accountant Office Management API", lifespan=lifespan)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": UNEXPECTED_ERROR_MESSAGE},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(clients_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(vat_router, prefix="/api")
app.include_router(integrations_router, prefix="/api")
