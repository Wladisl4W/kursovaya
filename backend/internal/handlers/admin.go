package handlers

import (
	"log"
	"net/http"
	"kursovaya_backend/internal/service"
	"kursovaya_backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

type AdminLoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type AdminLoginResponse struct {
	Token  string `json:"token"`
	Admin  struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
	} `json:"admin"`
}

func (h *AdminHandler) Login(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат данных"})
		return
	}

	// Валидация структуры
	if validationErrors := utils.ValidateStruct(&req); len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"errors": validationErrors})
		return
	}

	// Логируем попытку входа (без пароля для безопасности)
	log.Printf("Попытка входа администратора с логином: %s", req.Username)

	admin, err := service.AuthenticateAdmin(req.Username, req.Password)
	if err != nil {
		log.Printf("Ошибка аутентификации администратора: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": utils.LocalizeError(err)})
		return
	}

	log.Printf("Успешная аутентификация администратора: %s", req.Username)

	// Генерируем JWT токен для администратора
	// Используем тот же формат, что и для обычных пользователей
	token, err := utils.GenerateJWT(admin.ID, "admin")
	if err != nil {
		log.Printf("Ошибка генерации токена для администратора: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.LocalizeError(err)})
		return
	}

	resp := AdminLoginResponse{
		Token: token,
	}
	resp.Admin.ID = admin.ID
	resp.Admin.Username = admin.Username

	c.JSON(http.StatusOK, resp)
}