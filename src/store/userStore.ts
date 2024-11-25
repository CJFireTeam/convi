import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { } from '@redux-devtools/extension';
import UserInterface from '../interfaces/user.interface';
import { number } from 'zod';
interface User {
  blocked: boolean;
  confirmed: boolean;
  email: string;
  first_lastname: string;
  firstname: string;
  id: number;
  canUploadDoc:boolean;
  second_lastname: string;
  secondname: string;
  username: string;
  createdAt: string;
  region: string;
  comuna:string;
  direccion:string;
  phone:string;
  establishment_authenticateds:{
    id: number,
    name: string
  }[],
  establishment_courses:{
    Eliminado:boolean;
    Grade:string;
    Letter:string;
    id:number;
  }[],
  establishment: {
    id: number,
    name: string
  };
  provider: string;
  tipo?: null | "alumno" | "apoderado" | "otro";
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
  desconectar(): void;
  setUser(user: User): void;
  setBearer(bearer: string): void;
  setRole(role: role): void;
  setStablishment({name,id}:{name:string,id:number}) : void;
  GetRole(): string;
  GetStablishment() : {name:string,id:number}
  updateUser(userUpdates: Partial<User>): void;
  addSchool(id:number,name: string) : void;
};

const baseRole = { createdAt: '', description: '', id: 0, name: '', type: '', updatedAt: '', }
const baseUser = {establishment_authenticateds:[], blocked:false,confirmed:false,email: '',first_lastname: '',firstname: '',id: 0,canUploadDoc:false,second_lastname: '',secondname: '',username: '',createdAt :'',region:'',comuna:'',direccion: '',phone: '',provider:'local',establishment: {id:0,name:''},establishment_courses:[{Eliminado:false,Grade:'',Letter:'',id:0}]}
export const useUserStore = create<State & Actions>()(
  devtools(
      (set, get) => ({
        user: {establishment_authenticateds:[],blocked:false,confirmed:false,email: '',first_lastname: '',firstname: '',id: 0,canUploadDoc:false,second_lastname: '',secondname: '',username: '',createdAt :'',region:'',comuna:'',direccion: '',phone: '',provider:'local',establishment: {id:0,name:''},establishment_courses:[{Eliminado:false,Grade:'',Letter:'',id:0}]},
        bearer: '',
        isLoading: true,
        role: { createdAt: '', description: '', id: 0, name: '', type: '', updatedAt: '', },
        GetRole: () => {
          const { role } = get();
          return role.name
        },
        GetStablishment() {
            const { user } = get();
            return user.establishment
        },
        setRole: (role: role) => set((state) => ({ ...state, role })),
        setBearer: (bearer: string) => set((state) => ({ ...state, bearer })),
        desconectar: () => set((state) => ({ ...state, user: baseUser, role: baseRole })),
        setUser: (user: User) => set((state) => ({ ...state, user })),
        setStablishment: ({ name, id }: { name: string, id: number }) => set((state) => ({ ...state, user: { ...state.user, establishment: { id, name } } })),
        updateUser: (userUpdates: Partial<User>) => set((state) => ({ ...state, user: { ...state.user, ...userUpdates } })),
        addSchool: (id: number, name: string) =>
          set((state) => ({
            ...state,
            user: {
              ...state.user,
              establishment_authenticateds: [
                ...state.user.establishment_authenticateds,
                { id, name },
              ],
            },
          })),
      }))
);