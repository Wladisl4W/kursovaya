# Используем официальный образ Go
FROM golang:1.24 AS builder

# Устанавливаем зависимости для PostgreSQL
RUN apt-get update && apt-get install -y gcc musl-dev libpq-dev pkg-config

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем go.mod и go.sum для кэширования зависимостей
COPY go.mod go.sum ./

# Загружаем зависимости
RUN go mod download
# Кэшируем зависимости, загружая их до копирования исходного кода

# Копируем исходный код
COPY . .

# Собираем бинарник
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Финальный образ
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y ca-certificates libpq5 && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

# Копируем бинарник
COPY --from=builder /app/main .

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["./main"]