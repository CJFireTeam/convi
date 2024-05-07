import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { } from '@redux-devtools/extension';
import { ArchiveBoxIcon, Cog6ToothIcon, HomeIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/20/solid';
export interface Imenus {
  name: string;
  href: string;
  current: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >
}

interface IMenuChildren extends Imenus{
  children:Imenus[];
}

const AuthenticatedMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false,children:[] },
  {
    name: "Te Escuchamos",
    
    children:[],
    href: "/te_escuchamos",
    icon: UsersIcon,
    current: false,
  },
  // { name: "Casos", href: "/casos", icon: UsersIcon, current: false },
  {
    name: "Sugerencias",
    href: "/sugerencia",
    icon: LightBulbIcon,
    current: false,
    children:[]
  },
]

const EncargadoMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon,children:[], current: false },
  {
    name: "Gestion De Casos",
    href: "/gestion",
    children:[
      {name:"Denuncias",current:false,href:"/",icon:Cog6ToothIcon}
    ],
    icon: Cog6ToothIcon,
    current: false,
  },
];

const ProfesorMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false,children:[] },
  {
    name: "Denuncia",
    href: "/casos/denuncia",
    icon: UsersIcon,
    children:[],
    current: false,
  },
  {
    name: "Lista de casos",
    href: "/casos",
    icon: ArchiveBoxIcon,
    children:[],
    current: false,
  },
];

type Actions = {
  setMenusAuthenticated(): void;
  setMenusEncargado(): void;
  setMenusProfesor(): void;
  setActive(href: string): void;
};
type State = {
  menus: IMenuChildren[];
};


export const useMenuStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      menus: [],
      setMenusAuthenticated: () => set((state) => ({ menus: AuthenticatedMenus })),
      setMenusEncargado: () => set((state) => ({ menus: EncargadoMenus })),
      setMenusProfesor: () => set((state) => ({ menus: ProfesorMenus })),
      setActive: (href: string) =>
        set((state) => ({
          menus: state.menus.map((menu) => ({
            ...menu,
            current: menu.href === href,
          })),
        }))
    }),
    { name: 'menuStore' })
);