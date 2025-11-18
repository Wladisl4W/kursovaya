package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"kursovaya_backend/internal/database"
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

	// Получаем сопоставления пользователя из базы данных
	mappings, err := h.mappingService.GetMappingsByUser(userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения сопоставлений: " + err.Error()})
		return
	}

	// Преобразуем в формат с детальной информацией о товарах
	detailedMappings := make([]MappingDetail, len(mappings))
	for i, mapping := range mappings {
		// Загружаем детали товара 1
		product1, err := h.getProductDetail(mapping.Product1ID)
		if err != nil {
			// Вместо возврата ошибки, логируем и продолжаем с пустым значением
			fmt.Printf("Ошибка получения информации о товаре 1 (ID: %d): %v\n", mapping.Product1ID, err)
			product1 = ProductDetail{
				ID: mapping.Product1ID, // Указываем ID, чтобы пользователь знал, какой товар не удалось загрузить
				Name: "Ошибка загрузки товара",
			}
		}

		// Загружаем детали товара 2
		product2, err := h.getProductDetail(mapping.Product2ID)
		if err != nil {
			// Вместо возврата ошибки, логируем и продолжаем с пустым значением
			fmt.Printf("Ошибка получения информации о товаре 2 (ID: %d): %v\n", mapping.Product2ID, err)
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
		return ProductDetail{}, fmt.Errorf("некорректный ID товара")
	}

	row := h.db.QueryRow(
		"SELECT id, store_id, external_id, name, price, quantity FROM products WHERE id = $1",
		productID,
	)

	err := row.Scan(&product.ID, &product.StoreID, &product.ExternalID, &product.Name, &product.Price, &product.Quantity)
	if err != nil {
		if err == sql.ErrNoRows {
			return ProductDetail{}, fmt.Errorf("товар с ID %d не найден", productID)
		}
		return ProductDetail{}, err
	}

	return product, nil
}

func (h *MappingHandler) CreateMapping(c *gin.Context) {
	var req CreateMappingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Некорректный формат данных",
			"details": err.Error(),
		})
		return
	}

	// Валидация запроса
	if req.Product1ID <= 0 || req.Product2ID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID товаров должны быть положительными числами"})
		return
	}

	if req.Product1ID == req.Product2ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Нельзя сопоставить товар с самим собой"})
		return
	}

	// Получаем ID пользователя из контекста
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

	// Создаем сопоставление
	mapping, err := h.mappingService.CreateMapping(req.Product1ID, req.Product2ID, userIDInt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания сопоставления: " + err.Error()})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID сопоставления: " + err.Error()})
		return
	}

	if mappingID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID сопоставления должен быть положительным числом"})
		return
	}

	// Получаем ID пользователя из контекста
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

	// Удаляем сопоставление
	err = h.mappingService.DeleteMapping(mappingID, userIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления сопоставления: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сопоставление успешно удалено"})
}