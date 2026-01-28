# Expense Tracker - Backend

A Django REST Framework backend for the Expense Tracker application with PostgreSQL database, full CRUD APIs, and third-party exchange rate integration.

## Features

### 1. Full CRUD REST APIs
- Complete RESTful API for expense management
- Category management endpoints
- Filtering and pagination support
- Statistics endpoint for dashboard data

### 2. Data Models
- **Category**: Expense categories with colors and icons
- **Expense**: Transactions with amount, currency, date, and category

### 3. Third-Party API Integration
- Live exchange rates from open.er-api.com and frankfurter.app
- Currency conversion endpoint
- Automatic fallback to cached rates

## Tech Stack

- **Django 5.x** - Web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Database
- **psycopg2** - PostgreSQL adapter
- **Gunicorn** - WSGI server
- **WhiteNoise** - Static file serving
- **requests** - HTTP library for external APIs

## Project Structure

```
backend/
├── expense_tracker/        # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── expenses/               # Main application
│   ├── models.py          # Category, Expense models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # ViewSets and API views
│   ├── urls.py            # URL routing
│   ├── admin.py           # Admin configuration
│   └── management/
│       └── commands/
│           └── seed_data.py  # Sample data generator
├── .env                   # Environment variables
├── requirements.txt       # Python dependencies
├── Procfile              # Deployment configuration
├── Dockerfile
└── manage.py
```

## API Endpoints

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | List all expenses (paginated) |
| POST | `/api/expenses/` | Create new expense |
| GET | `/api/expenses/{id}/` | Retrieve expense |
| PUT | `/api/expenses/{id}/` | Update expense |
| PATCH | `/api/expenses/{id}/` | Partial update |
| DELETE | `/api/expenses/{id}/` | Delete expense |
| GET | `/api/expenses/stats/` | Get statistics for dashboard |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | List all categories |
| POST | `/api/categories/` | Create category |
| DELETE | `/api/categories/{id}/` | Delete category |

### Exchange Rates (Third-Party Integration)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exchange-rates/` | Get live exchange rates |
| POST | `/api/convert-currency/` | Convert currency amount |

### Query Parameters (Expenses)
- `category` - Filter by category ID
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)

## Setup & Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 15+

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE expense_tracker;
```

2. Configure environment variables in `.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

3. Run migrations:
```bash
python manage.py migrate
```

4. (Optional) Seed sample data:
```bash
python manage.py seed_data
```

5. Create admin user:
```bash
python manage.py createsuperuser
```

## Running the Application

### Development Server

```bash
python manage.py runserver
```

API available at [http://localhost:8000/api/](http://localhost:8000/api/)

Admin panel at [http://localhost:8000/admin/](http://localhost:8000/admin/)

### Production (Gunicorn)

```bash
gunicorn expense_tracker.wsgi:application --bind 0.0.0.0:8000
```

### Docker

```bash
docker build -t expense-tracker-backend .
docker run -p 8000:8000 expense-tracker-backend
```

## API Examples

### Create Expense
```bash
curl -X POST http://localhost:8000/api/expenses/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 85.50,
    "currency": "USD",
    "category": 1,
    "description": "Weekly groceries",
    "date": "2026-01-28"
  }'
```

### Get Statistics
```bash
curl http://localhost:8000/api/expenses/stats/
```

### Convert Currency
```bash
curl -X POST http://localhost:8000/api/convert-currency/ \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "from_currency": "USD",
    "to_currency": "EUR"
  }'
```

### Get Exchange Rates
```bash
curl http://localhost:8000/api/exchange-rates/?base=USD
```

## Third-Party API Integration

The application integrates with free exchange rate APIs:

1. **Primary**: [open.er-api.com](https://open.er-api.com) - Free, no API key required
2. **Fallback**: [frankfurter.app](https://www.frankfurter.app) - Free, no API key required

If both APIs are unavailable, cached exchange rates are used.

## Deployment

### Heroku / Railway
The `Procfile` is configured for deployment:
```
web: gunicorn expense_tracker.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

### Environment Variables for Production
```env
DEBUG=False
SECRET_KEY=<secure-random-key>
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_HOST=<database-host>
DB_PORT=5432
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## Models

### Category
```python
- name: CharField (unique)
- color: CharField (hex color)
- icon: CharField
- created_at: DateTimeField
```

### Expense
```python
- title: CharField
- amount: DecimalField
- currency: CharField (default: USD)
- category: ForeignKey(Category)
- description: TextField
- date: DateField
- created_at: DateTimeField
- updated_at: DateTimeField
```

## License

MIT
