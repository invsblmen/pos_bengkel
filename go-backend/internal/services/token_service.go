package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenService handles JWT token generation and verification
type TokenService struct {
	secret   string
	issuer   string
	audience string
	expiry   time.Duration
}

// TokenClaims represents the JWT claims
type TokenClaims struct {
	UserID int64    `json:"user_id"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

// NewTokenService creates a new token service instance
func NewTokenService(secret, issuer, audience string, expiry time.Duration) *TokenService {
	return &TokenService{
		secret:   secret,
		issuer:   issuer,
		audience: audience,
		expiry:   expiry,
	}
}

// GenerateToken creates a new JWT token for a user
func (ts *TokenService) GenerateToken(userID int64, email string, roles []string) (string, error) {
	if userID == 0 || email == "" {
		return "", errors.New("user ID and email are required")
	}

	if roles == nil {
		roles = []string{}
	}

	claims := TokenClaims{
		UserID: userID,
		Email:  email,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ts.expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    ts.issuer,
			Audience:  jwt.ClaimStrings{ts.audience},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(ts.secret))
}

// VerifyToken parses and verifies a JWT token
func (ts *TokenService) VerifyToken(tokenString string) (*TokenClaims, error) {
	claims := &TokenClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(ts.secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Verify issuer and audience
	if claims.Issuer != ts.issuer {
		return nil, errors.New("invalid issuer")
	}

	hasAudience := false
	for _, audience := range claims.Audience {
		if audience == ts.audience {
			hasAudience = true
			break
		}
	}

	if !hasAudience {
		return nil, errors.New("invalid audience")
	}

	// Verify expiration (jwt library handles this, but check explicitly)
	if time.Now().After(claims.ExpiresAt.Time) {
		return nil, errors.New("token has expired")
	}

	return claims, nil
}

// RefreshToken creates a new token from existing claims
func (ts *TokenService) RefreshToken(oldToken string) (string, error) {
	claims, err := ts.VerifyToken(oldToken)
	if err != nil {
		return "", err
	}

	// Generate new token with same claims but new expiry
	return ts.GenerateToken(claims.UserID, claims.Email, claims.Roles)
}

// IsExpired checks if a token has expired
func (ts *TokenService) IsExpired(tokenString string) bool {
	claims := &TokenClaims{}

	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(ts.secret), nil
	})

	if err != nil {
		return true
	}

	return time.Now().After(claims.ExpiresAt.Time)
}
