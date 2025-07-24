from django.urls import path
from django.views.generic import RedirectView
from .views import LoginView, ProductListView, ProductViewSet,AddCommentToReview , NotificationListView
from .views import notifications_page 
from .views import NotificationReadView
urlpatterns = [
    # Frontend URLs
    path('login/', LoginView.as_view(), name='login'),
    path('product-list/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/reviews-page/', 
         ProductViewSet.as_view({'get': 'product_reviews_page'}), 
         name='product-reviews-page'),
    path('', RedirectView.as_view(pattern_name='product-list'), name='home'),
    path('notifications/', notifications_page, name='notifications-page'),
    

    path('products/notifications/', NotificationListView.as_view(), name='notifications'),

    path('products/notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('reviews/<int:review_id>/comment/', AddCommentToReview.as_view(), name='add-review-comment'),
] 