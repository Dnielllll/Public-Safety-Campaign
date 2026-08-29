# Auth Service — Laravel Microservice

This is the **authentication microservice** for the Barangay 178 Safety Campaign System.

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/login` | Authenticate user, return Sanctum token |
| POST | `/api/register` | Register new user |
| GET | `/api/me` | Get authenticated user (requires Bearer token) |
| POST | `/api/logout` | Revoke current token (requires Bearer token) |

## Setup

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8001
```

## Environment Variables

See `.env.example` for required variables.

## Docker

```bash
docker build -t auth-service .
docker run -p 8001:9000 --env-file .env auth-service
```
