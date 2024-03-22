import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { } from '@redux-devtools/extension';
import UserInterface from '../interfaces/user.interface';
interface User {
  blocked: boolean;
  confirmed: boolean;
  email: string;
  first_lastname: string;
  firstname: string;
  id: number;
  second_lastname: string;
  secondname: string;
  username: string;
  createdAt: string;
  establishment: number;
  provider: string;
}
interface role {
  id: number;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type State = {
  user: User;
  bearer: string;
  role: role

  isLoading: Boolean
};



type Actions = {
  setUser(user: User): void;
  setBearer(bearer: string): void;
  setRole(role: role): void;

  GetRole(): string;
};

export const useUserStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        user: {blocked:false,confirmed:false,email: '',first_lastname: '',firstname: '',id: 0,second_lastname: '',secondname: '',username: '',createdAt :'',establishment : 0,provider:'local',},
        bearer: '',

        isLoading: true,
        role: { createdAt: '', description: '', id: 0, name: '', type: '', updatedAt: '', },
        GetRole: () => {
          const { role } = get();
          return role.name
        },
        setRole: (role: role) => set((state) => ({ ...state, role })),
        setBearer: (bearer: string) => set((state) => ({ ...state, bearer })),
        setUser: (user: User) => set((state) => ({ ...state, user })),
      }), 
      { name: 'user-Store',
      storage: createJSONStorage(() => localStorage), 
       }))
);