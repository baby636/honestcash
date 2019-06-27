import User from 'app/user/models/user';

export interface UserState {
  user: User | null;
}

export const initialUserState: UserState = {
  user: null
};
