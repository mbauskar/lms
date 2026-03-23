from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from library.models.book import Book
from library.models.transaction import Transaction
from library.serializers import BookSerializer, MemberBookSerializer
from library.permissions import IsAdmin, IsAdminOrLibrarian


class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrLibrarian()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Book.objects.all()
        if self.request.user.role == 'member':
            borrowed_book_ids = Transaction.objects.filter(
                user=self.request.user, status='borrowed'
            ).values_list('book_id', flat=True)
            qs = qs.exclude(id__in=borrowed_book_ids)
        return qs

    def get_serializer_class(self):
        if self.request.user.role == 'member':
            return MemberBookSerializer
        return BookSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BookRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        if self.request.method in ('PUT', 'PATCH'):
            return [IsAdminOrLibrarian()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.role == 'member':
            return MemberBookSerializer
        return BookSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.transaction_set.filter(status='borrowed').exists():
            return Response(
                {'detail': 'Cannot delete a book that has active borrow transactions.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
