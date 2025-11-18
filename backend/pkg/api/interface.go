package api

// Product интерфейс для товара, универсальный для всех маркетплейсов
type Product struct {
	ID        string `json:"id"`          // Уникальный идентификатор товара в маркетплейсе
	Name      string `json:"name"`        // Название товара
	Price     int    `json:"price"`       // Цена товара в копейках (для точности)
	Quantity  int    `json:"quantity"`    // Количество/остаток товара
	StoreType string `json:"store_type"`  // Тип маркетплейса ("wb" или "ozon")
	CreatedAt string `json:"created_at"`  // Дата создания (не используется везде)
	UpdatedAt string `json:"updated_at"`  // Дата обновления (не используется везде)
}

// APIClient интерфейс для работы с API маркетплейсов
type APIClient interface {
	GetProducts() ([]Product, error)
}