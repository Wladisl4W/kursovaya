package handlers

import (
	"kursovaya_backend/internal/errors"
	"github.com/gin-gonic/gin"
)

// GlobalErrorHandler обрабатывает все необработанные ошибки
func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Проверяем, была ли ошибка
		if len(c.Errors) > 0 {
			// Берем первую ошибку из списка
			err := c.Errors[0].Err

			// Проверяем, является ли ошибка нашего типа AppError
			if appErr, ok := err.(*errors.AppError); ok {
				// Уже обработанная ошибка, отправляем как есть
				errors.LogAppError(appErr) // Логируем ошибку
				c.JSON(appErr.Code, gin.H{
					"error":  appErr.Message,
					"details": appErr.Details,
				})
			} else {
				// Неизвестная ошибка, создаем стандартную
				unknownErr := errors.InternalServerError("Неизвестная ошибка", err.Error())
				errors.LogAppError(unknownErr) // Логируем ошибку
				c.JSON(unknownErr.Code, gin.H{
					"error":  unknownErr.Message,
					"details": unknownErr.Details,
				})
			}

			// Прерываем выполнение других обработчиков
			c.Abort()
		}
	}
}

// ValidationErrorHandler обрабатывает ошибки валидации
func ValidationErrorHandler(errs []string) error {
	if len(errs) == 0 {
		return nil
	}

	// Создаем сообщение об ошибке
	var errorMsg string
	for i, err := range errs {
		if i == 0 {
			errorMsg = err
		} else {
			errorMsg += "; " + err
		}
	}

	return errors.ValidationError("Ошибка валидации", errorMsg)
}