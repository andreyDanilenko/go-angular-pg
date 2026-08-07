export type UserRole = 'guest' | 'user' | 'admin';

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string;
  bio: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = Pick<
  User,
  'username' | 'firstName' | 'lastName' | 'middleName' | 'bio'
>;

export type UserDto = {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  bio?: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    username: dto.username ?? '',
    firstName: dto.first_name ?? '',
    lastName: dto.last_name ?? '',
    middleName: dto.middle_name ?? '',
    bio: dto.bio ?? '',
    email: dto.email,
    role: dto.role,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
