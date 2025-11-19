package errors

import (
	"fmt"
	"log"
	"net/http"
	"runtime"
	"strings"
)

// AppError - структура для хранения информации об ошибке
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// Error возвращает строковое представление ошибки
func (e *AppError) Error() string {
	return fmt.Sprintf("code=%d, message=%s, details=%s", e.Code, e.Message, e.Details)
}

// NewAppError создает новый экземпляр AppError
func NewAppError(code int, message string, details string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Details: details,
	}
}

// BadRequest создает ошибку с кодом 400
func BadRequest(message string, details string) *AppError {
	return &AppError{
		Code:    http.StatusBadRequest,
		Message: message,
		Details: details,
	}
}

// Unauthorized создает ошибку с кодом 401
func Unauthorized(message string, details string) *AppError {
	return &AppError{
		Code:    http.StatusUnauthorized,
		Message: message,
		Details: details,
	}
}

// Forbidden создает ошибку с кодом 403
func Forbidden(message string, details string) *AppError {
	return &AppError{
		Code:    http.StatusForbidden,
		Message: message,
		Details: details,
	}
}

// NotFound создает ошибку с кодом 404
func NotFound(message string, details string) *AppError {
	return &AppError{
		Code:    http.StatusNotFound,
		Message: message,
		Details: details,
	}
}

// InternalServerError создает ошибку с кодом 500
func InternalServerError(message string, details string) *AppError {
	return &AppError{
		Code:    http.StatusInternalServerError,
		Message: message,
		Details: details,
	}
}

// ValidationError создает ошибку валидации с кодом 422
func ValidationError(message string, details string) *AppError {
	return &AppError{
		Code:    422, // Unprocessable Entity
		Message: message,
		Details: details,
	}
}

// LogError логирует ошибку с информацией о месте возникновения
func LogError(err error) {
	if err == nil {
		return
	}

	// Получаем информацию о вызывающей функции
	pc, file, line, ok := runtime.Caller(1)
	if !ok {
		log.Printf("[ERROR] %v\n", err)
		return
	}

	fn := runtime.FuncForPC(pc)
	fileName := strings.Split(file, "/") // Берем только имя файла, а не весь путь
	log.Printf("[ERROR] %s:%d %s() - %v\n", fileName[len(fileName)-1], line, fn.Name(), err)
}

// LogAppError логирует AppError с дополнительной информацией
func LogAppError(err *AppError) {
	if err == nil {
		return
	}

	// Получаем информацию о вызывающей функции
	pc, file, line, ok := runtime.Caller(1)
	if !ok {
		log.Printf("[ERROR] code=%d, message=%s, details=%s\n", err.Code, err.Message, err.Details)
		return
	}

	fn := runtime.FuncForPC(pc)
	fileName := strings.Split(file, "/") // Берем только имя файла, а не весь путь
	log.Printf("[ERROR] %s:%d %s() - code=%d, message=%s, details=%s\n", 
		fileName[len(fileName)-1], line, fn.Name(), err.Code, err.Message, err.Details)
}