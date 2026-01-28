# Expense Tracker - Frontend

A React-based frontend for the Expense Tracker application with full CRUD functionality, data visualization, and currency conversion.

## Features

### 1. Full CRUD Operations (UI)
- **Create** expenses via modal form with title, amount, currency, category, date, and description
- **Read** expenses in a sortable table with category badges
- **Update** expenses through the same modal interface
- **Delete** expenses with confirmation dialog

### 2. Data Visualization Dashboard
- **Summary Cards**: Total expenses, expense count, categories used, average per expense
- **Pie Chart**: Spending breakdown by category (Chart.js)
- **Line Chart**: Monthly spending trends over time
- **Category Breakdown Table**: Detailed stats with percentages
- **Recent Expenses**: Quick view of latest transactions

### 3. Currency Converter (Third-Party API)
- Convert between 8 major currencies (USD, EUR, GBP, JPY, CAD, AUD, INR, CNY)
- Live exchange rates from open.er-api.com
- Display current exchange rate table

## Tech Stack

- **React 18** - UI Framework
- **Chart.js / react-chartjs-2** - Data visualization
- **Axios** - HTTP client for API requests
- **date-fns** - Date formatting

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   └── index.js            # Entry point
├── .env                    # Environment variables
├── package.json
└── Dockerfile
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your backend API URL
```

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Running the Application

### Development Mode

```bash
npm start
```

Opens at [http://localhost:3001](http://localhost:3001)

### Production Build

```bash
npm run build
```

Creates optimized build in `build/` folder.

### Docker

```bash
docker build -t expense-tracker-frontend .
docker run -p 80:80 expense-tracker-frontend
```

## Components

### App.js
Main component containing:
- **Dashboard** - Statistics and charts
- **ExpenseList** - Table with CRUD actions
- **ExpenseModal** - Form for create/edit
- **CurrencyConverter** - Currency conversion tool

### API Service (services/api.js)
Centralized API calls:
- `expenseApi` - CRUD operations for expenses
- `categoryApi` - Category management
- `exchangeApi` - Exchange rate and conversion

## Screenshots

### Dashboard View
- Summary statistics cards
- Pie chart for category breakdown
- Line chart for monthly trends

### Expenses List
- Full table with all expenses
- Edit and Delete buttons
- Add Expense button

### Currency Converter
- Amount input with currency selectors
- Swap currencies button
- Live conversion results

## Deployment

### Static Hosting (Vercel, Netlify, etc.)
1. Build the project: `npm run build`
2. Deploy the `build/` folder
3. Set `REACT_APP_API_URL` environment variable

### Docker/Container
Use the provided Dockerfile with nginx for serving static files.

## API Integration

The frontend connects to the Django backend API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/` | GET | List expenses |
| `/api/expenses/` | POST | Create expense |
| `/api/expenses/{id}/` | PUT | Update expense |
| `/api/expenses/{id}/` | DELETE | Delete expense |
| `/api/expenses/stats/` | GET | Dashboard stats |
| `/api/categories/` | GET | List categories |
| `/api/exchange-rates/` | GET | Get exchange rates |
| `/api/convert-currency/` | POST | Convert currency |

## License

MIT
