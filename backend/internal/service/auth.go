package service

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
)

func RegisterUser(email, password string) (*models.User, error) {
	// Проверяем, существует ли пользователь
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&count)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("user with this email already exists")
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Создаем пользователя
	result, err := database.DB.Exec("INSERT INTO users (email, password) VALUES (?, ?)", email, string(hashedPassword))
	if err != nil {
		return nil, err
	}

	// Получаем ID нового пользователя
	userID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &models.User{
		ID:    int(userID),
		Email: email,
	}, nil
}

func AuthenticateUser(email, password string) (*models.User, error) {
	var user models.User
	var hashedPassword string

	err := database.DB.QueryRow("SELECT id, email, password FROM users WHERE email = ?", email).
		Scan(&user.ID, &user.Email, &hashedPassword)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Сравниваем пароль
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return nil, errors.New("invalid password")
	}

	return &user, nil
}