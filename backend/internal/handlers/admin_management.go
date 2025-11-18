package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kursovaya_backend/internal/database"
	"kursovaya_backend/internal/models"
)

// AdminManagementHandler contains handlers for admin-specific management functions
type AdminManagementHandler struct{}

// GetStats returns system statistics for the admin dashboard
func (h *AdminManagementHandler) GetStats(c *gin.Context) {
	var stats struct {
		Users    int `json:"users"`
		Stores   int `json:"stores"`
		Products int `json:"products"`
		Mappings int `json:"mappings"`
	}

	// Get user count
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.Users)
	if err != nil {
		log.Printf("Error getting user count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user statistics"})
		return
	}

	// Get store count
	err = database.DB.QueryRow("SELECT COUNT(*) FROM stores").Scan(&stats.Stores)
	if err != nil {
		log.Printf("Error getting store count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get store statistics"})
		return
	}

	// Get product count
	err = database.DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&stats.Products)
	if err != nil {
		log.Printf("Error getting product count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get product statistics"})
		return
	}

	// Get mapping count
	err = database.DB.QueryRow("SELECT COUNT(*) FROM product_mappings").Scan(&stats.Mappings)
	if err != nil {
		log.Printf("Error getting mapping count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get mapping statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetUsers returns a list of all users
func (h *AdminManagementHandler) GetUsers(c *gin.Context) {
	var users []models.User
	rows, err := database.DB.Query("SELECT id, email FROM users")
	if err != nil {
		log.Printf("Error getting users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Email); err != nil {
			log.Printf("Error scanning user: %v", err)
			continue
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

// GetUser returns a specific user by ID
func (h *AdminManagementHandler) GetUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user models.User
	err = database.DB.QueryRow("SELECT id, email FROM users WHERE id = $1", id).
		Scan(&user.ID, &user.Email)
	if err != nil {
		log.Printf("Error getting user %d: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetStores returns a list of all stores
func (h *AdminManagementHandler) GetStores(c *gin.Context) {
	var stores []models.Store
	rows, err := database.DB.Query("SELECT id, user_id, store_type FROM stores")
	if err != nil {
		log.Printf("Error getting stores: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stores"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var store models.Store
		if err := rows.Scan(&store.ID, &store.UserID, &store.Type); err != nil {
			log.Printf("Error scanning store: %v", err)
			continue
		}
		stores = append(stores, store)
	}

	c.JSON(http.StatusOK, stores)
}

// GetStore returns a specific store by ID
func (h *AdminManagementHandler) GetStore(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var store models.Store
	err = database.DB.QueryRow("SELECT id, user_id, store_type FROM stores WHERE id = $1", id).
		Scan(&store.ID, &store.UserID, &store.Type)
	if err != nil {
		log.Printf("Error getting store %d: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	c.JSON(http.StatusOK, store)
}

// GetProducts returns a list of all products
func (h *AdminManagementHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	rows, err := database.DB.Query("SELECT id, store_id, external_id, name, price, quantity FROM products")
	if err != nil {
		log.Printf("Error getting products: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get products"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var product models.Product
		if err := rows.Scan(&product.ID, &product.StoreID, &product.ExternalID, &product.Name, &product.Price, &product.Quantity); err != nil {
			log.Printf("Error scanning product: %v", err)
			continue
		}
		products = append(products, product)
	}

	c.JSON(http.StatusOK, products)
}

// GetProduct returns a specific product by ID
func (h *AdminManagementHandler) GetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	err = database.DB.QueryRow("SELECT id, store_id, external_id, name, price, quantity FROM products WHERE id = $1", id).
		Scan(&product.ID, &product.StoreID, &product.ExternalID, &product.Name, &product.Price, &product.Quantity)
	if err != nil {
		log.Printf("Error getting product %d: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// GetMappings returns a list of all product mappings
func (h *AdminManagementHandler) GetMappings(c *gin.Context) {
	var mappings []models.ProductMapping
	rows, err := database.DB.Query("SELECT id, product1_id, product2_id, user_id FROM product_mappings")
	if err != nil {
		log.Printf("Error getting mappings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get mappings"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var mapping models.ProductMapping
		if err := rows.Scan(&mapping.ID, &mapping.Product1ID, &mapping.Product2ID, &mapping.UserID); err != nil {
			log.Printf("Error scanning mapping: %v", err)
			continue
		}
		mappings = append(mappings, mapping)
	}

	c.JSON(http.StatusOK, mappings)
}

// GetMapping returns a specific product mapping by ID
func (h *AdminManagementHandler) GetMapping(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mapping ID"})
		return
	}

	var mapping models.ProductMapping
	err = database.DB.QueryRow("SELECT id, product1_id, product2_id, user_id FROM product_mappings WHERE id = $1", id).
		Scan(&mapping.ID, &mapping.Product1ID, &mapping.Product2ID, &mapping.UserID)
	if err != nil {
		log.Printf("Error getting mapping %d: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Mapping not found"})
		return
	}

	c.JSON(http.StatusOK, mapping)
}

// DeleteUser deletes a user by ID
func (h *AdminManagementHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Check if user exists
	var exists int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE id = $1", id).Scan(&exists)
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete the user
	result, err := database.DB.Exec("DELETE FROM users WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting user %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	if rowsAffected, err := result.RowsAffected(); err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// DeleteStore deletes a store by ID
func (h *AdminManagementHandler) DeleteStore(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	// Check if store exists
	var exists int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM stores WHERE id = $1", id).Scan(&exists)
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Delete the store
	result, err := database.DB.Exec("DELETE FROM stores WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting store %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete store"})
		return
	}

	if rowsAffected, err := result.RowsAffected(); err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store deleted successfully"})
}

// DeleteProduct deletes a product by ID
func (h *AdminManagementHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	// Check if product exists
	var exists int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM products WHERE id = $1", id).Scan(&exists)
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Delete the product
	result, err := database.DB.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting product %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	if rowsAffected, err := result.RowsAffected(); err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// DeleteMapping deletes a product mapping by ID
func (h *AdminManagementHandler) DeleteMapping(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mapping ID"})
		return
	}

	// Check if mapping exists
	var exists int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM product_mappings WHERE id = $1", id).Scan(&exists)
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mapping not found"})
		return
	}

	// Delete the mapping
	result, err := database.DB.Exec("DELETE FROM product_mappings WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting mapping %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete mapping"})
		return
	}

	if rowsAffected, err := result.RowsAffected(); err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mapping not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mapping deleted successfully"})
}