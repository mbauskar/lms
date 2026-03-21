from django.contrib.auth import authenticate
from rest_framework import serializers
from library.models.user import LibraryUser
from library.models.author import Author
from library.models.book import Book
from library.models.transaction import Transaction


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        if user.status != 'active':
            raise serializers.ValidationError('This account is not active.')
        attrs['user'] = user
        return attrs


class LibraryUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'status', 'date_joined']
        read_only_fields = ['date_joined']

    def validate_role(self, value):
        valid_roles = [choice[0] for choice in LibraryUser.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError(f'Invalid role. Must be one of: {", ".join(valid_roles)}')
        return value

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in LibraryUser.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = LibraryUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'status', 'date_joined']
        read_only_fields = ['date_joined']

    def validate_role(self, value):
        valid_roles = [choice[0] for choice in LibraryUser.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError(f'Invalid role. Must be one of: {", ".join(valid_roles)}')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = LibraryUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Author name cannot be blank.')
        return value.strip()


class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'

    def validate_isbn(self, value):
        if not value.isdigit() or len(value) not in (10, 13):
            raise serializers.ValidationError('ISBN must be 10 or 13 digits.')
        return value

    def validate(self, attrs):
        total = attrs.get('total_copies', getattr(self.instance, 'total_copies', 0))
        available = attrs.get('available_copies', getattr(self.instance, 'available_copies', 0))
        if available > total:
            raise serializers.ValidationError({'available_copies': 'Available copies cannot exceed total copies.'})
        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

    def validate(self, attrs):
        borrow_date = attrs.get('borrow_date', getattr(self.instance, 'borrow_date', None))
        due_date = attrs.get('due_date', getattr(self.instance, 'due_date', None))
        return_date = attrs.get('return_date', getattr(self.instance, 'return_date', None))

        if borrow_date and due_date and due_date < borrow_date:
            raise serializers.ValidationError({'due_date': 'Due date must be on or after the borrow date.'})
        if return_date and borrow_date and return_date < borrow_date:
            raise serializers.ValidationError({'return_date': 'Return date must be on or after the borrow date.'})
        return attrs
