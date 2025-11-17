package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/handlers"
	"kursovaya_backend/internal/middleware"
)

func SetupRoutes(r *gin.Engine, cfg *config.Config) {
	// Настройка CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowCredentials = true
	config.AllowHeaders = []string{"*"}
	r.Use(cors.New(config))

	// Создаем хендлеры
	authHandler := &handlers.AuthHandler{}

	// Публичные маршруты
	public := r.Group("/api")
	{
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
	}

	// Защищенные маршруты (требуют JWT токен)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Добавим позже
	}
}