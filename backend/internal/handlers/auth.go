package handlers

import (
	"net/http"
	"kursovaya_backend/internal/errors"
	"kursovaya_backend/internal/service"
	"kursovaya_backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct{}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    int    `json:"id"`
		Email string `json:"email"`
	} `json:"user"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.BadRequest("Некорректный формат данных", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Валидация структуры
	if validationErrors := utils.ValidateStruct(&req); len(validationErrors) > 0 {
		appErr := errors.ValidationError("Ошибка валидации данных", "")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "errors": validationErrors})
		return
	}

	user, err := service.RegisterUser(req.Email, req.Password)
	if err != nil {
		appErr := errors.BadRequest("Ошибка регистрации", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Генерируем JWT токен
	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка генерации токена", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	resp := AuthResponse{
		Token: token,
	}
	resp.User.ID = user.ID
	resp.User.Email = user.Email

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.BadRequest("Некорректный формат данных", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Валидация структуры
	if validationErrors := utils.ValidateStruct(&req); len(validationErrors) > 0 {
		appErr := errors.ValidationError("Ошибка валидации данных", "")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "errors": validationErrors})
		return
	}

	user, err := service.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		appErr := errors.Unauthorized("Ошибка аутентификации", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Генерируем JWT токен
	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка генерации токена", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	resp := AuthResponse{
		Token: token,
	}
	resp.User.ID = user.ID
	resp.User.Email = user.Email

	c.JSON(http.StatusOK, resp)
}