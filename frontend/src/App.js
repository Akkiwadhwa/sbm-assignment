import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { expenseApi, categoryApi, exchangeApi } from './services/api';
import { format } from 'date-fns';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

function App() {
  const [view, setView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Currency converter state
  const [converterAmount, setConverterAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedResult, setConvertedResult] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes, statsRes] = await Promise.all([
        expenseApi.getAll(),
        categoryApi.getAll(),
        expenseApi.getStats()
      ]);
      setExpenses(expensesRes.data.results || expensesRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load data. Make sure the backend server is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExchangeRates = useCallback(async () => {
    try {
      const res = await exchangeApi.getRates('USD');
      setExchangeRates(res.data);
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchExchangeRates();
  }, [fetchData, fetchExchangeRates]);

  const handleConvert = async () => {
    try {
      const res = await exchangeApi.convert(converterAmount, fromCurrency, toCurrency);
      setConvertedResult(res.data);
    } catch (err) {
      console.error('Conversion error:', err);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedResult(null);
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Chart data
  const categoryChartData = {
    labels: stats?.category_breakdown?.map(c => c.name) || [],
    datasets: [{
      data: stats?.category_breakdown?.map(c => c.total) || [],
      backgroundColor: stats?.category_breakdown?.map(c => c.color) || [],
      borderWidth: 0,
    }]
  };

  const monthlyChartData = {
    labels: stats?.monthly_totals?.map(m => m.month) || [],
    datasets: [{
      label: 'Monthly Spending',
      data: stats?.monthly_totals?.map(m => m.total) || [],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Expense Tracker</h1>
        <p>Track your expenses, visualize spending patterns, and convert currencies</p>
        <nav className="nav">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            Dashboard
          </button>
          <button className={view === 'expenses' ? 'active' : ''} onClick={() => setView('expenses')}>
            Expenses
          </button>
          <button className={view === 'converter' ? 'active' : ''} onClick={() => setView('converter')}>
            Currency Converter
          </button>
        </nav>
      </header>

      <main className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {view === 'dashboard' && (
          <Dashboard
            stats={stats}
            categoryChartData={categoryChartData}
            monthlyChartData={monthlyChartData}
          />
        )}

        {view === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onAdd={() => { setEditingExpense(null); setShowModal(true); }}
            onEdit={(expense) => { setEditingExpense(expense); setShowModal(true); }}
            onDelete={async (id) => {
              if (window.confirm('Are you sure you want to delete this expense?')) {
                try {
                  await expenseApi.delete(id);
                  showSuccessMessage('Expense deleted successfully');
                  fetchData();
                } catch (err) {
                  setError('Failed to delete expense');
                }
              }
            }}
          />
        )}

        {view === 'converter' && (
          <CurrencyConverter
            amount={converterAmount}
            setAmount={setConverterAmount}
            fromCurrency={fromCurrency}
            setFromCurrency={setFromCurrency}
            toCurrency={toCurrency}
            setToCurrency={setToCurrency}
            result={convertedResult}
            onConvert={handleConvert}
            onSwap={swapCurrencies}
            rates={exchangeRates}
          />
        )}

        {showModal && (
          <ExpenseModal
            expense={editingExpense}
            categories={categories}
            onClose={() => { setShowModal(false); setEditingExpense(null); }}
            onSave={async (data) => {
              try {
                if (editingExpense) {
                  await expenseApi.update(editingExpense.id, data);
                  showSuccessMessage('Expense updated successfully');
                } else {
                  await expenseApi.create(data);
                  showSuccessMessage('Expense created successfully');
                }
                setShowModal(false);
                setEditingExpense(null);
                fetchData();
              } catch (err) {
                setError('Failed to save expense');
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

// Dashboard Component
function Dashboard({ stats, categoryChartData, monthlyChartData }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <div className="value">${stats?.total_expenses?.toLocaleString() || '0'}</div>
        </div>
        <div className="stat-card">
          <h3>Number of Expenses</h3>
          <div className="value primary">{stats?.expense_count || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Categories Used</h3>
          <div className="value success">{stats?.category_breakdown?.length || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Avg per Expense</h3>
          <div className="value">
            ${stats?.expense_count ? (stats.total_expenses / stats.expense_count).toFixed(2) : '0'}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Spending by Category</h3>
          {categoryChartData.labels.length > 0 ? (
            <Pie data={categoryChartData} options={chartOptions} />
          ) : (
            <div className="empty-state">No data available</div>
          )}
        </div>
        <div className="chart-container">
          <h3>Monthly Spending Trend</h3>
          {monthlyChartData.labels.length > 0 ? (
            <Line data={monthlyChartData} options={chartOptions} />
          ) : (
            <div className="empty-state">No data available</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Expenses</h3>
        </div>
        <div className="recent-list">
          {stats?.recent_expenses?.length > 0 ? (
            stats.recent_expenses.map(expense => (
              <div key={expense.id} className="recent-item">
                <div className="recent-item-info">
                  <span className="recent-item-title">{expense.title}</span>
                  <span className="recent-item-date">
                    {expense.category_name} - {format(new Date(expense.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <span className="recent-item-amount">-${parseFloat(expense.amount).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">No recent expenses</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Category Breakdown</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {stats?.category_breakdown?.map(cat => (
                <tr key={cat.id || cat.name}>
                  <td>
                    <span className="category-badge" style={{ backgroundColor: `${cat.color}20` }}>
                      <span className="category-dot" style={{ backgroundColor: cat.color }}></span>
                      {cat.name}
                    </span>
                  </td>
                  <td>${cat.total.toLocaleString()}</td>
                  <td>{cat.count}</td>
                  <td>{((cat.total / stats.total_expenses) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Expense List Component
function ExpenseList({ expenses, categories, onAdd, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">All Expenses</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Expense</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>
                    {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td>
                    {expense.category_name && (
                      <span className="category-badge" style={{ backgroundColor: `${expense.category_color}20` }}>
                        <span className="category-dot" style={{ backgroundColor: expense.category_color }}></span>
                        {expense.category_name}
                      </span>
                    )}
                  </td>
                  <td>{format(new Date(expense.date), 'MMM d, yyyy')}</td>
                  <td>{expense.description || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(expense)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(expense.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No expenses found. Add your first expense!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Expense Modal Component
function ExpenseModal({ expense, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    currency: expense?.currency || 'USD',
    category: expense?.category || '',
    description: expense?.description || '',
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Grocery shopping"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  className="form-control"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Optional notes about this expense"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Update' : 'Create'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Currency Converter Component
function CurrencyConverter({ amount, setAmount, fromCurrency, setFromCurrency, toCurrency, setToCurrency, result, onConvert, onSwap, rates }) {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'];

  return (
    <>
      <div className="converter-container">
        <h3>Currency Converter (Third-Party API Integration)</h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.875rem' }}>
          Convert between currencies using live exchange rates from exchangerate.host API
        </p>
        <div className="converter-form">
          <div>
            <label className="converter-label">Amount</label>
            <input
              type="number"
              className="converter-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <label className="converter-label" style={{ marginTop: '0.5rem' }}>From</label>
            <select
              className="converter-input"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button className="swap-btn" onClick={onSwap} title="Swap currencies">
            ⇄
          </button>

          <div>
            <label className="converter-label">Converted Amount</label>
            <input
              type="text"
              className="converter-input"
              value={result ? result.converted_amount.toFixed(2) : ''}
              readOnly
              placeholder="Result"
            />
            <label className="converter-label" style={{ marginTop: '0.5rem' }}>To</label>
            <select
              className="converter-input"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          className="btn"
          style={{
            width: '100%',
            marginTop: '1.5rem',
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          }}
          onClick={onConvert}
        >
          Convert Currency
        </button>

        {result && (
          <div className="converter-result">
            <div className="amount">
              {result.converted_amount.toFixed(2)} {result.to_currency}
            </div>
            <div className="rate">
              1 {result.from_currency} = {result.rate?.toFixed(4)} {result.to_currency}
              {result.note && <span style={{ display: 'block', opacity: 0.7 }}>{result.note}</span>}
            </div>
          </div>
        )}
      </div>

      {rates && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Current Exchange Rates (Base: {rates.base})</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rates.rates).map(([currency, rate]) => (
                  <tr key={currency}>
                    <td><strong>{currency}</strong></td>
                    <td>{rate?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
            Last updated: {rates.date}
            {rates.note && ` (${rates.note})`}
          </p>
        </div>
      )}
    </>
  );
}

export default App;
