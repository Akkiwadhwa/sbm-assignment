web: gunicorn expense_tracker.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
