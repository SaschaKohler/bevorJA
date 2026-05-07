# Vorja - Hochzeits Audio- und Kartenboxen

Vorja ist ein E-Commerce-Shop fuer hochwertige Audio- und Kartenboxen fuer Hochzeiten. Gaeste koennen persoenliche Sprachnachrichten und Wuensche hinterlassen, die fuer immer aufbewahrt werden.

## Tech Stack

- **Backend**: Django 6 + Django REST Framework
- **Frontend**: React 19 + Vite + TailwindCSS
- **Python Management**: uv
- **Zahlung**: Stripe Checkout Sessions
- **Deployment**: k3s Cluster mit GitHub Actions CI/CD

## Lokale Entwicklung

### Voraussetzungen

- Python 3.13+ mit [uv](https://docs.astral.sh/uv/)
- Node.js 22+
- npm

### Backend starten

```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py seed_products
uv run python manage.py runserver
```

Backend laeuft auf http://localhost:8000

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend laeuft auf http://localhost:5173 (Proxy zum Backend konfiguriert)

### Admin-Zugang erstellen

```bash
cd backend
uv run python manage.py createsuperuser
```

## Umgebungsvariablen

### Backend (`backend/.env`)

| Variable | Beschreibung |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django Secret Key |
| `DJANGO_DEBUG` | Debug-Modus (True/False) |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret |

### Frontend (`frontend/.env`)

| Variable | Beschreibung |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (leer fuer Vite Proxy) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |

## Deployment

Das Projekt wird auf einem k3s Cluster unter `vorja.ja-zum-leben.at` deployed.

```bash
kubectl apply -f k8s/
```

CI/CD ist ueber GitHub Actions konfiguriert. Push auf `main` loest automatisch Build und Deployment aus.

## Produkte

- **Vorja Mini** (12 Karten) - 49,90 EUR
- **Vorja Classic** (24 Karten) - 79,90 EUR
- **Vorja Premium** (48 Karten) - 119,90 EUR
