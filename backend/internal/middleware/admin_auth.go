package middleware

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/pkg/utils"
)

// AdminAuthMiddleware проверяет, является ли пользователь администратором
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Проверяем формат заголовка Authorization
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Проверяем токен
		userID, _, err := utils.ValidateJWT(tokenString)  // Используем только userID, email не нужен для админ-аутентификации
		if err != nil {
			log.Printf("Admin authentication error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Проверим, существует ли пользователь с таким ID в таблице admins
		var adminExists int
		err = database.DB.QueryRow("SELECT COUNT(*) FROM admins WHERE id = $1", userID).
			Scan(&adminExists)
		if err != nil {
			log.Printf("Error checking admin status: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error verifying admin status"})
			c.Abort()
			return
		}

		// Если пользователь не найден в таблице admins, значит он не администратор
		if adminExists == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		// Устанавливаем информацию о пользователе в контекст
		c.Set("user_id", userID)
		c.Set("username", "admin") // Для администратора используем имя "admin"
		c.Set("is_admin", true)

		c.Next()
	}
}