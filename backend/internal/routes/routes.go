package routes

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/handlers"
	"kursovaya_backend/internal/middleware"
)

func SetupRoutes(r *gin.Engine, cfg *config.Config) {
	// Настройка CORS
	corsConfig := cors.DefaultConfig()
	// Ограничиваем доступ только с доверенных источников
	if cfg != nil && cfg.AllowOrigins != "" {
		// Разделяем строку с несколькими источниками по запятой
		origins := strings.Split(cfg.AllowOrigins, ",")
		// Убираем лишние пробелы
		for i, origin := range origins {
			origins[i] = strings.TrimSpace(origin)
		}
		corsConfig.AllowOrigins = origins
	} else {
		// По умолчанию разрешаем доступ с localhost
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	r.Use(cors.New(corsConfig))

	// Создаем хендлеры
	authHandler := &handlers.AuthHandler{}
	productHandler := handlers.NewProductHandler()
	mappingHandler := handlers.NewMappingHandler()
	adminHandler := &handlers.AdminHandler{}
	storeHandler := &handlers.StoreHandler{}
	adminManagementHandler := &handlers.AdminManagementHandler{}

	// Публичные маршруты
	public := r.Group("/api")
	{
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
		public.POST("/admin/login", adminHandler.Login) // Добавляем маршрут для аутентификации администратора
	}

	// Эндпоинт для проверки состояния (health check)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "marketplace-tracker-backend",
		})
	})

	// Защищенные маршруты (требуют JWT токен)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/stores", storeHandler.GetStores)
		protected.POST("/stores", storeHandler.AddStore)
		protected.DELETE("/stores/:id", storeHandler.DeleteStore)
		protected.GET("/products", productHandler.GetProducts)
		protected.GET("/products/saved", productHandler.GetSavedProducts)
		protected.GET("/mappings", mappingHandler.GetMappings)
		protected.POST("/mappings", mappingHandler.CreateMapping)
		protected.DELETE("/mappings/:id", mappingHandler.DeleteMapping)
	}

	// Админ-маршруты (требуют аутентификации администратора)
	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminAuthMiddleware())
	{
		// Статистика
		admin.GET("/stats", adminManagementHandler.GetStats)

		// Управление пользователями
		admin.GET("/users", adminManagementHandler.GetUsers)
		admin.GET("/users/:id", adminManagementHandler.GetUser)
		admin.DELETE("/users/:id", adminManagementHandler.DeleteUser)

		// Управление магазинами
		admin.GET("/stores", adminManagementHandler.GetStores)
		admin.GET("/stores/:id", adminManagementHandler.GetStore)
		admin.DELETE("/stores/:id", adminManagementHandler.DeleteStore)

		// Управление товарами
		admin.GET("/products", adminManagementHandler.GetProducts)
		admin.GET("/products/:id", adminManagementHandler.GetProduct)
		admin.DELETE("/products/:id", adminManagementHandler.DeleteProduct)

		// Управление сопоставлениями
		admin.GET("/mappings", adminManagementHandler.GetMappings)
		admin.GET("/mappings/:id", adminManagementHandler.GetMapping)
		admin.DELETE("/mappings/:id", adminManagementHandler.DeleteMapping)
	}
}