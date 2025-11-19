package handlers

import (
	"net/http"
	"kursovaya_backend/internal/errors"
	"kursovaya_backend/internal/service"
	"kursovaya_backend/pkg/api"
	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{
		productService: service.NewProductService(),
	}
}

type GetProductsResponse struct {
	Products []api.Product `json:"products"`
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	// Получаем ID пользователя из контекста (после аутентификации)
	userID, exists := c.Get("user_id")
	if !exists {
		appErr := errors.InternalServerError("Пользователь не найден в контексте", "User not found in context")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		appErr := errors.InternalServerError("Ошибка получения ID пользователя", "User ID type is incorrect")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	if userIDInt <= 0 {
		appErr := errors.BadRequest("Некорректный ID пользователя", "User ID must be positive")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Получаем товары из маркетплейсов
	products, err := h.productService.GetProductsByUser(userIDInt)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка получения товаров", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusOK, GetProductsResponse{
		Products: products,
	})
}

func (h *ProductHandler) GetSavedProducts(c *gin.Context) {
	// Получаем ID пользователя из контекста (после аутентификации)
	userID, exists := c.Get("user_id")
	if !exists {
		appErr := errors.InternalServerError("Пользователь не найден в контексте", "User not found in context")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		appErr := errors.InternalServerError("Ошибка получения ID пользователя", "User ID type is incorrect")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Получаем сохраненные товары из базы данных
	products, err := h.productService.GetSavedProducts(userIDInt)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка получения сохраненных товаров", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}