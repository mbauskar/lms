from django.db import models

from library.models.base import BaseModel


class Author(BaseModel):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name
