import { Children, Fragment, ReactNode, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  LightBulbIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { useLoaderContext } from "../../context/loader";
import axios from "axios";
import { redirect, usePathname, useRouter } from "next/navigation";
import Head from "next/head";
import { useUserStore } from "../../store/userStore";
import { api_me } from "../../services/axios.services";
import { Imenus, useMenuStore } from "../../store/menus.store";
import { Button, Dropdown, Menu, Navbar } from "react-daisyui";
type LayoutProps = {
  children: ReactNode;
};
const userNavigation = [
  { name: "Mi perfil", href: "/perfil" },
  { name: "Desconectar", href: "/logout" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout(props: LayoutProps) {
  const {
    setUser,
    bearer,
    setRole,
    GetRole,
    user,
    isLoading,
    setStablishment,
    GetStablishment,
    desconectar
  } = useUserStore();

  const { Loader, setLoader } = useLoaderContext();
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { push } = useRouter();
  const pathname = usePathname();
  const [role, setRoleUI] = useState("");
  const { menus, setMenusAuthenticated, setMenusEncargado, setMenusProfesor, setActive } = useMenuStore()
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function logout() {
    Cookies.remove("bearer");
    Cookies.remove("establishment");
    Cookies.remove("role");
    desconectar();
    push("/login");
  }
  function redirection(e: any) {
    if (e.href === "/logout") {
      desconectar();
      return;
    }
    push(e.href);
    sessionStorage.clear();
  }
  useEffect(() => {
    if (useUserStore.getState().GetRole() === "Authenticated") setMenusAuthenticated()
    if (useUserStore.getState().GetRole() === "Encargado de Convivencia Escolar") setMenusEncargado()
    if (useUserStore.getState().GetRole() === "Profesor") setMenusProfesor()
    setActive(pathname);
  }, [useUserStore.getState().GetRole(), pathname]);

  useEffect(() => {
    (async () => { })();
    const me = async () => {
      try {
        const data = await api_me();
        setUser(data.data);
        if (GetRole() !== "Authenticated") {
          setRoleUI(capitalizeFirstLetter(data.data.role.name));
        }

        setRole(data.data.role);
        setLoader(false);
      } catch (error) {
        setLoader(false);
        Cookies.remove("bearer");
        //push("/login");
      }
    };
    me();
  }, []);

  return (
    <>
      <Navbar className=" shadow-xl shadow">
        <Navbar.Start>
          <Dropdown>
            <Button tag="label" color="ghost" tabIndex={0} className="lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </Button>

            <Dropdown.Menu tabIndex={0} className="w-52 menu-sm mt-3 z-[1]">
              {useMenuStore.getState().menus.map((item, index) => (
                <Dropdown.Item key={index} onClick={() => redirection(item)}>
                  {item.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <a className="btn btn-ghost normal-case text-xl">Convi</a>
        </Navbar.Start>
        <Navbar.Center className="hidden lg:flex">
          <Menu horizontal className="px-1">
            {useMenuStore.getState().menus.map((item, index) => (
              (
                item.children.length !== 0 ?
                  <Menu.Item key={index}>
                    <details>
                      <summary>{item.name}</summary>
                      <ul className="p-2">
                        {item.children.map((submenu, index) => (
                          <Menu.Item key={index} onClick={() => redirection(submenu)}>
                            <a>{submenu.name}</a>
                          </Menu.Item>
                        ))}
                      </ul>
                    </details>
                  </Menu.Item> :
                  <Menu.Item key={index}>
                    <a className={item.current ? "active" : ""} onClick={() => redirection(item)}>
                      <item.icon
                        className="h-6 w-6 shrink-0 mr-1"
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  </Menu.Item>
              )
            ))}

          </Menu>
        </Navbar.Center>

        <Navbar.End>
          <Dropdown >
            <Button>
              <UserIcon className="h-6 w-6 mr-1" aria-hidden="true" />
              {userNavigation[0].name} {/* Usamos el primer elemento de userNavigation */}
            </Button>
            <Dropdown.Menu>
            <Dropdown.Item  onClick={() => push("/perfil")}>
                  Mi Perfil
                </Dropdown.Item>
            <Dropdown.Item  onClick={logout}>
                  Desconectar
            </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.End>
      </Navbar>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">{props.children}</div>
      </main>
    </>
  );
}

