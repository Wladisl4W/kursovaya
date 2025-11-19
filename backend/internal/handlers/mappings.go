package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/errors"
	"kursovaya_backend/internal/service"
	"github.com/gin-gonic/gin"
)

type MappingHandler struct {
	mappingService *service.MappingService
	db             *sql.DB
}

func NewMappingHandler() *MappingHandler {
	return &MappingHandler{
		mappingService: service.NewMappingService(),
		db:             database.DB,
	}
}

type GetMappingsResponse struct {
	Mappings []MappingDetail `json:"mappings"`
}

// MappingDetail содержит детали сопоставления с информацией о товарах
type MappingDetail struct {
	ID         int          `json:"id"`
	Product1   ProductDetail `json:"product1"`
	Product2   ProductDetail `json:"product2"`
	UserID     int          `json:"user_id"`
	CreatedAt  string       `json:"created_at"`
}

// ProductDetail содержит информацию о товаре
type ProductDetail struct {
	ID         int    `json:"id"`
	StoreID    int    `json:"store_id"`
	ExternalID string `json:"external_id"`
	Name       string `json:"name"`
	Price      int    `json:"price"`
	Quantity   int    `json:"quantity"`
}

type CreateMappingRequest struct {
	Product1ID int `json:"product1_id" binding:"required"`
	Product2ID int `json:"product2_id" binding:"required"`
}

type CreateMappingResponse struct {
	ID         int `json:"id"`
	Product1ID int `json:"product1_id"`
	Product2ID int `json:"product2_id"`
	UserID     int `json:"user_id"`
}

func (h *MappingHandler) GetMappings(c *gin.Context) {
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

	// Получаем сопоставления пользователя из базы данных
	mappings, err := h.mappingService.GetMappingsByUser(userIDInt)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка получения сопоставлений", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Преобразуем в формат с детальной информацией о товарах
	detailedMappings := make([]MappingDetail, len(mappings))
	for i, mapping := range mappings {
		// Загружаем детали товара 1
		product1, err := h.getProductDetail(mapping.Product1ID)
		if err != nil {
			// Вместо возврата ошибки, логируем и продолжаем с пустым значением
			appErr := errors.InternalServerError("Ошибка получения информации о товаре 1", err.Error())
			errors.LogAppError(appErr)
			product1 = ProductDetail{
				ID: mapping.Product1ID, // Указываем ID, чтобы пользователь знал, какой товар не удалось загрузить
				Name: "Ошибка загрузки товара",
			}
		}

		// Загружаем детали товара 2
		product2, err := h.getProductDetail(mapping.Product2ID)
		if err != nil {
			// Вместо возврата ошибки, логируем и продолжаем с пустым значением
			appErr := errors.InternalServerError("Ошибка получения информации о товаре 2", err.Error())
			errors.LogAppError(appErr)
			product2 = ProductDetail{
				ID: mapping.Product2ID, // Указываем ID, чтобы пользователь знал, какой товар не удалось загрузить
				Name: "Ошибка загрузки товара",
			}
		}

		detailedMappings[i] = MappingDetail{
			ID:       mapping.ID,
			Product1: product1,
			Product2: product2,
			UserID:   mapping.UserID,
		}
	}

	c.JSON(http.StatusOK, GetMappingsResponse{
		Mappings: detailedMappings,
	})
}

// getProductDetail возвращает детали товара по ID
func (h *MappingHandler) getProductDetail(productID int) (ProductDetail, error) {
	var product ProductDetail

	// Валидация ID продукта
	if productID <= 0 {
		return ProductDetail{}, errors.BadRequest("Некорректный ID товара", "Product ID must be positive").Error()
	}

	row := h.db.QueryRow(
		"SELECT id, store_id, external_id, name, price, quantity FROM products WHERE id = $1",
		productID,
	)

	err := row.Scan(&product.ID, &product.StoreID, &product.ExternalID, &product.Name, &product.Price, &product.Quantity)
	if err != nil {
		if err == sql.ErrNoRows {
			return ProductDetail{}, errors.NotFound(fmt.Sprintf("товар с ID %d не найден", productID), "").Error()
		}
		return ProductDetail{}, errors.InternalServerError("Ошибка получения информации о товаре", err.Error()).Error()
	}

	return product, nil
}

func (h *MappingHandler) CreateMapping(c *gin.Context) {
	var req CreateMappingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.BadRequest("Некорректный формат данных", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Валидация запроса
	if req.Product1ID <= 0 || req.Product2ID <= 0 {
		appErr := errors.BadRequest("ID товаров должны быть положительными числами", "Product IDs must be positive integers")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	if req.Product1ID == req.Product2ID {
		appErr := errors.BadRequest("Нельзя сопоставить товар с самим собой", "Cannot map a product to itself")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Получаем ID пользователя из контекста
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

	// Создаем сопоставление
	mapping, err := h.mappingService.CreateMapping(req.Product1ID, req.Product2ID, userIDInt)
	if err != nil {
		appErr := errors.BadRequest("Ошибка создания сопоставления", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	resp := CreateMappingResponse{
		ID:         mapping.ID,
		Product1ID: mapping.Product1ID,
		Product2ID: mapping.Product2ID,
		UserID:     mapping.UserID,
	}

	c.JSON(http.StatusOK, resp)
}

func (h *MappingHandler) DeleteMapping(c *gin.Context) {
	mappingIDStr := c.Param("id")
	mappingID, err := strconv.Atoi(mappingIDStr)
	if err != nil {
		appErr := errors.BadRequest("Некорректный ID сопоставления", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	if mappingID <= 0 {
		appErr := errors.BadRequest("ID сопоставления должен быть положительным числом", "Mapping ID must be a positive integer")
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	// Получаем ID пользователя из контекста
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

	// Удаляем сопоставление
	err = h.mappingService.DeleteMapping(mappingID, userIDInt)
	if err != nil {
		appErr := errors.InternalServerError("Ошибка удаления сопоставления", err.Error())
		errors.LogAppError(appErr)
		c.JSON(appErr.Code, gin.H{"error": appErr.Message, "details": appErr.Details})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сопоставление успешно удалено"})
}