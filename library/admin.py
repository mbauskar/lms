from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from library.models import LibraryUser, Author, Book, Transaction


admin.site.site_header = 'Library Management'


@admin.register(LibraryUser)
class LibraryUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'status', 'is_active')
    list_filter = ('role', 'status', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Library Info', {'fields': ('role', 'status')}),
    )


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'total_copies', 'available_copies')
    list_filter = ('author',)
    search_fields = ('title', 'isbn')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'borrow_date', 'due_date', 'return_date', 'status', 'fine_amount')
    list_filter = ('status',)
    search_fields = ('user__username', 'book__title')
