package service

import (
	"database/sql"
	"testing"
	"kursovaya_backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// Mock database for testing
type MockDB struct {
	users map[string]string // email -> hashed password
}

func (m *MockDB) QueryRow(query string, args ...interface{}) *sql.Row {
	// Имитация sql.Row для тестирования
	// В реальном приложении для тестов можно использовать sqlmock
	return nil
}

func (m *MockDB) Query(query string, args ...interface{}) (*sql.Rows, error) {
	// Возвращаем фиктивный результат в зависимости от запроса
	if query == "SELECT COUNT(*) FROM users WHERE email = $1" {
		email := args[0].(string)
		_, exists := m.users[email]
		// Создаем фиктивный результат с количеством
		// (реализация здесь упрощена для демонстрации)
	}
	return nil, nil
}

func (m *MockDB) Exec(query string, args ...interface{}) (sql.Result, error) {
	if query == "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id" {
		email := args[0].(string)
		hashedPassword := args[1].(string)
		m.users[email] = hashedPassword
		return &MockResult{id: len(m.users)}, nil
	}
	return nil, nil
}

type MockResult struct {
	id int
}

func (m *MockResult) LastInsertId() (int64, error) {
	return int64(m.id), nil
}

func (m *MockResult) RowsAffected() (int64, error) {
	return 1, nil
}

// Тест регистрации нового пользователя
func TestRegisterUserWithDB(t *testing.T) {
	// Подготовка
	mockDB := &MockDB{users: make(map[string]string)}
	email := "test@example.com"
	password := "password123"

	// Выполнение
	user, err := RegisterUserWithDB(mockDB, email, password)

	// Проверка
	if err != nil {
		t.Errorf("Ожидается успешная регистрация, получена ошибка: %v", err)
		return
	}

	if user == nil {
		t.Error("Ожидается созданный пользователь, получен nil")
		return
	}

	if user.Email != email {
		t.Errorf("Ожидается email %s, получен %s", email, user.Email)
	}

	// Проверим, что пользователь был добавлен в mockDB
	if _, exists := mockDB.users[email]; !exists {
		t.Error("Ожидается, что пользователь был добавлен в базу данных")
	}
}

// Тест регистрации пользователя с уже существующим email
func TestRegisterUserDuplicate(t *testing.T) {
	// Подготовка
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	mockDB := &MockDB{users: map[string]string{
		"existing@example.com": string(hashedPassword),
	}}
	email := "existing@example.com"
	newPassword := "newpassword123"

	// Выполнение
	_, err := RegisterUserWithDB(mockDB, email, newPassword)

	// Проверка
	if err == nil {
		t.Error("Ожидается ошибка при регистрации с существующим email, получено nil")
	} else {
		// Проверим, что это именно ошибка о существующем пользователе
		// todo: проверить тип ошибки
	}
}

// Тест аутентификации пользователя
func TestAuthenticateUserWithDB(t *testing.T) {
	// Подготовка
	email := "test@example.com"
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	mockDB := &MockDB{users: map[string]string{
		email: string(hashedPassword),
	}}

	// Выполнение
	user, err := AuthenticateUserWithDB(mockDB, email, password)

	// Проверка
	if err != nil {
		t.Errorf("Ожидается успешная аутентификация, получена ошибка: %v", err)
		return
	}

	if user == nil {
		t.Error("Ожидается аутентифицированный пользователь, получен nil")
		return
	}

	if user.Email != email {
		t.Errorf("Ожидается email %s, получен %s", email, user.Email)
	}
}

// Тест аутентификации с неверным паролем
func TestAuthenticateUserInvalidPassword(t *testing.T) {
	// Подготовка
	email := "test@example.com"
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	invalidPassword := "wrongpassword"

	mockDB := &MockDB{users: map[string]string{
		email: string(hashedPassword),
	}}

	// Выполнение
	_, err := AuthenticateUserWithDB(mockDB, email, invalidPassword)

	// Проверка
	if err == nil {
		t.Error("Ожидается ошибка при аутентификации с неверным паролем, получено nil")
	}
}

// Тест аутентификации несуществующего пользователя
func TestAuthenticateNonExistentUser(t *testing.T) {
	// Подготовка
	email := "nonexistent@example.com"
	password := "password123"

	mockDB := &MockDB{users: make(map[string]string)}

	// Выполнение
	_, err := AuthenticateUserWithDB(mockDB, email, password)

	// Проверка
	if err == nil {
		t.Error("Ожидается ошибка при аутентификации несуществующего пользователя, получено nil")
	}
}