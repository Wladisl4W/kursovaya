package config

import (
	"os"
)

type Config struct {
	DBPath        string
	JWTSecret     string
	EncryptionKey string
	Port          string
}

func Load() *Config {
	cfg := &Config{
		DBPath:        getEnv("DB_PATH", "./data.db"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-key-change-in-production"),
		EncryptionKey: getEnv("ENCRYPTION_KEY", "default-encryption-key-change-in-production"),
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