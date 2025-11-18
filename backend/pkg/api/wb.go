package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// WBClient для работы с Wildberries API
type WBClient struct {
	Token  string
	Client *http.Client
}

// WBStocksResponse структура для ответа от WB API по остаткам
type WBStocksResponse struct {
	Data []WBStock `json:"data"`
	Error string `json:"error"`
}

// WBStock структура для остатков товара
type WBStock struct {
	SKU     string `json:"sku"`
	Name    string `json:"name"`
	Price   int    `json:"price"`
	Stock   int    `json:"stock"`
}

// WBProduct структура для товара из WB (внутренняя)
type WBProduct struct {
	ID        string `json:"nmId"`      // Артикул
	Name      string `json:"name"`      // Название
	Price     int    `json:"price"`     // Цена
	Quantity  int    `json:"quantity"`  // Остаток
}

// WBProductsResponse структура для ответа от WB API по товарам
type WBProductsResponse struct {
	Data    []WBProduct `json:"data"`
	Error   string      `json:"error"`
	Message string      `json:"message"`
}

// NewWBClient создает новый клиент для WB API
func NewWBClient(token string) *WBClient {
	return &WBClient{
		Token: token,
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetProducts получает список товаров из WB
func (w *WBClient) GetProducts() ([]Product, error) {
	// Валидация токена
	if w.Token == "" {
		return nil, fmt.Errorf("токен WB не установлен")
	}

	// Получаем список товаров (ассортимент) из WB
	url := "https://suppliers-api.wildberries.ru/content/v2/cards/list"

	// Подготовим тело запроса
	requestBody := map[string]interface{}{
		"sort": map[string]interface{}{
			"ascending": true,
		},
		"filter": map[string]interface{}{
			"text":    "",
			"tagIds":  []int{},
		},
		"offset": 0,
		"limit":  1000,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("ошибка подготовки тела запроса: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %v", err)
	}

	req.Header.Set("Authorization", w.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API WB: %d, тело: %s", resp.StatusCode, string(body))
	}

	var wbProductsResponse WBProductsResponse
	if err := json.NewDecoder(resp.Body).Decode(&wbProductsResponse); err != nil {
		return nil, fmt.Errorf("ошибка парсинга ответа: %v", err)
	}

	// Преобразуем в универсальный формат с валидацией
	products := make([]Product, 0, len(wbProductsResponse.Data))
	for _, p := range wbProductsResponse.Data {
		// Валидация полученных данных
		if p.ID == "" {
			continue // Пропускаем товар без ID
		}

		// Убедимся, что цена не отрицательная
		price := p.Price
		if price < 0 {
			price = 0 // Устанавливаем цену в 0, если она отрицательная
		}

		// Убедимся, что количество не отрицательное
		quantity := p.Quantity
		if quantity < 0 {
			quantity = 0 // Устанавливаем количество в 0, если оно отрицательное
		}

		product := Product{
			ID:        p.ID,
			Name:      p.Name,
			Price:     price,
			Quantity:  quantity,
			StoreType: "wb",
		}

		// Дополнительная валидация
		if product.Name == "" {
			product.Name = "Неизвестный товар"
		}

		products = append(products, product)
	}

	return products, nil
}