package services

import (
	"errors"
	"regexp"
	"strconv"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// PasswordService handles password hashing, verification, and validation
type PasswordService struct {
	minLength           int
	requireUppercase    bool
	requireNumbers      bool
	requireSpecialChars bool
}

// ValidationError represents password validation errors
type ValidationError struct {
	Field   string
	Message string
}

// NewPasswordService creates a new password service instance
func NewPasswordService(minLength int, requireUppercase, requireNumbers, requireSpecial bool) *PasswordService {
	return &PasswordService{
		minLength:           minLength,
		requireUppercase:    requireUppercase,
		requireNumbers:      requireNumbers,
		requireSpecialChars: requireSpecial,
	}
}

// HashPassword hashes a password using bcrypt
// Returns error if password validation fails
func (ps *PasswordService) HashPassword(password string) (string, error) {
	// Validate password first
	if err := ps.ValidatePassword(password); err != nil {
		return "", err
	}

	// Hash with bcrypt (cost = 12 is balanced between security and performance)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

// VerifyPassword checks if a plain text password matches a hash
func (ps *PasswordService) VerifyPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}

// ValidatePassword validates password against configured rules
// Returns error if password doesn't meet requirements
func (ps *PasswordService) ValidatePassword(password string) error {
	if password == "" {
		return errors.New("password cannot be empty")
	}

	// Check length
	if len(password) < ps.minLength {
		return errors.New("password must be at least " + strconv.Itoa(ps.minLength) + " characters long")
	}

	// Check uppercase
	if ps.requireUppercase && !hasUppercase(password) {
		return errors.New("password must contain at least one uppercase letter")
	}

	// Check numbers
	if ps.requireNumbers && !hasNumbers(password) {
		return errors.New("password must contain at least one number")
	}

	// Check special characters
	if ps.requireSpecialChars && !hasSpecialChars(password) {
		return errors.New("password must contain at least one special character (!@#$%^&*)")
	}

	return nil
}

// ValidatePasswordWithDetails returns all validation errors
func (ps *PasswordService) ValidatePasswordWithDetails(password string) []ValidationError {
	var errors []ValidationError

	if password == "" {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password cannot be empty",
		})
		return errors
	}

	if len(password) < ps.minLength {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password must be at least " + strconv.Itoa(ps.minLength) + " characters long",
		})
	}

	if ps.requireUppercase && !hasUppercase(password) {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password must contain at least one uppercase letter",
		})
	}

	if ps.requireNumbers && !hasNumbers(password) {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password must contain at least one number",
		})
	}

	if ps.requireSpecialChars && !hasSpecialChars(password) {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password must contain at least one special character (!@#$%^&*)",
		})
	}

	return errors
}

// Helper functions

func hasUppercase(s string) bool {
	for _, r := range s {
		if r >= 'A' && r <= 'Z' {
			return true
		}
	}
	return false
}

func hasNumbers(s string) bool {
	matched, _ := regexp.MatchString(`\d`, s)
	return matched
}

func hasSpecialChars(s string) bool {
	specialChars := "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
	for _, char := range s {
		if strings.ContainsRune(specialChars, char) {
			return true
		}
	}
	return false
}
