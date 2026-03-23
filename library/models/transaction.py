import datetime

from django.db import models
from library.models.base import BaseModel
from library.models.user import LibraryUser
from library.models.book import Book


class Transaction(BaseModel):
    LOAN_PERIOD_DAYS = 7

    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]

    user = models.ForeignKey(LibraryUser, on_delete=models.PROTECT)
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    borrow_date = models.DateField()
    due_date = models.DateField(blank=True)
    return_date = models.DateField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')

    def save(self, *args, **kwargs):
        if self.borrow_date:
            self.due_date = self.borrow_date + datetime.timedelta(days=self.LOAN_PERIOD_DAYS)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.book}"
