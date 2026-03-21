from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from library.models.transaction import Transaction
from library.serializers import TransactionSerializer
from library.permissions import IsAdmin, IsAdminOrLibrarian


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'librarian'):
            return Transaction.objects.all()
        return Transaction.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Members can only borrow books for themselves
        if request.user.role == 'member':
            if serializer.validated_data.get('user') != request.user:
                return Response(
                    {'detail': 'Members can only borrow books for themselves.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        book = serializer.validated_data['book']
        if book.available_copies < 1:
            return Response(
                {'detail': 'No available copies of this book.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        book.available_copies -= 1
        book.save()
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TransactionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'librarian'):
            return Transaction.objects.all()
        return Transaction.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Members can only mark their own transactions as 'returned'
        if request.user.role == 'member':
            if set(request.data.keys()) != {'status'} or request.data.get('status') != 'returned':
                return Response(
                    {'detail': 'Members can only return books.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if instance.status == 'returned':
                return Response(
                    {'detail': 'This book has already been returned.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)

        # If status changes to 'returned', restore the book's available copy
        new_status = serializer.validated_data.get('status')
        if new_status == 'returned' and instance.status != 'returned':
            book = instance.book
            book.available_copies += 1
            book.save()

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
