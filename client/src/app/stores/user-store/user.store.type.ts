import { User } from "../../core/types/user.model";

export interface UserState {
  users: User[];
  adminUsers: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}
