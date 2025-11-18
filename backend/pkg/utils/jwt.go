package utils

import (
	"errors"
	"log"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey string

func SetJWTKey(key string) {
	// Validate that the key has sufficient length for security
	if len(key) < 32 {
		log.Println("[WARNING] JWT key should be at least 32 characters long for security in production")
	}
	jwtKey = key
}

func GenerateJWT(userID int, email string) (string, error) {
	if jwtKey == "" {
		return "", errors.New("JWT key not set")
	}

	// Hash the user email to reduce sensitive data exposure in tokens
	hashedEmail, err := bcrypt.GenerateFromPassword([]byte(email), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	// Create custom claims with user ID
	claims := struct {
		UserID int    `json:"user_id"`
		Email  string `json:"email"` // Using hashed email
		jwt.RegisteredClaims
	}{
		UserID: userID,
		Email:  string(hashedEmail),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)), // Reduced from 24 to 12 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "marketplace-tracker",
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

	// Use custom claims
	claims := struct {
		UserID int    `json:"user_id"`
		Email  string `json:"email"`
		jwt.RegisteredClaims
	}{}

	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
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