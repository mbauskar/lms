from django.db import models
from library.models.author import Author
from library.models.base import BaseModel


class Book(BaseModel):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name='books')
    isbn = models.CharField(max_length=13, unique=True)
    total_copies = models.PositiveIntegerField(default=0)
    available_copies = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
