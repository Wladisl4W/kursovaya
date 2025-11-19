package service

import (
	"fmt"
	"strings"
	"kursovaya_backend/internal/config"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/errors"
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
		return nil, errors.BadRequest("Некорректный ID пользователя", "User ID must be positive")
	}

	if storeType != "wb" && storeType != "ozon" {
		return nil, errors.BadRequest("Неподдерживаемый тип магазина", fmt.Sprintf("Store type '%s' is not supported", storeType))
	}

	if len(strings.TrimSpace(apiToken)) == 0 {
		return nil, errors.BadRequest("API токен не может быть пустым", "API token cannot be empty")
	}

	if len(apiToken) < 10 { // Минимальная длина токена
		return nil, errors.BadRequest("API токен слишком короткий", "API token is too short, minimum length is 10 characters")
	}

	// Шифруем токен
	encryptedToken, err := utils.EncryptString(apiToken, cfg.EncryptionKey)
	if err != nil {
		return nil, errors.InternalServerError("Ошибка шифрования токена", err.Error())
	}

	// Добавляем магазин в БД
	var storeID int
	err = database.DB.QueryRow(
		"INSERT INTO stores (user_id, store_type, api_token) VALUES ($1, $2, $3) RETURNING id",
		userID, storeType, encryptedToken,
	).Scan(&storeID)
	if err != nil {
		return nil, errors.InternalServerError("Ошибка сохранения магазина в БД", err.Error())
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
		return nil, errors.InternalServerError("Ошибка получения магазинов пользователя", err.Error())
	}
	defer rows.Close()

	var stores []*models.Store
	for rows.Next() {
		var store models.Store
		err := rows.Scan(&store.ID, &store.UserID, &store.Type)
		if err != nil {
			return nil, errors.InternalServerError("Ошибка сканирования магазина", err.Error())
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
		return "", errors.NotFound("Магазин не найден или не принадлежит пользователю", err.Error())
	}

	// Проверяем, что cfg не nil
	if cfg == nil {
		return "", errors.InternalServerError("Конфигурация сервиса не инициализирована", "Store service configuration not initialized - cannot decrypt token")
	}

	// Расшифровываем токен
	token, err := utils.DecryptString(encryptedToken, cfg.EncryptionKey)
	if err != nil {
		return "", errors.InternalServerError("Ошибка расшифровки токена", err.Error())
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
		return errors.InternalServerError("Ошибка при удалении магазина", err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.InternalServerError("Ошибка проверки количества измененных строк", err.Error())
	}

	if rowsAffected == 0 {
		return errors.Forbidden("Магазин не найден или не принадлежит пользователю", "Store not found or does not belong to user")
	}

	return nil
}