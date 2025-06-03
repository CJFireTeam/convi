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
  PencilIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  FolderOpenIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/20/solid";
import { ClipboardEditIcon, ClipboardListIcon, FileTextIcon, FolderOpen } from "lucide-react";
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
export interface IMenuChildren extends Imenus {
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
    name: "Casos",
    href: "/",
    icon: ClipboardDocumentListIcon,
    current: false,
    children: [],
  },
  // { name: "Casos", href: "/casos", icon: UsersIcon, current: false },
  {
    name: "Consulta y sugerencia",
    href: "/sugerencia",
    icon: ChatBubbleLeftRightIcon,
    current: false,
    children: [],
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: ClipboardIcon,
    children: [],
    current: false,
  },
  {
    name: "Documentos",
    href: "/documentos",
    icon: FolderOpenIcon,
    children: [],
    current: false,
  },
];

const EncargadoMenus: IMenuChildren[] = [
  { name: "Home", href: "/", icon: HomeIcon, children: [], current: false },
  {
    name: "Gestion De Casos",
    href: "/casos",
    children: [
      {
        name: "Denuncias",
        current: false,
        href: "/casos",
        icon: Cog6ToothIcon,
      },
    ],
    icon: ClipboardDocumentListIcon,
    current: false,
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Cog6ToothIcon,
    children: [],
    current: false,
  },
  {
    name: "Consulta y sugerencia",
    href: "/sugerencia",
    icon: ChatBubbleLeftRightIcon,
    current: false,
    children: [],
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: ClipboardIcon,
    children: [],
    current: false,
  },
  {
    name: "Documentos",
    href: "/documentos",
    icon: FolderOpenIcon,
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
    icon: ClipboardDocumentListIcon,
    children: [],
    current: false,
  },
  {
    name: "Encuestas",
    href: "/encuestas",
    icon: ClipboardIcon,
    children: [],
    current: false,
  },
  {
    name: "Documentos",
    href: "/documentos",
    icon: FolderOpenIcon,
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
    name: "Cursos",
    href: "/administrador/cursos",
    icon: PencilIcon,
    children: [],
    current: false,
  },
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
