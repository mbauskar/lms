#!/bin/sh

set -e

echo "Checking database connection..."

python << END
import psycopg2
import os
import time

max_retries = 30
retries = 0

while retries < max_retries:
    try:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'postgres'),
            port=os.environ.get('DB_PORT', '5432'),
            database=os.environ.get('POSTGRES_DB'),
            user=os.environ.get('POSTGRES_USER'),
            password=os.environ.get('POSTGRES_PASSWORD')
        )
        conn.close()
        print("✓ Database is available")
        break
    except Exception as e:
        retries += 1
        if retries == max_retries:
            print("✗ Database connection failed after retries")
            raise
        print(f"Database not ready, retrying ({retries}/{max_retries})...")
        time.sleep(1)

END

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
