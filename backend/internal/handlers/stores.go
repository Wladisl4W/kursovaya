package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kursovaya_backend/internal/service"
)

type StoreHandler struct{}

// GetStores возвращает список магазинов пользователя
func (h *StoreHandler) GetStores(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	stores, err := service.GetStoresByUser(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения магазинов"})
		return
	}

	c.JSON(http.StatusOK, stores)
}

// AddStore добавляет новый магазин
func (h *StoreHandler) AddStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var req struct {
		Type     string `json:"type" binding:"required"`
		APIToken string `json:"api_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат данных"})
		return
	}

	store, err := service.AddStore(userID.(int), req.Type, req.APIToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, store)
}

// DeleteStore удаляет магазин
func (h *StoreHandler) DeleteStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	storeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID магазина"})
		return
	}

	err = service.DeleteStore(storeID, userID.(int))
	if err != nil {
		if err.Error() == "магазин не найден или не принадлежит пользователю" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления магазина"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Магазин удален"})
}