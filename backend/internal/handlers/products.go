package handlers

import (
	"net/http"
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден в контексте"})
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения ID пользователя: неверный тип"})
		return
	}

	if userIDInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID пользователя"})
		return
	}

	if userIDInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID пользователя"})
		return
	}

	// Получаем товары из маркетплейсов
	products, err := h.productService.GetProductsByUser(userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения товаров: " + err.Error()})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден в контексте"})
		return
	}

	userIDInt, ok := userID.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения ID пользователя: неверный тип"})
		return
	}

	// Получаем сохраненные товары из базы данных
	products, err := h.productService.GetSavedProducts(userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}