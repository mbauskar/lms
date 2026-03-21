from django.urls import path
from library.views import health_check
from library.views.auth_views import LoginView, LogoutView
from library.views.user_views import UserListCreateView, UserRetrieveUpdateDestroyView
from library.views.author_views import AuthorListCreateView, AuthorRetrieveUpdateDestroyView
from library.views.book_views import BookListCreateView, BookRetrieveUpdateDestroyView
from library.views.transaction_views import TransactionListCreateView, TransactionRetrieveUpdateDestroyView

urlpatterns = [
    path('health/', health_check, name='health-check'),

    # Auth
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # Users (admin only for create/update/delete)
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),

    # Authors (admin/librarian for create/update/delete)
    path('authors/', AuthorListCreateView.as_view(), name='author-list-create'),
    path('authors/<int:pk>/', AuthorRetrieveUpdateDestroyView.as_view(), name='author-detail'),

    # Books (admin/librarian for create/update/delete)
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookRetrieveUpdateDestroyView.as_view(), name='book-detail'),

    # Transactions (admin/librarian for create/update, members see own)
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionRetrieveUpdateDestroyView.as_view(), name='transaction-detail'),
]
