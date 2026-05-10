from datetime import date

from app.services.firestore_client import get_firestore_client

DEMO_HOLDINGS = [
    {"symbol": "AAPL", "shares": 10, "avg_cost": 150.0, "purchase_date": "2024-01-15"},
    {"symbol": "MSFT", "shares": 5, "avg_cost": 380.0, "purchase_date": "2024-02-01"},
    {"symbol": "GOOGL", "shares": 8, "avg_cost": 140.0, "purchase_date": "2024-03-10"},
    {"symbol": "NVDA", "shares": 3, "avg_cost": 450.0, "purchase_date": "2024-06-01"},
    {"symbol": "AMZN", "shares": 4, "avg_cost": 175.0, "purchase_date": "2024-04-20"},
]


def seed_portfolio() -> None:
    db = get_firestore_client()
    portfolio_ref = db.collection("portfolios").document("demo")

    if portfolio_ref.get().exists:
        print("Demo portfolio already exists, skipping seed.")
        return

    portfolio_ref.set({"name": "Fictional Goggles Demo"})
    holdings_ref = portfolio_ref.collection("holdings")

    for holding in DEMO_HOLDINGS:
        holdings_ref.document(holding["symbol"]).set(holding)

    print(f"Seeded {len(DEMO_HOLDINGS)} holdings into demo portfolio.")


if __name__ == "__main__":
    seed_portfolio()
