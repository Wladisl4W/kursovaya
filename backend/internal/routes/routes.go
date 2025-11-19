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

	// Эндпоинт для проверки состояния (health check) - без версии
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "marketplace-tracker-backend",
		})
	})

	// Публичные маршруты v1
	publicV1 := r.Group("/api/v1")
	{
		publicV1.POST("/auth/register", authHandler.Register)
		publicV1.POST("/auth/login", authHandler.Login)
		publicV1.POST("/admin/login", adminHandler.Login) // Добавляем маршрут для аутентификации администратора
	}

	// Защищенные маршруты v1 (требуют JWT токен)
	protectedV1 := r.Group("/api/v1")
	protectedV1.Use(middleware.AuthMiddleware())
	{
		protectedV1.GET("/stores", storeHandler.GetStores)
		protectedV1.POST("/stores", storeHandler.AddStore)
		protectedV1.DELETE("/stores/:id", storeHandler.DeleteStore)
		protectedV1.GET("/products", productHandler.GetProducts)
		protectedV1.GET("/products/saved", productHandler.GetSavedProducts)
		protectedV1.GET("/mappings", mappingHandler.GetMappings)
		protectedV1.POST("/mappings", mappingHandler.CreateMapping)
		protectedV1.DELETE("/mappings/:id", mappingHandler.DeleteMapping)
	}

	// Админ-маршруты v1 (требуют аутентификации администратора)
	adminV1 := r.Group("/api/v1/admin")
	adminV1.Use(middleware.AdminAuthMiddleware())
	{
		// Статистика
		adminV1.GET("/stats", adminManagementHandler.GetStats)

		// Управление пользователями
		adminV1.GET("/users", adminManagementHandler.GetUsers)
		adminV1.GET("/users/:id", adminManagementHandler.GetUser)
		adminV1.DELETE("/users/:id", adminManagementHandler.DeleteUser)

		// Управление магазинами
		adminV1.GET("/stores", adminManagementHandler.GetStores)
		adminV1.GET("/stores/:id", adminManagementHandler.GetStore)
		adminV1.DELETE("/stores/:id", adminManagementHandler.DeleteStore)

		// Управление товарами
		adminV1.GET("/products", adminManagementHandler.GetProducts)
		adminV1.GET("/products/:id", adminManagementHandler.GetProduct)
		adminV1.DELETE("/products/:id", adminManagementHandler.DeleteProduct)

		// Управление сопоставлениями
		adminV1.GET("/mappings", adminManagementHandler.GetMappings)
		adminV1.GET("/mappings/:id", adminManagementHandler.GetMapping)
		adminV1.DELETE("/mappings/:id", adminManagementHandler.DeleteMapping)
	}

	// Пути без версии для обратной совместимости (временно)
	public := r.Group("/api")
	{
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
		public.POST("/admin/login", adminHandler.Login) // Добавляем маршрут для аутентификации администратора
	}

	// Защищенные маршруты (требуют JWT токен) - для обратной совместимости (временно)
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

	// Админ-маршруты (требуют аутентификации администратора) - для обратной совместимости (временно)
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