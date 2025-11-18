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
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", email).Scan(&count)
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
	var userID int
	err = database.DB.QueryRow("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", email, string(hashedPassword)).Scan(&userID)
	if err != nil {
		return nil, err
	}

	return &models.User{
		ID:    userID,
		Email: email,
	}, nil
}

func AuthenticateUser(email, password string) (*models.User, error) {
	var user models.User
	var hashedPassword string

	err := database.DB.QueryRow("SELECT id, email, password FROM users WHERE email = $1", email).
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