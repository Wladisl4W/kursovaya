package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// OzonClient для работы с Ozon API
type OzonClient struct {
	Token   string
	ClientID string
	Client  *http.Client
}

// OzonProductRequest структура для запроса товаров из Ozon
type OzonProductRequest struct {
	Filter struct {
		OfferID []string `json:"offer_id"`
		ProductID []int `json:"product_id"`
		Visibility string `json:"visibility"`
	} `json:"filter"`
	Limit int `json:"limit"`
	Offset int `json:"offset"`
}

// OzonProductResponse структура для ответа от Ozon API
type OzonProductResponse struct {
	Result struct {
		Products []OzonProductItem `json:"items"`
		Total int `json:"total"`
	} `json:"result"`
}

// OzonProductItem структура для товара из Ozon
type OzonProductItem struct {
	ID       int    `json:"product_id"`     // ID товара
	Name     string `json:"name"`           // Название
	Price    string `json:"price"`          // Цена (в строковом формате)
	Stock    int    `json:"stock"`          // Остаток
	OfferID  string `json:"offer_id"`       // Внутренний ID продавца
}

// NewOzonClient создает новый клиент для Ozon API
func NewOzonClient(token, clientID string) *OzonClient {
	return &OzonClient{
		Token:    token,
		ClientID: clientID,
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetProducts получает список товаров из Ozon
func (o *OzonClient) GetProducts() ([]Product, error) {
	// Валидация данных
	if o.Token == "" {
		return nil, fmt.Errorf("токен Ozon не установлен")
	}
	if o.ClientID == "" {
		return nil, fmt.Errorf("ClientID для Ozon не установлен")
	}

	// Получаем список товаров из Ozon
	url := "https://api-seller.ozon.ru/v2/product/list"

	// Подготовим тело запроса
	requestBody := OzonProductRequest{
		Filter: struct {
			OfferID []string `json:"offer_id"`
			ProductID []int `json:"product_id"`
			Visibility string `json:"visibility"`
		}{
			Visibility: "ALL",
		},
		Limit:  100,
		Offset: 0,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("ошибка подготовки тела запроса: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %v", err)
	}

	req.Header.Set("Client-Id", o.ClientID)
	req.Header.Set("Api-Key", o.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := o.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API Ozon: %d, тело: %s", resp.StatusCode, string(body))
	}

	var ozonResponse OzonProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&ozonResponse); err != nil {
		return nil, fmt.Errorf("ошибка парсинга ответа: %v", err)
	}

	// Преобразуем в универсальный формат с валидацией
	products := make([]Product, 0, len(ozonResponse.Result.Products))
	for _, p := range ozonResponse.Result.Products {
		// Валидация полученных данных
		if p.ID == 0 {
			continue // Пропускаем товар без ID
		}

		// Преобразуем цену из строки в число
		var price int
		// Более надежное преобразование цены из строки (например, "1234.56")
		if p.Price != "" {
			// Используем strconv вместо fmt.Sscanf для безопасности
			// Сначала удалим нежелательные символы, чтобы избежать уязвимостей
			priceStr := strings.ReplaceAll(p.Price, " ", "")
			priceStr = strings.ReplaceAll(priceStr, "\t", "")
			priceStr = strings.ReplaceAll(priceStr, "\n", "")
			priceStr = strings.ReplaceAll(priceStr, "\r", "")

			num, err := strconv.ParseFloat(priceStr, 64)
			if err != nil {
				// Если формат неверный, устанавливаем цену в 0
				num = 0
			}
			price = int(num)
		} else {
			price = 0
		}

		product := Product{
			ID:        fmt.Sprintf("%d", p.ID),
			Name:      p.Name,
			Price:     price,
			Quantity:  p.Stock,
			StoreType: "ozon",
		}

		// Дополнительная валидация
		if product.Name == "" {
			product.Name = "Неизвестный товар"
		}

		products = append(products, product)
	}

	return products, nil
}