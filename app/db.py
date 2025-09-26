from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Row


DATA_DIR = Path(os.environ.get("DATA_DIR", "/workspace/data")).resolve()
DB_PATH = DATA_DIR / "dirty.db"
SQLALCHEMY_URL = f"sqlite:///{DB_PATH}"


def get_engine() -> Engine:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    engine = create_engine(SQLALCHEMY_URL, future=True)
    return engine


def initialize_dirty_schema(engine: Engine) -> None:
    """
    Create and seed a deliberately dirty schema with awkward table/column names.
    Idempotent: safe to call multiple times.
    """
    with engine.begin() as connection:
        # Users table with special characters and mixed casing
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS "tbl_Usrs" (
                    "id" INTEGER PRIMARY KEY,
                    "usr_nm" TEXT,
                    "State/Region" TEXT,
                    "dt_created" TEXT,
                    "age(yrs)" INTEGER
                );
                """
            )
        )

        # Orders table with funky names
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS "orderz" (
                    "id" INTEGER PRIMARY KEY,
                    "usr_id" INTEGER,
                    "catg" TEXT,
                    "q_ty" INTEGER,
                    "amt$" REAL,
                    "order_date" TEXT
                );
                """
            )
        )

        # Seed if empty
        users_count = connection.execute(text('SELECT COUNT(1) FROM "tbl_Usrs"')).scalar_one()
        orders_count = connection.execute(text('SELECT COUNT(1) FROM "orderz"')).scalar_one()

        if users_count == 0:
            base_date = datetime(2023, 1, 1)
            users = [
                {"id": 1, "usr_nm": "Alice", "State/Region": "CA", "dt_created": (base_date + timedelta(days=1)).date().isoformat(), "age(yrs)": 31},
                {"id": 2, "usr_nm": "Bob", "State/Region": "NY", "dt_created": (base_date + timedelta(days=5)).date().isoformat(), "age(yrs)": 44},
                {"id": 3, "usr_nm": "Carlos", "State/Region": "TX", "dt_created": (base_date + timedelta(days=10)).date().isoformat(), "age(yrs)": 27},
                {"id": 4, "usr_nm": "Diana", "State/Region": "WA", "dt_created": (base_date + timedelta(days=15)).date().isoformat(), "age(yrs)": 37},
                {"id": 5, "usr_nm": "Eve", "State/Region": "CA", "dt_created": (base_date + timedelta(days=20)).date().isoformat(), "age(yrs)": 29},
            ]
            for u in users:
                connection.execute(
                    text(
                        'INSERT INTO "tbl_Usrs" ("id", "usr_nm", "State/Region", "dt_created", "age(yrs)")\
                         VALUES (:id, :usr_nm, :state, :dt, :age)'
                    ),
                    {"id": u["id"], "usr_nm": u["usr_nm"], "state": u["State/Region"], "dt": u["dt_created"], "age": u["age(yrs)"]},
                )

        if orders_count == 0:
            base_date = datetime(2024, 1, 1)
            orders = [
                {"id": 1, "usr_id": 1, "catg": "Electronics", "q_ty": 1, "amt$": 399.99, "order_date": (base_date + timedelta(days=3)).date().isoformat()},
                {"id": 2, "usr_id": 1, "catg": "Grocery", "q_ty": 12, "amt$": 58.65, "order_date": (base_date + timedelta(days=7)).date().isoformat()},
                {"id": 3, "usr_id": 2, "catg": "Grocery", "q_ty": 5, "amt$": 22.10, "order_date": (base_date + timedelta(days=8)).date().isoformat()},
                {"id": 4, "usr_id": 3, "catg": "Sports", "q_ty": 2, "amt$": 120.00, "order_date": (base_date + timedelta(days=20)).date().isoformat()},
                {"id": 5, "usr_id": 4, "catg": "Electronics", "q_ty": 1, "amt$": 899.00, "order_date": (base_date + timedelta(days=25)).date().isoformat()},
                {"id": 6, "usr_id": 5, "catg": "Sports", "q_ty": 3, "amt$": 210.50, "order_date": (base_date + timedelta(days=40)).date().isoformat()},
                {"id": 7, "usr_id": 5, "catg": "Home", "q_ty": 1, "amt$": 35.00, "order_date": (base_date + timedelta(days=65)).date().isoformat()},
            ]
            for o in orders:
                connection.execute(
                    text(
                        'INSERT INTO "orderz" ("id", "usr_id", "catg", "q_ty", "amt$", "order_date")\
                         VALUES (:id, :usr_id, :catg, :qty, :amt, :od)'
                    ),
                    {"id": o["id"], "usr_id": o["usr_id"], "catg": o["catg"], "qty": o["q_ty"], "amt": o["amt$"], "od": o["order_date"]},
                )


def fetch_schema_snapshot(engine: Engine, row_limit_per_table: int = 3) -> str:
    """
    Return a concise schema snapshot of tables, columns, and a few sample rows for the LLM.
    """
    with engine.begin() as connection:
        tables = connection.execute(
            text("""
                SELECT name FROM sqlite_master
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            """)
        ).scalars().all()

        lines: List[str] = []
        for tbl in tables:
            lines.append(f"TABLE \"{tbl}\"")
            pragma = connection.execute(text(f'PRAGMA table_info("{tbl}")'))
            cols = [f'"{r[1]}" {r[2]}' for r in pragma.fetchall()]
            lines.append("  COLUMNS: " + ", ".join(cols))
            sample_rows = connection.execute(text(f'SELECT * FROM "{tbl}" LIMIT :lim'), {"lim": row_limit_per_table}).fetchall()
            if sample_rows:
                header = [c for c in sample_rows[0]._mapping.keys()]
                lines.append("  SAMPLE:")
                for r in sample_rows:
                    row_map = {k: r._mapping[k] for k in header}
                    lines.append("    " + str(row_map))
        return "\n".join(lines)


def run_select_sql(engine: Engine, sql: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Execute a read-only SQL statement and return (columns, rows_as_dicts).
    """
    with engine.begin() as connection:
        result = connection.execute(text(sql))
        rows: List[Row[Any]] = result.fetchall()
        columns = list(result.keys())
        data: List[Dict[str, Any]] = []
        for row in rows:
            mapping = row._mapping
            data.append({col: mapping[col] for col in columns})
        return columns, data
