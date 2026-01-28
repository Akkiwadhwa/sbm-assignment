from django.core.management.base import BaseCommand
from expenses.models import Category, Expense
from datetime import date, timedelta
import random
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed database with sample categories and expenses'

    def handle(self, *args, **options):
        # Create categories
        categories_data = [
            {'name': 'Food & Dining', 'color': '#EF4444', 'icon': 'utensils'},
            {'name': 'Transportation', 'color': '#F59E0B', 'icon': 'car'},
            {'name': 'Shopping', 'color': '#8B5CF6', 'icon': 'shopping-bag'},
            {'name': 'Entertainment', 'color': '#EC4899', 'icon': 'film'},
            {'name': 'Bills & Utilities', 'color': '#3B82F6', 'icon': 'file-text'},
            {'name': 'Healthcare', 'color': '#10B981', 'icon': 'heart'},
            {'name': 'Travel', 'color': '#06B6D4', 'icon': 'plane'},
            {'name': 'Education', 'color': '#6366F1', 'icon': 'book'},
        ]

        categories = []
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'color': cat_data['color'], 'icon': cat_data['icon']}
            )
            categories.append(cat)
            if created:
                self.stdout.write(f'Created category: {cat.name}')

        # Create sample expenses for the last 3 months
        expense_templates = [
            ('Grocery shopping', 'Food & Dining', (50, 200)),
            ('Restaurant dinner', 'Food & Dining', (30, 100)),
            ('Coffee shop', 'Food & Dining', (5, 20)),
            ('Gas/Fuel', 'Transportation', (40, 80)),
            ('Uber ride', 'Transportation', (15, 50)),
            ('Bus pass', 'Transportation', (50, 100)),
            ('Online shopping', 'Shopping', (50, 300)),
            ('Clothes', 'Shopping', (30, 150)),
            ('Movie tickets', 'Entertainment', (15, 40)),
            ('Netflix subscription', 'Entertainment', (15, 20)),
            ('Spotify subscription', 'Entertainment', (10, 15)),
            ('Electric bill', 'Bills & Utilities', (80, 200)),
            ('Internet bill', 'Bills & Utilities', (50, 100)),
            ('Phone bill', 'Bills & Utilities', (40, 80)),
            ('Doctor visit', 'Healthcare', (50, 200)),
            ('Pharmacy', 'Healthcare', (20, 100)),
            ('Weekend trip', 'Travel', (200, 500)),
            ('Flight tickets', 'Travel', (200, 800)),
            ('Online course', 'Education', (50, 200)),
            ('Books', 'Education', (20, 80)),
        ]

        today = date.today()
        expenses_created = 0

        for i in range(90):  # Last 90 days
            expense_date = today - timedelta(days=i)

            # Create 1-3 expenses per day randomly
            num_expenses = random.randint(0, 3)
            for _ in range(num_expenses):
                template = random.choice(expense_templates)
                category = next((c for c in categories if c.name == template[1]), categories[0])
                amount = Decimal(str(random.randint(template[2][0], template[2][1])))

                Expense.objects.create(
                    title=template[0],
                    amount=amount,
                    currency='USD',
                    category=category,
                    description=f'Sample expense for {template[0].lower()}',
                    date=expense_date
                )
                expenses_created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(categories)} categories and {expenses_created} expenses')
        )
