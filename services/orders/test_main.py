"""Tests for the orders service.

These assert the service's own rules — the total, the rejection of an empty
basket, the shape of the health response. They are the project's tests, not
generated ones.
"""

from fastapi.testclient import TestClient

from main import OrderLine, app, order_total

client = TestClient(app)


def test_order_total_multiplies_quantity():
    lines = [
        OrderLine(sku="sku-1", quantity=2, price=89.00),
        OrderLine(sku="sku-3", quantity=1, price=62.25),
    ]
    assert order_total(lines) == 240.25


def test_order_total_rounds_once_at_the_end():
    # Three lines that each round down on their own. Rounding per line gives
    # 99.99; rounding the sum gives 100.00, which is what the customer owes.
    #
    # Deliberately not 33.335: that totals exactly 100.005, a half-cent,
    # where Python rounds to even and JavaScript rounds away from zero. The
    # web basket asserts the same rule, and a test on that boundary would
    # make the two disagree for a reason that has nothing to do with money.
    lines = [OrderLine(sku="s", quantity=1, price=33.333) for _ in range(3)]
    assert order_total(lines) == 100.00


def test_empty_order_is_rejected():
    response = client.post("/orders", json={"customer": "ada", "lines": []})
    assert response.status_code == 400


def test_placing_an_order_returns_a_confirmed_total():
    response = client.post(
        "/orders",
        json={
            "customer": "ada",
            "lines": [{"sku": "sku-1", "quantity": 2, "price": 89.00}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 178.00
    assert body["status"] == "confirmed"
    assert body["id"].startswith("ord-")


def test_health_reports_the_service_name():
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["service"] == "orders"
