"""Minimal QR image API for Laravel Event-mvp."""

import base64
import io
import os
from typing import Annotated

import qrcode
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

app = FastAPI(title="QR Ticket Service", version="1.0.0")

api_key_header = APIKeyHeader(name="X-Api-Key", auto_error=False)


def verify_api_key(x_api_key: Annotated[str | None, Depends(api_key_header)]) -> None:
    expected = os.environ.get("API_KEY", "")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


class GenerateRequest(BaseModel):
    data: str = Field(..., min_length=1, max_length=2048)
    foreground: str = Field(default="#E91E63", max_length=32)
    background: str = Field(default="#FFFFFF", max_length=32)


class GenerateResponse(BaseModel):
    format: str = "png"
    image_base64: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(
    body: GenerateRequest,
    _: Annotated[None, Depends(verify_api_key)],
) -> GenerateResponse:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(body.data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=body.foreground, back_color=body.background)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw = buf.getvalue()

    return GenerateResponse(
        format="png",
        image_base64=base64.b64encode(raw).decode("ascii"),
    )
