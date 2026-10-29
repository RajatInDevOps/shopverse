"""orders — the checkout service.

Holds baskets in memory. That is a deliberate choice, not a shortcut waiting
to be fixed: a database would add a container to start, a migration to run and
a connection to fail, and would demonstrate nothing about the delivery
pipeline that this does not already show.
"""

import os
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="ShopVerse Orders")

# order id -> the lines it contains
_orders: Dict[str, List[dict]] = {}


class OrderLine(BaseModel):
    sku: str
    quantity: int
    price: float


class OrderRequest(BaseModel):
    customer: str
    lines: List[OrderLine]


def order_total(lines: List[OrderLine]) -> float:
    """What the customer pays.

    Rounded to two decimal places at the end rather than per line: summing
    already-rounded lines drifts, and a total that disagrees with the sum of
    its parts is the kind of bug nobody finds until a customer does.
    """
    return round(sum(line.price * line.quantity for line in lines), 2)


@app.get("/health")
def health():
    return {"status": "ok", "service": "orders", "orders": len(_orders)}


@app.get("/orders")
def list_orders():
    return [{"id": oid, "lines": lines} for oid, lines in _orders.items()]


@app.post("/orders")
def place_order(request: OrderRequest):
    if not request.lines:
        raise HTTPException(status_code=400, detail="An order needs at least one line.")

    order_id = f"ord-{len(_orders) + 1:04d}"
    _orders[order_id] = [line.model_dump() for line in request.lines]

    return {
        "id": order_id,
        "customer": request.customer,
        "total": order_total(request.lines),
        "status": "confirmed",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
