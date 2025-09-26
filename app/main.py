from __future__ import annotations

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .models import AskRequest, AskResponse
from .db import get_engine, initialize_dirty_schema, fetch_schema_snapshot, run_select_sql
from .ai import (
    generate_sql_from_question,
    repair_sql_on_error,
    explain_results,
    suggest_chart_type,
    clean_tabular_data,
)


app = FastAPI(title="NL2SQL Analytics API", version="1.0.0")

# CORS for local dev and generic frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ENGINE = get_engine()


@app.on_event("startup")
def on_startup() -> None:
    initialize_dirty_schema(ENGINE)


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    try:
        schema_snapshot = fetch_schema_snapshot(ENGINE)
        sql = generate_sql_from_question(request.question, schema_snapshot)
        try:
            columns, data = run_select_sql(ENGINE, sql)
        except Exception as e:  # noqa: BLE001
            # Attempt a single repair using the error text
            repaired_sql = repair_sql_on_error(request.question, schema_snapshot, sql, str(e))
            columns, data = run_select_sql(ENGINE, repaired_sql)
            sql = repaired_sql

        cleaned_cols, cleaned_data = clean_tabular_data(columns, data)
        explanation = explain_results(request.question, sql, cleaned_cols, cleaned_data)
        chart = suggest_chart_type(cleaned_cols, cleaned_data)

        return AskResponse(
            sql=sql,
            columns=cleaned_cols,
            data=cleaned_data,
            explanation=explanation,
            chart=chart,
        )
    except ValidationError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


def get_app() -> FastAPI:
    return app
