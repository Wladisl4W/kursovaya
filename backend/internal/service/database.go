package service

import (
	"database/sql"
)

// DBInterface определяет интерфейс для работы с базой данных
type DBInterface interface {
	QueryRow(query string, args ...interface{}) *sql.Row
	Query(query string, args ...interface{}) (*sql.Rows, error)
	Exec(query string, args ...interface{}) (sql.Result, error)
}

// реализация DBInterface для реальной базы данных
type RealDB struct {
	DB *sql.DB
}

func (r *RealDB) QueryRow(query string, args ...interface{}) *sql.Row {
	return r.DB.QueryRow(query, args...)
}

func (r *RealDB) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return r.DB.Query(query, args...)
}

func (r *RealDB) Exec(query string, args ...interface{}) (sql.Result, error) {
	return r.DB.Exec(query, args...)
}