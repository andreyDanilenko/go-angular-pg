
export interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  created_at: Date | string;
  updated_at: Date | string;
  role: 'guest' | 'admin' | 'user';
  email: string;
}
