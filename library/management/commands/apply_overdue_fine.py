import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand

from library.models.transaction import Transaction

FINE_PER_DAY = Decimal("20.00")


class Command(BaseCommand):
    help = "Mark overdue transactions and apply a fine of ₹20 per overdue day."

    def handle(self, *args, **options):
        today = datetime.date.today()
        overdue_txs = Transaction.objects.filter(
            status__in=("borrowed", "overdue"),
            due_date__lt=today,
        )
        count = 0
        for tx in overdue_txs:
            overdue_days = (today - tx.due_date).days
            tx.fine_amount = FINE_PER_DAY * overdue_days
            tx.status = "overdue"
            tx.save(update_fields=["fine_amount", "status"])
            count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Updated {count} overdue transaction(s).")
        )
