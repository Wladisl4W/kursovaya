package config

import (
	"os"
)

type Config struct {
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	JWTSecret     string
	EncryptionKey string
	AllowOrigins  string
	Port          string
}

func Load() *Config {
	cfg := &Config{
		DBHost:        getEnv("DB_HOST", "postgres"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "password"),
		DBName:        getEnv("DB_NAME", "marketplace_tracker"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-key-change-in-production"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "default-encryption-key-change-in-production"),
		AllowOrigins:  getEnv("ALLOW_ORIGINS", ""),
		Port:          getEnv("PORT", "8080"),
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}