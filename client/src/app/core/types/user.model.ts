
export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  role: 'guest' | 'admin' | 'user';
  email: string;
}
