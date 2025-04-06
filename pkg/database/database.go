package database

import (
	"admin/panel/configs"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Db struct {
	*gorm.DB
}

func NewDb(config *configs.Config) *Db {
	db, err := gorm.Open(sqlite.Open(config.Db.Dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	return &Db{db}
}
