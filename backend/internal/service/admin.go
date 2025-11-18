package service

import (
	"errors"
	"log"
	"math/rand"
	"os"
	"time"
	"golang.org/x/crypto/bcrypt"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
)

func AuthenticateAdmin(username, password string) (*models.Admin, error) {
	var admin models.Admin
	var hashedPassword string

	err := database.DB.QueryRow("SELECT id, username, password FROM admins WHERE username = $1", username).
		Scan(&admin.ID, &admin.Username, &hashedPassword)
	if err != nil {
		return nil, errors.New("admin not found")
	}

	// Сравниваем пароль
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return nil, errors.New("invalid password")
	}

	return &admin, nil
}

// generateSecurePassword генерирует безопасный случайный пароль
func generateSecurePassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	// Устанавливаем сид для генератора случайных чисел
	rand.Seed(time.Now().UnixNano())

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// InitializeAdmin создает администратора по умолчанию при первом запуске
// Логин: admin, пароль задается через переменную окружения ADMIN_DEFAULT_PASSWORD или генерируется автоматически
func InitializeAdmin() error {
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM admins").Scan(&count)
	if err != nil {
		log.Printf("Ошибка при проверке наличия администратора: %v", err)
		return err
	}

	if count > 0 {
		// Администратор уже существует
		log.Println("Администратор уже существует в базе данных")
		return nil
	}

	log.Println("Создание нового администратора...")

	// Хешируем пароль
	password, exists := os.LookupEnv("ADMIN_DEFAULT_PASSWORD")
	if !exists {
		// Используем безопасный случайный пароль по умолчанию, если переменная не установлена
		password = generateSecurePassword(12)
		log.Printf("Использован сгенерированный пароль для администратора (переменная ADMIN_DEFAULT_PASSWORD не установлена)")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Ошибка при хешировании пароля администратора: %v", err)
		return err
	}

	// Создаем администратора
	_, err = database.DB.Exec("INSERT INTO admins (username, password) VALUES ($1, $2)", "admin", string(hashedPassword))
	if err != nil {
		log.Printf("Ошибка при создании администратора: %v", err)
		return err
	}

	log.Println("Администратор успешно создан")

	return nil
}