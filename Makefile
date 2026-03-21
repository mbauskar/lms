.PHONY: build up down logs makemigrations migrate createsuperuser shell clean clean-volumes

build:
	docker-compose -f local.yml build

up:
	docker-compose -f local.yml up -d

down:
	docker-compose -f local.yml down

logs:
	docker-compose -f local.yml logs -f

migrate:
	docker-compose -f local.yml exec backend python manage.py migrate

makemigrations:
	docker-compose -f local.yml exec backend python manage.py makemigrations

createsuperuser:
	docker-compose -f local.yml exec backend python manage.py createsuperuser

shell:
	docker-compose -f local.yml exec backend python manage.py shell

clean:
	docker-compose -f local.yml down --rmi all

clean-volumes:
	docker-compose -f local.yml down --rmi all --volumes
