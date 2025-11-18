package main

import (
	"log"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/service"
	"kursovaya_backend/internal/routes"
	"kursovaya_backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func main() {
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

	// Подключаем маршруты
	routes.SetupRoutes(r, cfg)

	// Запускаем сервер
	log.Println("Server starting on port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}