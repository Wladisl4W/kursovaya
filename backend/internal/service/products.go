package service

import (
	"fmt"
	"strings"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
	"kursovaya_backend/pkg/api"
)

// ProductService для работы с товарами
type ProductService struct {
}

// NewProductService создает новый сервис для работы с товарами
func NewProductService() *ProductService {
	return &ProductService{}
}

// GetProductsByUser возвращает все товары пользователя из всех его магазинов
func (ps *ProductService) GetProductsByUser(userID int) ([]api.Product, error) {
	// Получаем магазины пользователя
	stores, err := GetStoresByUser(userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения магазинов: %v", err)
	}

	// Если у пользователя нет магазинов - возвращаем пустой массив
	if len(stores) == 0 {
		return []api.Product{}, nil
	}

	var allProducts []api.Product

	for _, store := range stores {
		// Получаем токен магазина
		token, err := GetStoreToken(store.ID, userID)
		if err != nil {
			// Пропускаем магазин с ошибкой токена
			continue
		}

		// Создаем клиент для соответствующего маркетплейса
		var client api.APIClient
		switch store.Type {
		case "wb":
			client = api.NewWBClient(token)
		case "ozon":
			// Для Ozon также нужен ClientID, который хранится в зашифрованном виде
			// В реальном приложении ClientID также нужно хранить в базе и шифровать
			clientID := "client_id_placeholder" // Это также должно быть зашифровано в базе
			client = api.NewOzonClient(token, clientID)
		default:
			// Пропускаем неизвестный тип магазина
			continue
		}

		// Получаем товары из маркетплейса
		products, err := client.GetProducts()
		if err != nil {
			// Логируем ошибку, но не прерываем выполнение
			fmt.Printf("Ошибка получения товаров из магазина %s (ID: %d): %v\n", store.Type, store.ID, err)
			continue
		}

		// Добавляем товары к общему списку
		allProducts = append(allProducts, products...)
	}

	return allProducts, nil
}

// SaveProduct сохраняет товар в базу данных
func (ps *ProductService) SaveProduct(product api.Product, storeID int) error {
	_, err := database.DB.Exec(
		"INSERT INTO products (store_id, external_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)",
		storeID, product.ID, product.Name, product.Price, product.Quantity,
	)
	return err
}

// GetSavedProducts возвращает сохраненные товары пользователя из базы данных
func (ps *ProductService) GetSavedProducts(userID int) ([]models.Product, error) {
	// Получаем магазины пользователя
	stores, err := GetStoresByUser(userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения магазинов: %v", err)
	}

	// Формируем список ID магазинов
	var storeIDs []int
	for _, store := range stores {
		storeIDs = append(storeIDs, store.ID)
	}

	if len(storeIDs) == 0 {
		return []models.Product{}, nil
	}

	// Формируем плейсхолдеры для IN
	args := make([]interface{}, len(storeIDs))
	for i, id := range storeIDs {
		args[i] = id
	}

	// Создаем строку с плейсхолдерами для PostgreSQL
	var placeholders []string
	for i := range storeIDs {
		placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
	}
	placeholderStr := strings.Join(placeholders, ", ")

	query := fmt.Sprintf(
		"SELECT id, store_id, external_id, name, price, quantity FROM products WHERE store_id IN (%s)",
		placeholderStr,
	)

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса к базе: %v", err)
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		err := rows.Scan(&product.ID, &product.StoreID, &product.ExternalID, &product.Name, &product.Price, &product.Quantity)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования результата: %v", err)
		}
		products = append(products, product)
	}

	return products, nil
}