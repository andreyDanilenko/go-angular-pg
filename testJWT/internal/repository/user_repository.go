package repository

import (
	"admin/panel/testJWT/internal/model"
	"context"
	"database/sql"

	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, input model.SignUpInput) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO users (username, email, password)
		VALUES ($1, $2, $3)
		RETURNING id, username, email, created_at, updated_at
	`

	user := &model.User{}
	err = r.db.QueryRowContext(ctx, query, input.Username, input.Email, string(hashedPassword)).
		Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT id, username, email, password, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &model.User{}
	err := r.db.QueryRowContext(ctx, query, email).
		Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}
