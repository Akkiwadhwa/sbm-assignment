from rest_framework import serializers
from .models import Expense, Category


class CategorySerializer(serializers.ModelSerializer):
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'icon', 'expense_count', 'created_at']
        read_only_fields = ['created_at']

    def get_expense_count(self, obj):
        return obj.expenses.count()


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'currency', 'category', 'category_name',
            'category_color', 'description', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExpenseStatsSerializer(serializers.Serializer):
    """Serializer for expense statistics"""
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()
    category_breakdown = serializers.ListField()
    monthly_totals = serializers.ListField()
    recent_expenses = ExpenseSerializer(many=True)
