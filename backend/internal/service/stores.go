package service

import (
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
	// Шифруем токен
	encryptedToken, err := utils.EncryptString(apiToken, cfg.EncryptionKey)
	if err != nil {
		return nil, err
	}

	// Добавляем магазин в БД
	result, err := database.DB.Exec(
		"INSERT INTO stores (user_id, store_type, api_token) VALUES (?, ?, ?)",
		userID, storeType, encryptedToken,
	)
	if err != nil {
		return nil, err
	}

	storeID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &models.Store{
		ID:     int(storeID),
		UserID: userID,
		Type:   storeType,
	}, nil
}

func GetStoresByUser(userID int) ([]*models.Store, error) {
	rows, err := database.DB.Query("SELECT id, user_id, store_type FROM stores WHERE user_id = ?", userID)
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
		"SELECT api_token FROM stores WHERE id = ? AND user_id = ?",
		storeID, userID,
	).Scan(&encryptedToken)
	if err != nil {
		return "", err
	}

	// Расшифровываем токен
	token, err := utils.DecryptString(encryptedToken, cfg.EncryptionKey)
	if err != nil {
		return "", err
	}

	return token, nil
}