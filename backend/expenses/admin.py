from django.contrib import admin
from .models import Expense, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'icon', 'created_at']
    search_fields = ['name']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'amount', 'currency', 'category', 'date', 'created_at']
    list_filter = ['category', 'currency', 'date']
    search_fields = ['title', 'description']
    date_hierarchy = 'date'
