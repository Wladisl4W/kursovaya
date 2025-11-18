package service

import (
	"database/sql"
	"fmt"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
)

// MappingService для работы с сопоставлениями товаров
type MappingService struct {
}

// NewMappingService создает новый сервис для работы с сопоставлениями
func NewMappingService() *MappingService {
	return &MappingService{}
}

// CreateMapping создает новое сопоставление между товарами
func (ms *MappingService) CreateMapping(product1ID, product2ID, userID int) (*models.ProductMapping, error) {
	// Проверяем, что пользователь может создать сопоставление для этих товаров
	if err := ms.validateUserCanMapProducts(product1ID, product2ID, userID); err != nil {
		return nil, err
	}

	// Проверяем, не существует ли уже такое сопоставление
	var count int
	err := database.DB.QueryRow(
		"SELECT COUNT(*) FROM product_mappings WHERE (product1_id = $1 AND product2_id = $2) OR (product1_id = $2 AND product2_id = $1)",
		product1ID, product2ID, product2ID, product1ID,
	).Scan(&count)
	if err != nil {
		return nil, fmt.Errorf("ошибка проверки существования сопоставления: %v", err)
	}
	if count > 0 {
		return nil, fmt.Errorf("сопоставление между этими товарами уже существует")
	}

	// Создаем сопоставление
	var mappingID int
	err = database.DB.QueryRow(
		"INSERT INTO product_mappings (product1_id, product2_id, user_id) VALUES ($1, $2, $3) RETURNING id",
		product1ID, product2ID, userID,
	).Scan(&mappingID)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания сопоставления: %v", err)
	}

	return &models.ProductMapping{
		ID:         mappingID,
		Product1ID: product1ID,
		Product2ID: product2ID,
		UserID:     userID,
	}, nil
}

// GetMappingsByUser возвращает все сопоставления пользователя
func (ms *MappingService) GetMappingsByUser(userID int) ([]*models.ProductMapping, error) {
	query := `
		SELECT id, product1_id, product2_id, user_id
		FROM product_mappings
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса сопоставлений: %v", err)
	}
	defer rows.Close()

	var mappings []*models.ProductMapping
	for rows.Next() {
		var mapping models.ProductMapping
		err := rows.Scan(&mapping.ID, &mapping.Product1ID, &mapping.Product2ID, &mapping.UserID)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования сопоставления: %v", err)
		}
		mappings = append(mappings, &mapping)
	}

	return mappings, nil
}

// DeleteMapping удаляет сопоставление
func (ms *MappingService) DeleteMapping(mappingID, userID int) error {
	result, err := database.DB.Exec(
		"DELETE FROM product_mappings WHERE id = $1 AND user_id = $2",
		mappingID, userID,
	)
	if err != nil {
		return fmt.Errorf("ошибка удаления сопоставления: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("ошибка получения количества измененных строк: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("сопоставление не найдено или не принадлежит пользователю")
	}

	return nil
}

// validateUserCanMapProducts проверяет, что пользователь может сопоставить два товара
func (ms *MappingService) validateUserCanMapProducts(product1ID, product2ID, userID int) error {
	// Валидация входных данных
	if product1ID <= 0 || product2ID <= 0 || userID <= 0 {
		return fmt.Errorf("некорректные ID товаров или пользователя")
	}

	if product1ID == product2ID {
		return fmt.Errorf("нельзя сопоставить товар с самим собой")
	}

	// Получаем информацию о товарах
	var store1ID, store2ID int
	err := database.DB.QueryRow(
		"SELECT store_id FROM products WHERE id = $1",
		product1ID,
	).Scan(&store1ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("первый товар с ID %d не найден", product1ID)
		}
		return fmt.Errorf("ошибка получения информации о первом товаре: %v", err)
	}

	err = database.DB.QueryRow(
		"SELECT store_id FROM products WHERE id = $1",
		product2ID,
	).Scan(&store2ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("второй товар с ID %d не найден", product2ID)
		}
		return fmt.Errorf("ошибка получения информации о втором товаре: %v", err)
	}

	// Получаем информацию о магазинах
	var user1ID, user2ID int
	err = database.DB.QueryRow(
		"SELECT user_id FROM stores WHERE id = $1",
		store1ID,
	).Scan(&user1ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("магазин первого товара не найден")
		}
		return fmt.Errorf("ошибка получения информации о первом магазине: %v", err)
	}

	err = database.DB.QueryRow(
		"SELECT user_id FROM stores WHERE id = $1",
		store2ID,
	).Scan(&user2ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("магазин второго товара не найден")
		}
		return fmt.Errorf("ошибка получения информации о втором магазине: %v", err)
	}

	// Проверяем, что оба товара принадлежат пользователю
	if user1ID != userID || user2ID != userID {
		return fmt.Errorf("пользователь не может сопоставить товары, не принадлежащие ему")
	}

	return nil
}