package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kursovaya_backend/internal/errors"
	"kursovaya_backend/internal/service"
)

type StoreHandler struct{}

// GetStores возвращает список магазинов пользователя
func (h *StoreHandler) GetStores(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		appErr := errors.Unauthorized("Не авторизован", "")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	stores, err := service.GetStoresByUser(userID.(int))
	if err != nil {
		appErr := errors.InternalServerError("Ошибка получения магазинов", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusOK, stores)
}

// AddStore добавляет новый магазин
func (h *StoreHandler) AddStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		appErr := errors.Unauthorized("Не авторизован", "")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	var req struct {
		Type     string `json:"type" binding:"required"`
		APIToken string `json:"api_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.BadRequest("Неправильный формат данных", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	store, err := service.AddStore(userID.(int), req.Type, req.APIToken)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка добавления магазина", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusCreated, store)
}

// DeleteStore удаляет магазин
func (h *StoreHandler) DeleteStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		appErr := errors.Unauthorized("Не авторизован", "")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	storeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		appErr := errors.BadRequest("Некорректный ID магазина", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	err = service.DeleteStore(storeID, userID.(int))
	if err != nil {
		if err.Error() == "магазин не найден или не принадлежит пользователю" {
			appErr := errors.Forbidden("Магазин не найден или не принадлежит пользователю", err.Error())
			errors.LogAppError(appErr)
			c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
			return
		}
		appErr := errors.InternalServerError("Ошибка удаления магазина", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Магазин удален"})
}