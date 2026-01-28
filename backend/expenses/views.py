import requests
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import Expense, Category
from .serializers import ExpenseSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expense CRUD operations"""
    queryset = Expense.objects.select_related('category').all()
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get expense statistics for dashboard"""
        queryset = self.get_queryset()

        # Total expenses
        total = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        count = queryset.count()

        # Category breakdown
        category_stats = queryset.values(
            'category__id', 'category__name', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        category_breakdown = [
            {
                'id': item['category__id'],
                'name': item['category__name'] or 'Uncategorized',
                'color': item['category__color'] or '#9CA3AF',
                'total': float(item['total']),
                'count': item['count']
            }
            for item in category_stats
        ]

        # Monthly totals (last 6 months)
        six_months_ago = datetime.now().date() - timedelta(days=180)
        monthly_stats = queryset.filter(
            date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('month')

        monthly_totals = [
            {
                'month': item['month'].strftime('%Y-%m') if item['month'] else '',
                'total': float(item['total']),
                'count': item['count']
            }
            for item in monthly_stats
        ]

        # Recent expenses (last 5)
        recent = queryset[:5]
        recent_serializer = ExpenseSerializer(recent, many=True)

        return Response({
            'total_expenses': float(total),
            'expense_count': count,
            'category_breakdown': category_breakdown,
            'monthly_totals': monthly_totals,
            'recent_expenses': recent_serializer.data
        })


@api_view(['GET'])
def exchange_rates(request):
    """
    Get exchange rates from third-party API
    This integrates a free exchange rate API to convert expense amounts
    """
    base_currency = request.query_params.get('base', 'USD')

    # Fallback rates (realistic rates as of 2024)
    fallback_rates = {
        'USD': 1.0,
        'EUR': 0.92,
        'GBP': 0.79,
        'JPY': 149.50,
        'CAD': 1.36,
        'AUD': 1.53,
        'INR': 83.12,
        'CNY': 7.24
    }

    # Try multiple free exchange rate APIs
    apis_to_try = [
        f"https://open.er-api.com/v6/latest/{base_currency}",
        f"https://api.frankfurter.app/latest?from={base_currency}",
    ]

    for api_url in apis_to_try:
        try:
            response = requests.get(api_url, timeout=5)
            response.raise_for_status()
            data = response.json()

            # Handle different API response formats
            rates = data.get('rates', {})
            if rates:
                common_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY']
                filtered_rates = {
                    curr: rates.get(curr)
                    for curr in common_currencies
                    if curr in rates
                }
                # Add base currency as 1.0
                filtered_rates[base_currency] = 1.0

                return Response({
                    'base': base_currency,
                    'rates': filtered_rates,
                    'date': data.get('date', datetime.now().date().isoformat()),
                    'source': 'live'
                })
        except Exception:
            continue

    # Return fallback rates if all APIs fail
    return Response({
        'base': 'USD',
        'rates': fallback_rates,
        'date': datetime.now().date().isoformat(),
        'note': 'Using cached rates (live API unavailable)',
        'source': 'cached'
    })


@api_view(['POST'])
def convert_currency(request):
    """
    Convert an amount from one currency to another using exchange rates
    Third-party API integration: Uses open.er-api.com or frankfurter.app
    """
    amount = request.data.get('amount')
    from_currency = request.data.get('from_currency', 'USD')
    to_currency = request.data.get('to_currency', 'EUR')

    if amount is None:
        return Response(
            {'error': 'Amount is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        amount = Decimal(str(amount))
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid amount'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Fallback rates
    fallback_rates = {
        'USD': 1.0, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50,
        'CAD': 1.36, 'AUD': 1.53, 'INR': 83.12, 'CNY': 7.24
    }

    # Try to fetch live rates
    apis_to_try = [
        f"https://open.er-api.com/v6/latest/{from_currency}",
        f"https://api.frankfurter.app/latest?from={from_currency}&to={to_currency}",
    ]

    for api_url in apis_to_try:
        try:
            response = requests.get(api_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            rates = data.get('rates', {})

            if to_currency in rates:
                rate = rates[to_currency]
                converted = float(amount) * rate
                return Response({
                    'original_amount': float(amount),
                    'from_currency': from_currency,
                    'to_currency': to_currency,
                    'converted_amount': round(converted, 2),
                    'rate': round(rate, 6),
                    'date': data.get('date', datetime.now().date().isoformat()),
                    'source': 'live'
                })
        except Exception:
            continue

    # Fallback conversion using cached rates
    from_rate = fallback_rates.get(from_currency, 1.0)
    to_rate = fallback_rates.get(to_currency, 1.0)

    # Convert to USD first, then to target currency
    usd_amount = float(amount) / from_rate
    converted = usd_amount * to_rate

    return Response({
        'original_amount': float(amount),
        'from_currency': from_currency,
        'to_currency': to_currency,
        'converted_amount': round(converted, 2),
        'rate': round(to_rate / from_rate, 6),
        'date': datetime.now().date().isoformat(),
        'note': 'Using cached rates',
        'source': 'cached'
    })
