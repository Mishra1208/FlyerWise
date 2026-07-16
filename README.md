# FlyerWise — Grocery Price Comparison Platform 🛒

> Search for any grocery product and instantly compare prices across Canadian stores. Stop overpaying.

## 🎯 What is FlyerWise?

FlyerWise scrapes weekly grocery flyer data from major Canadian retailers (Walmart, Maxi, Metro) and lets you compare prices across stores for any product — highlighting the lowest price so you always get the best deal.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Scraper** | Python, Selenium, BeautifulSoup |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **Frontend** | React (Vite) |
| **Deployment** | Vercel (Frontend) + Docker |

## 📦 Project Structure

```
flyerwise/
├── backend/          # FastAPI REST API
├── scraper/          # Selenium-based flyer scrapers
├── frontend/         # React (Vite) web app
├── db/               # SQL schema & seed data
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Chrome/Chromium (for scraper)

### 1. Clone & Setup Environment

```bash
git clone <your-repo-url>
cd SAVING
cp .env.example .env
# Edit .env with your settings
```

### 2. Start Database

```bash
docker compose up -d db
```

### 3. Run Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Run Scraper

```bash
cd scraper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 🏬 Supported Stores

| Store | Status | Region |
|-------|--------|--------|
| Walmart | 🟡 In Progress | Canada-wide |
| Maxi | 🟡 In Progress | Quebec |
| Metro | 🟡 In Progress | Quebec / Ontario |

## 📝 License

MIT
