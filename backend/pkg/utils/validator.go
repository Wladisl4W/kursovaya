package utils

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/locales/ru_RU"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	ru_translations "github.com/go-playground/validator/v10/translations/ru"
)

var (
	uni      *ut.UniversalTranslator
	validate *validator.Validate
	trans    ut.Translator
)

func init() {
	// Инициализируем локализацию
	ru := ru_RU.New()
	uni = ut.New(ru, ru)
	trans, _ = uni.GetTranslator("ru")

	// Создаем валидатор
	validate = validator.New()

	// Регистрируем теги на русском языке
	_ = ru_translations.RegisterDefaultTranslations(validate, trans)

	// Регистрируем собственные теги
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

func ValidateStruct(s interface{}) map[string]string {
	errs := make(map[string]string)

	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			fieldName := err.Field()
			switch err.Tag() {
			case "required":
				errs[fieldName] = "Поле обязательно для заполнения"
			case "email":
				errs[fieldName] = "Некорректный email"
			case "min":
				if err.Param() == "6" {
					errs[fieldName] = "Поле должно содержать минимум 6 символов"
				} else if err.Param() == "8" {
					errs[fieldName] = "Поле должно содержать минимум 8 символов"
				} else {
					errs[fieldName] = fmt.Sprintf("Поле должно содержать минимум %s символов", err.Param())
				}
			case "max":
				errs[fieldName] = fmt.Sprintf("Поле должно содержать максимум %s символов", err.Param())
			case "len":
				errs[fieldName] = fmt.Sprintf("Поле должно содержать %s символов", err.Param())
			default:
				errs[fieldName] = fmt.Sprintf("Некорректное значение в поле %s", fieldName)
			}
		}
	}

	return errs
}