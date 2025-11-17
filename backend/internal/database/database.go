package database

import (
	"database/sql"
	"log"
	"kursovaya_backend/internal/config"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Connect(cfg *config.Config) {
	var err error
	DB, err = sql.Open("sqlite3", cfg.DBPath)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Connected to SQLite database")
	
	// Создаем таблицы
	createTables()
}

func createTables() {
	// Таблица пользователей
	userTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Таблица магазинов
	storeTable := `
	CREATE TABLE IF NOT EXISTS stores (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		store_type TEXT NOT NULL,  -- 'wb' или 'ozon'
		api_token TEXT NOT NULL,   -- зашифрованный токен
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`

	// Таблица товаров
	productTable := `
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		store_id INTEGER NOT NULL,
		external_id TEXT NOT NULL,  -- ID товара в WB/Ozon
		name TEXT NOT NULL,
		price INTEGER,
		quantity INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(store_id) REFERENCES stores(id)
	);`

	// Таблица сопоставлений
	mappingTable := `
	CREATE TABLE IF NOT EXISTS product_mappings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		product1_id INTEGER NOT NULL,  -- Товар из WB
		product2_id INTEGER NOT NULL,  -- Товар из Ozon
		user_id INTEGER NOT NULL,      -- Кому принадлежит
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(product1_id, product2_id),  -- Один товар не может быть сопоставлен дважды
		FOREIGN KEY(product1_id) REFERENCES products(id),
		FOREIGN KEY(product2_id) REFERENCES products(id),
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`

	// Выполняем создание таблиц
	for _, query := range []string{userTable, storeTable, productTable, mappingTable} {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal("Failed to create table:", err)
		}
	}

	log.Println("Database tables created successfully")
}