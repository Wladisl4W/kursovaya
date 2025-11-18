package service

import (
	"fmt"
	"strings"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
	"kursovaya_backend/pkg/utils"
)

var cfg *config.Config

func InitStoreService(config *config.Config) {
	cfg = config
}

func AddStore(userID int, storeType, apiToken string) (*models.Store, error) {
	// Валидация входных данных
	if userID <= 0 {
		return nil, fmt.Errorf("некорректный ID пользователя")
	}

	if storeType != "wb" && storeType != "ozon" {
		return nil, fmt.Errorf("неподдерживаемый тип магазина: %s", storeType)
	}

	if len(strings.TrimSpace(apiToken)) == 0 {
		return nil, fmt.Errorf("API токен не может быть пустым")
	}

	if len(apiToken) < 10 { // Минимальная длина токена
		return nil, fmt.Errorf("API токен слишком короткий")
	}

	// Шифруем токен
	encryptedToken, err := utils.EncryptString(apiToken, cfg.EncryptionKey)
	if err != nil {
		return nil, fmt.Errorf("ошибка шифрования токена: %v", err)
	}

	// Добавляем магазин в БД
	var storeID int
	err = database.DB.QueryRow(
		"INSERT INTO stores (user_id, store_type, api_token) VALUES ($1, $2, $3) RETURNING id",
		userID, storeType, encryptedToken,
	).Scan(&storeID)
	if err != nil {
		return nil, fmt.Errorf("ошибка сохранения магазина в БД: %v", err)
	}

	return &models.Store{
		ID:     storeID,
		UserID: userID,
		Type:   storeType,
	}, nil
}

func GetStoresByUser(userID int) ([]*models.Store, error) {
	rows, err := database.DB.Query("SELECT id, user_id, store_type FROM stores WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stores []*models.Store
	for rows.Next() {
		var store models.Store
		err := rows.Scan(&store.ID, &store.UserID, &store.Type)
		if err != nil {
			return nil, err
		}
		stores = append(stores, &store)
	}

	return stores, nil
}

func GetStoreToken(storeID, userID int) (string, error) {
	var encryptedToken string
	err := database.DB.QueryRow(
		"SELECT api_token FROM stores WHERE id = $1 AND user_id = $2",
		storeID, userID,
	).Scan(&encryptedToken)
	if err != nil {
		return "", err
	}

	// Проверяем, что cfg не nil
	if cfg == nil {
		return "", fmt.Errorf("конфигурация сервиса не инициализирована - невозможно расшифровать токен")
	}

	// Расшифровываем токен
	token, err := utils.DecryptString(encryptedToken, cfg.EncryptionKey)
	if err != nil {
		return "", err
	}

	return token, nil
}

// DeleteStore удаляет магазин по ID
func DeleteStore(storeID, userID int) error {
	result, err := database.DB.Exec(
		"DELETE FROM stores WHERE id = $1 AND user_id = $2",
		storeID, userID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("магазин не найден или не принадлежит пользователю")
	}

	return nil
}