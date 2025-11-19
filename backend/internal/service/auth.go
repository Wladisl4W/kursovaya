package service

import (
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/errors"
	"kursovaya_backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// Глобальная переменная DB для обратной совместимости
var DB DBInterface = &RealDB{DB: database.DB}

func RegisterUser(email, password string) (*models.User, error) {
	return RegisterUserWithDB(DB, email, password)
}

func AuthenticateUser(email, password string) (*models.User, error) {
	return AuthenticateUserWithDB(DB, email, password)
}

func RegisterUserWithDB(db DBInterface, email, password string) (*models.User, error) {
	// Проверяем, существует ли пользователь
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", email).Scan(&count)
	if err != nil {
		return nil, errors.InternalServerError("Error checking user existence", err.Error())
	}
	if count > 0 {
		return nil, errors.BadRequest("User with this email already exists", "Email is already registered")
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.InternalServerError("Error hashing password", err.Error())
	}

	// Создаем пользователя
	var userID int
	err = db.QueryRow("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", email, string(hashedPassword)).Scan(&userID)
	if err != nil {
		return nil, errors.InternalServerError("Error creating user", err.Error())
	}

	return &models.User{
		ID:    userID,
		Email: email,
	}, nil
}

func AuthenticateUserWithDB(db DBInterface, email, password string) (*models.User, error) {
	var user models.User
	var hashedPassword string

	err := db.QueryRow("SELECT id, email, password FROM users WHERE email = $1", email).
		Scan(&user.ID, &user.Email, &hashedPassword)
	if err != nil {
		return nil, errors.NotFound("User not found", "User with this email does not exist")
	}

	// Сравниваем пароль
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return nil, errors.Unauthorized("Invalid password", "Password does not match")
	}

	return &user, nil
}