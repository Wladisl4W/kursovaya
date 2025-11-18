package config

import (
	"log"
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

// Validate ensures that required configuration values are set
func (c *Config) Validate() {
	if c.JWTSecret == "" || c.JWTSecret == "default-secret-key-change-in-production" {
		log.Println("[WARNING] JWT_SECRET is using default value - this is insecure for production")
	}
	if c.EncryptionKey == "" || c.EncryptionKey == "default-encryption-key-change-in-production" {
		log.Println("[WARNING] ENCRYPTION_KEY is using default value - this is insecure for production")
	}
	if c.DBPassword == "" || c.DBPassword == "password" {
		log.Println("[WARNING] DB_PASSWORD is using default value - this is insecure for production")
	}
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

	// Validate configuration after loading
	cfg.Validate()

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}