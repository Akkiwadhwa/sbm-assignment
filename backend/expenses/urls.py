from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'categories', views.CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('exchange-rates/', views.exchange_rates, name='exchange-rates'),
    path('convert-currency/', views.convert_currency, name='convert-currency'),
]
