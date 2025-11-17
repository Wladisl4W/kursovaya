package models

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"` // Только для регистрации/входа
}

type Store struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Type     string `json:"type"`     // "wb" или "ozon"
	APIToken string `json:"api_token"` // Токен от маркетплейса
}

type Product struct {
	ID         int    `json:"id"`
	StoreID    int    `json:"store_id"`
	ExternalID string `json:"external_id"` // ID в WB/Ozon
	Name       string `json:"name"`
	Price      int    `json:"price"`
	Quantity   int    `json:"quantity"`
}

type ProductMapping struct {
	ID         int `json:"id"`
	Product1ID int `json:"product1_id"` // Товар из WB
	Product2ID int `json:"product2_id"` // Товар из Ozon
	UserID     int `json:"user_id"`
}