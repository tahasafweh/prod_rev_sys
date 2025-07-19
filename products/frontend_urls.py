from django.urls import path
from django.views.generic import RedirectView
from .views import LoginView, ProductListView, ProductViewSet

urlpatterns = [
    # Frontend URLs
    path('login/', LoginView.as_view(), name='login'),
    path('product-list/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/reviews-page/', 
         ProductViewSet.as_view({'get': 'product_reviews_page'}), 
         name='product-reviews-page'),
    path('', RedirectView.as_view(pattern_name='product-list'), name='home'),
] 