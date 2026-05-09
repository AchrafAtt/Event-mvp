"""Analytics chart API for Event-mvp: pandas + matplotlib, PNG/PDF output."""

from __future__ import annotations

import base64
import io
import os
from typing import Annotated, Literal

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import pandas as pd
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

app = FastAPI(title="Analytics Service", version="1.0.0")

api_key_header = APIKeyHeader(name="X-Api-Key", auto_error=False)


def verify_api_key(x_api_key: Annotated[str | None, Depends(api_key_header)]) -> None:
    expected = os.environ.get("API_KEY", "")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


class MetaBlock(BaseModel):
    range_start: str
    range_end: str
    currency_label: str = "DH"
    revenue_note: str = ""
    reservations_note: str = ""
    capacity_note: str = ""


class RevenueRow(BaseModel):
    period: str
    amount: float


class ReservationRow(BaseModel):
    period: str
    en_attente: int = 0
    confirmee: int = 0
    annulee: int = 0


class CapacityRow(BaseModel):
    event_date: str
    reservation_count: int = 0
    guests: int = 0


class AnalyticsPayload(BaseModel):
    meta: MetaBlock
    revenue_by_month: list[RevenueRow] = Field(default_factory=list)
    reservations_by_month: list[ReservationRow] = Field(default_factory=list)
    capacity_projection: list[CapacityRow] = Field(default_factory=list)


class RenderRequest(BaseModel):
    format: Literal["png", "pdf"] = "png"
    payload: AnalyticsPayload


class RenderResponse(BaseModel):
    format: Literal["png", "pdf"]
    content_base64: str


def apply_style() -> None:
    plt.rcParams.update(
        {
            "font.size": 9,
            "axes.titlesize": 11,
            "axes.labelsize": 9,
            "figure.facecolor": "white",
            "axes.facecolor": "#FCE4EC",
            "axes.edgecolor": "#E0E0E0",
            "axes.labelcolor": "#333333",
            "text.color": "#333333",
            "xtick.color": "#777777",
            "ytick.color": "#777777",
            "grid.color": "#E0E0E0",
            "grid.linestyle": "--",
        }
    )


def draw_revenue(ax: plt.Axes, df: pd.DataFrame, meta: MetaBlock) -> None:
    if df.empty:
        ax.text(0.5, 0.5, "Aucune donnée de revenu sur la période", ha="center", va="center")
        ax.set_axis_off()
        return
    ax.bar(df["period"], df["amount"], color="#E91E63", edgecolor="#C2185B")
    ax.set_xlabel("Mois")
    ax.set_ylabel(f"Montant ({meta.currency_label})")
    ax.set_title("Revenus (avances validées)")
    ax.tick_params(axis="x", rotation=45)
    ax.grid(True, axis="y")


def draw_reservations(ax: plt.Axes, df: pd.DataFrame) -> None:
    if df.empty:
        ax.text(0.5, 0.5, "Aucune réservation sur la période", ha="center", va="center")
        ax.set_axis_off()
        return
    x = range(len(df))
    w = 0.25
    ax.bar([i - w for i in x], df["en_attente"], width=w, label="En attente", color="#F59E0B")
    ax.bar(x, df["confirmee"], width=w, label="Confirmée", color="#4CAF50")
    ax.bar([i + w for i in x], df["annulee"], width=w, label="Annulée", color="#F44336")
    ax.set_xticks(list(x))
    ax.set_xticklabels(df["period"], rotation=45, ha="right")
    ax.set_xlabel("Mois (date de réservation)")
    ax.set_ylabel("Nombre")
    ax.set_title("Réservations par statut")
    ax.legend(loc="upper right", fontsize=8)
    ax.grid(True, axis="y")


def draw_capacity(ax: plt.Axes, df: pd.DataFrame) -> None:
    if df.empty:
        ax.text(0.5, 0.5, "Aucune projection capacité sur la période", ha="center", va="center")
        ax.set_axis_off()
        return
    ax.bar(df["event_date"], df["guests"], color="#3F51B5", edgecolor="#303F9F", alpha=0.85)
    ax.set_xlabel("Date d'événement")
    ax.set_ylabel("Invités (somme)")
    ax.set_title("Capacité estimée (projection — confirmées par date d'événement)")
    ax.tick_params(axis="x", rotation=45)
    ax.grid(True, axis="y")


def dataframes_from_payload(payload: AnalyticsPayload) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    df_rev = pd.DataFrame([r.model_dump() for r in payload.revenue_by_month])
    df_res = pd.DataFrame([r.model_dump() for r in payload.reservations_by_month])
    df_cap = pd.DataFrame([r.model_dump() for r in payload.capacity_projection])
    return df_rev, df_res, df_cap


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/render", response_model=RenderResponse)
def render_chart(
    body: RenderRequest,
    _: Annotated[None, Depends(verify_api_key)],
) -> RenderResponse:
    apply_style()
    meta = body.payload.meta
    df_rev, df_res, df_cap = dataframes_from_payload(body.payload)
    fmt = body.format

    buf = io.BytesIO()
    try:
        if fmt == "png":
            fig, axes = plt.subplots(nrows=3, ncols=1, figsize=(9, 11), height_ratios=[1, 1, 1])
            fig.suptitle(
                f"Rapport {meta.range_start} → {meta.range_end}",
                fontsize=12,
                color="#333333",
                y=0.995,
            )
            draw_revenue(axes[0], df_rev, meta)
            draw_reservations(axes[1], df_res)
            draw_capacity(axes[2], df_cap)
            fig.tight_layout(rect=(0, 0, 1, 0.98))
            fig.savefig(buf, format="png", dpi=120, bbox_inches="tight")
            plt.close(fig)
        else:
            fig1, ax1 = plt.subplots(figsize=(9, 4))
            draw_revenue(ax1, df_rev, meta)
            fig1.tight_layout()
            fig2, ax2 = plt.subplots(figsize=(9, 4))
            draw_reservations(ax2, df_res)
            fig2.tight_layout()
            fig3, ax3 = plt.subplots(figsize=(9, 4))
            draw_capacity(ax3, df_cap)
            fig3.tight_layout()
            with PdfPages(buf) as pdf:
                pdf.savefig(fig1, bbox_inches="tight")
                pdf.savefig(fig2, bbox_inches="tight")
                pdf.savefig(fig3, bbox_inches="tight")
            plt.close(fig1)
            plt.close(fig2)
            plt.close(fig3)

        raw = buf.getvalue()
        if not raw:
            raise HTTPException(status_code=500, detail="Empty output")

        return RenderResponse(
            format=fmt,
            content_base64=base64.b64encode(raw).decode("ascii"),
        )
    finally:
        buf.close()
