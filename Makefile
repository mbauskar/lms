.PHONY: build up down logs migrate createsuperuser shell

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

createsuperuser:
	docker-compose -f local.yml exec backend python manage.py createsuperuser

shell:
	docker-compose -f local.yml exec backend python manage.py shell
