package model

type Permission string

const (
	PermissionViewAllUsers   Permission = "view_all_users"
	PermissionViewOwnProfile Permission = "view_own_profile"
	PermissionEditOwnProfile Permission = "edit_own_profile"

	PermissionViewAllArticles   Permission = "view_all_articles"
	PermissionViewOwnArticles   Permission = "view_own_articles"
	PermissionCreateArticle     Permission = "create_article"
	PermissionEditOwnArticle    Permission = "edit_own_article"
	PermissionEditAllArticles   Permission = "edit_all_articles"
	PermissionDeleteOwnArticle  Permission = "delete_own_article"
	PermissionDeleteAllArticles Permission = "delete_all_articles"

	PermissionUseChat           Permission = "use_chat"
	PermissionViewAllChats      Permission = "view_all_chats"
	PermissionCreatePrivateChat Permission = "create_private_chat"
	PermissionViewChatHistory   Permission = "view_chat_history"
)

var RolePermissions = map[UserRole][]Permission{
	RoleAdmin: {
		PermissionViewAllUsers,
		PermissionViewOwnProfile,
		PermissionEditOwnProfile,
		PermissionViewAllArticles,
		PermissionCreateArticle,
		PermissionEditAllArticles,
		PermissionDeleteAllArticles,
		PermissionUseChat,
		PermissionViewAllChats,
		PermissionCreatePrivateChat,
		PermissionViewChatHistory,
	},
	RoleUser: {
		PermissionViewOwnProfile,
		PermissionEditOwnProfile,
		PermissionViewAllArticles,
		PermissionViewOwnArticles,
		PermissionCreateArticle,
		PermissionEditOwnArticle,
		PermissionDeleteOwnArticle,
		PermissionUseChat,
	},
	RoleGuest: {
		PermissionViewAllArticles,
	},
}

func GetPermissionsForRole(role UserRole) []Permission {
	return RolePermissions[role]
}
