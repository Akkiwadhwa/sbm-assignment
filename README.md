# Expense Tracker Application

A full-stack expense tracking application built with Django REST Framework (backend) and React (frontend).

## Features

### 1. Full CRUD Operations
- **Create** new expenses with title, amount, currency, category, date, and description
- **Read** expenses in a list view with filtering capabilities
- **Update** existing expenses via modal form
- **Delete** expenses with confirmation

### 2. Data Visualization & Reporting
- **Dashboard** with key metrics:
  - Total expenses
  - Number of expenses
  - Categories used
  - Average expense amount
- **Pie Chart** showing spending by category
- **Line Chart** showing monthly spending trends
- **Category Breakdown Table** with percentages

### 3. Third-Party API Integration
- **Currency Converter** using exchangerate.host API
- View current exchange rates for major currencies
- Convert amounts between different currencies

## Tech Stack

### Backend
- Python 3.11+
- Django 5.x
- Django REST Framework
- PostgreSQL
- Gunicorn (production server)
- WhiteNoise (static files)

### Frontend
- React 18
- Chart.js (data visualization)
- Axios (HTTP client)
- date-fns (date formatting)

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your database credentials
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
python manage.py migrate

# Seed sample data (optional)
python manage.py seed_data

# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Run development server
npm start
```

## Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Access the application at http://localhost:3001
```

## API Endpoints

### Expenses
- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/` - Create new expense
- `GET /api/expenses/{id}/` - Get expense details
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense
- `GET /api/expenses/stats/` - Get expense statistics

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create new category
- `DELETE /api/categories/{id}/` - Delete category

### Exchange Rates (Third-Party API Integration)
- `GET /api/exchange-rates/` - Get current exchange rates
- `POST /api/convert-currency/` - Convert currency amount

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Deployment

The application is configured for deployment on platforms like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

### Backend Deployment
1. Set environment variables in your hosting platform
2. The `Procfile` handles running migrations and starting Gunicorn

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to a static hosting service
3. Set `REACT_APP_API_URL` to your backend URL

## License

MIT
