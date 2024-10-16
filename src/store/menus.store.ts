import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import {
  ArchiveBoxIcon,
  Cog6ToothIcon,
  HomeIcon,
  LightBulbIcon,
  UsersIcon,
  FolderIcon,
} from "@heroicons/react/20/solid";
export interface Imenus {
  name: string;
  href: string;
  current: boolean;
  specialStyle?: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
}
interface IMenuChildren extends Imenus {
  children: Imenus[];
}

const AuthenticatedMenus: IMenuChildren[] = [
  {
    name: "Te Escuchamos",
    children: [],
    href: "/te_escuchamos",
    icon: UsersIcon,
    current: false,
    specialStyle: true,
  },
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
    current: false,
    children: [],
  },
  // { name: "Casos", href: "/casos", icon: UsersIcon, current: false },
  {
    name: "Consulta y sugerencia",
    href: "/sugerencia",
    icon: LightBulbIcon,
    current: false,
    children: [],
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: FolderIcon,
    children: [],
    current: false,
  },
];

const EncargadoMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, children: [], current: false },
  {
    name: "Gestion De Casos",
    href: "/gestion",
    children: [
      {
        name: "Denuncias",
        current: false,
        href: "/casos",
        icon: Cog6ToothIcon,
      },
    ],
    icon: Cog6ToothIcon,
    current: false,
  },
  {
    name: "Configuracion",
    href: "/configuracion",
    icon: Cog6ToothIcon,
    children: [],
    current: false,
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: FolderIcon,
    children: [],
    current: false,
  },
  {
    name: "Reunion",
    href: "/meeting",
    icon: FolderIcon,
    children: [],
    current: false,
  },
  {
    name: "Documentos",
    href: "/documentos",
    icon: FolderIcon,
    children: [],
    current: false,
  },
];

const ProfesorMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false, children: [] },
  {
    name: "Denuncia",
    href: "/casos/denuncia",
    icon: UsersIcon,
    children: [],
    current: false,
  },
  {
    name: "Lista de casos",
    href: "/casos",
    icon: ArchiveBoxIcon,
    children: [],
    current: false,
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: FolderIcon,
    children: [],
    current: false,
  },
  {
    name: "Reunion",
    href: "/meeting",
    icon: FolderIcon,
    children: [],
    current: false,
  },
];
const AdministradorMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, current: false, children: [] },
  {
    name: "Administrar Usuarios",
    href: "/administrador",
    icon: UsersIcon,
    children: [],
    current: false,
  },
  {
    name: "Configurar Documentos",
    href: "/administrador/documentos",
    icon: UsersIcon,
    children: [],
    current: false,
  }
];

type Actions = {
  setMenusAuthenticated(): void;
  setMenusEncargado(): void;
  setMenusProfesor(): void;
  setMenusAdministrador(): void;
  setActive(href: string): void;
};
type State = {
  menus: IMenuChildren[];
};

export const useMenuStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      menus: [],
      setMenusAuthenticated: () =>
        set((state) => ({ menus: AuthenticatedMenus })),
      setMenusEncargado: () => set((state) => ({ menus: EncargadoMenus })),
      setMenusProfesor: () => set((state) => ({ menus: ProfesorMenus })),
      setMenusAdministrador: () => set((state) => ({ menus: AdministradorMenus })),
      setActive: (href: string) =>
        set((state) => ({
          menus: state.menus.map((menu) => ({
            ...menu,
            current: menu.href === href,
          })),
        })),
    }),
    { name: "menuStore" }
  )
);
