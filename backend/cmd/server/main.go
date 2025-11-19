package main

import (
	"fmt"
	"log"
	"os"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/handlers"
	"kursovaya_backend/internal/service"
	"kursovaya_backend/internal/routes"
	"kursovaya_backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin mode based on environment
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Загружаем конфигурацию
	cfg := config.Load()

	// Устанавливаем ключи для утилит
	utils.SetJWTKey(cfg.JWTSecret)

	// Подключаемся к базе данных
	database.Connect(cfg)

	// Инициализируем администратора
	if err := service.InitializeAdmin(); err != nil {
		log.Fatal("Failed to initialize admin:", err)
	}

	// Инициализируем сервисы
	service.InitStoreService(cfg)

	// Создаем Gin роутер
	r := gin.Default()

	// Добавляем глобальный обработчик ошибок
	r.Use(handlers.GlobalErrorHandler())

	// Подключаем маршруты
	routes.SetupRoutes(r, cfg)

	// Запускаем сервер
	port := ":" + cfg.Port
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(port); err != nil {
		log.Fatal(fmt.Sprintf("Failed to start server on port %s:", port), err)
	}
}