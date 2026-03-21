from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only admin users can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsLibrarian(BasePermission):
    """Only librarian users can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'librarian'


class IsAdminOrLibrarian(BasePermission):
    """Admin or librarian users can access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ('admin', 'librarian')
        )
