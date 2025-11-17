package utils

import (
	"errors"
	"time"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey string

func SetJWTKey(key string) {
	jwtKey = key
}

func GenerateJWT(userID int, email string) (string, error) {
	if jwtKey == "" {
		return "", errors.New("JWT key not set")
	}

	// Создаем кастомные claims с ID пользователя
	claims := struct {
		UserID int    `json:"user_id"`
		Email  string `json:"email"`
		jwt.RegisteredClaims
	}{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateJWT(tokenString string) (int, string, error) {
	if jwtKey == "" {
		return 0, "", errors.New("JWT key not set")
	}

	// Используем кастомные claims
	claims := struct {
		UserID int    `json:"user_id"`
		Email  string `json:"email"`
		jwt.RegisteredClaims
	}{}

	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})

	if err != nil {
		return 0, "", err
	}

	if token.Valid {
		return claims.UserID, claims.Email, nil
	}

	return 0, "", errors.New("invalid token")
}