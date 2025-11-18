package database

import (
	"database/sql"
	"fmt"
	"log"
	"kursovaya_backend/internal/config"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect(cfg *config.Config) {
	var err error
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Connected to PostgreSQL database")

	// Создаем таблицы
	createTables()
}

func createTables() {
	// Таблица пользователей
	userTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Таблица магазинов
	storeTable := `
	CREATE TABLE IF NOT EXISTS stores (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL,
		store_type VARCHAR(50) NOT NULL,  -- 'wb' или 'ozon'
		api_token TEXT NOT NULL,          -- зашифрованный токен
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
	);`

	// Таблица товаров
	productTable := `
	CREATE TABLE IF NOT EXISTS products (
		id SERIAL PRIMARY KEY,
		store_id INTEGER NOT NULL,
		external_id VARCHAR(255) NOT NULL,  -- ID товара в WB/Ozon
		name TEXT NOT NULL,
		price INTEGER,
		quantity INTEGER,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT fk_store FOREIGN KEY(store_id) REFERENCES stores(id)
	);`

	// Таблица сопоставлений
	mappingTable := `
	CREATE TABLE IF NOT EXISTS product_mappings (
		id SERIAL PRIMARY KEY,
		product1_id INTEGER NOT NULL,  -- Товар из WB
		product2_id INTEGER NOT NULL,  -- Товар из Ozon
		user_id INTEGER NOT NULL,      -- Кому принадлежит
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(product1_id, product2_id),  -- Один товар не может быть сопоставлен дважды
		CONSTRAINT fk_product1 FOREIGN KEY(product1_id) REFERENCES products(id),
		CONSTRAINT fk_product2 FOREIGN KEY(product2_id) REFERENCES products(id),
		CONSTRAINT fk_mapping_user FOREIGN KEY(user_id) REFERENCES users(id)
	);`

	// Таблица администраторов
	adminTable := `
	CREATE TABLE IF NOT EXISTS admins (
		id SERIAL PRIMARY KEY,
		username VARCHAR(255) UNIQUE NOT NULL,
		password TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Выполняем создание таблиц
	for _, query := range []string{userTable, storeTable, productTable, mappingTable, adminTable} {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal("Failed to create table:", err)
		}
	}

	log.Println("Database tables created successfully")
}