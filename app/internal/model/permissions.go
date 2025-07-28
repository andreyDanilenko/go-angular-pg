package model

type Permission string

const (
	PermissionViewArticles   Permission = "view_articles"
	PermissionCreateArticles Permission = "create_articles"
	PermissionEditOwnProfile Permission = "edit_own_profile"
	PermissionEditAnyProfile Permission = "edit_any_profile"
	PermissionSendMessages   Permission = "send_messages"
	// Добавьте другие необходимые разрешения
)

// RolePermissions определяет какие разрешения есть у каждой роли
var RolePermissions = map[UserRole][]Permission{
	RoleAdmin: {
		PermissionViewArticles,
		PermissionCreateArticles,
		PermissionEditOwnProfile,
		PermissionEditAnyProfile,
		PermissionSendMessages,
		// Все разрешения для админа
	},
	RoleUser: {
		PermissionViewArticles,
		PermissionEditOwnProfile,
		PermissionSendMessages,
	},
	RoleGuest: {
		PermissionViewArticles,
	},
}
