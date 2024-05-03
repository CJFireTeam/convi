import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { } from '@redux-devtools/extension';
import { ArchiveBoxIcon, HomeIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/20/solid';
interface Imenus {
    name: string;
    href: string;
    current:boolean;
    icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
        title?: string;
        titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
    >
}

const AuthenticatedMenus:Imenus[] = [
    { name: "Home", href: "/", icon: HomeIcon, current: false },
    {
      name: "Te Escuchamos",
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
    },
  ]

  const EncargadoMenus:Imenus[] = [
    { name: "Home", href: "/", icon: HomeIcon, current: false },
    {
      name: "Denuncia",
      href: "/casos/crear",
      icon: UsersIcon,
      current: false,
    },
    // { name: "Casos", href: "/casos", icon: UsersIcon, current: false },
    {
      name: "Sugerencias",
      href: "/casos",
      icon: LightBulbIcon,
      current: false,
    },
    {
      name: "Lista de casos",
      href: "/casos",
      icon: ArchiveBoxIcon,
      current: false,
    },
  ];

type Actions = {
  setMenusAuthenticated(): void;
  setMenusEncargado(): void;
  setActive(href:string): void;
};
type State = {
    menus:Imenus[];
  };
  
  
  export const useMenuStore = create<State & Actions>()(
    devtools(
        (set, get) => ({
        menus:[],
        setMenusAuthenticated: () => set((state) => ({ menus:AuthenticatedMenus  })),
        setMenusEncargado: () => set((state) => ({ menus:EncargadoMenus  })),
        setActive: (href: string) =>
            set((state) => ({
              menus: state.menus.map((menu) => ({
                ...menu,
                current: menu.href === href,
              })),
            }))
        }),
    {name:'menuStore'})
  );