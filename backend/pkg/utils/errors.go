package utils

import (
	"strings"
)

// Переводим системные ошибки в понятные сообщения на русском
func LocalizeError(err error) string {
	if err == nil {
		return ""
	}

	errorMsg := err.Error()

	// Обрабатываем специфичные ошибки приложения
	switch {
	case strings.Contains(errorMsg, "user with this email already exists"):
		return "Пользователь с таким email уже существует"
	case strings.Contains(errorMsg, "user not found"):
		return "Пользователь не найден"
	case strings.Contains(errorMsg, "invalid password"):
		return "Неверный пароль"
	case strings.Contains(errorMsg, "failed to generate token"):
		return "Ошибка генерации токена"
	default:
		// Для остальных ошибок возвращаем общее сообщение
		return "Произошла ошибка. Пожалуйста, попробуйте позже"
	}
}

// Проверяем, является ли ошибка системной ошибкой валидации
func IsValidationError(err error) bool {
	if err == nil {
		return false
	}

	errorMsg := err.Error()
	return strings.Contains(errorMsg, "Field validation") ||
		   strings.Contains(errorMsg, "validation failed")
}