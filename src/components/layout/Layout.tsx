import {
  Children,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { useLoaderContext } from "../../context/loader";
import axios from "axios";
import { redirect, usePathname, useRouter } from "next/navigation";
import Head from "next/head";
import { useUserStore } from "../../store/userStore";
import { api_me } from "../../services/axios.services";
import { Imenus, useMenuStore } from "../../store/menus.store";
import { Badge, Button, Drawer, Dropdown, Menu, Navbar } from "react-daisyui";
import ModalWhoIS from "../authenticated/modalWhoIs";
import ModalQuestion from "../authenticated/modalQuestion";
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
    desconectar,
  } = useUserStore();

  const { Loader, setLoader } = useLoaderContext();
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { push } = useRouter();
  const pathname = usePathname();
  const [role, setRoleUI] = useState("");
  const {
    menus,
    setMenusAuthenticated,
    setMenusEncargado,
    setMenusProfesor,
    setActive,
  } = useMenuStore();
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
    if (useUserStore.getState().GetRole() === "Authenticated")
      setMenusAuthenticated();
    if (
      useUserStore.getState().GetRole() === "Encargado de Convivencia Escolar"
    )
      setMenusEncargado();
    if (useUserStore.getState().GetRole() === "Profesor") setMenusProfesor();
    setActive(pathname);
  }, [useUserStore.getState().GetRole(), pathname]);

  useEffect(() => {
    (async () => {})();
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

  const [visible, setVisible] = useState(false);
  const toggleVisible = useCallback(() => {
    setVisible((visible) => !visible);
  }, []);
  return (
    <>
      <Drawer
        open={visible}
        onClickOverlay={toggleVisible}
        side={
          <Menu className="p-4 w-60 md:w-80 h-full bg-white z-999">
            {useMenuStore.getState().menus.map((item, index) =>
              item.children.length !== 0 ? (
                <Menu.Item key={index}>
                  <Menu.Details open={true} label={item.name}>

                    {item.children.map((subitem, indexsub) => (
                      <Menu.Item key={indexsub}>
                        <a onClick={() => push(subitem.href)}>{subitem.name}</a>
                      </Menu.Item>
                    ))}
                  </Menu.Details>
                </Menu.Item>
              ) : (
                <Menu.Item key={index}>
                  <a onClick={() => push(item.href)}>{item.name}</a>
                </Menu.Item>
              )
            )}
          </Menu>
        }
      >
        <Navbar className=" shadow-lg">
          <Navbar.Start>
            <div className="flex-none lg:hidden">
              <Button shape="square" color="ghost" onClick={toggleVisible}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-6 h-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </Button>
            </div>
            <a
              onClick={() => push("/")}
              className="btn btn-ghost normal-case text-xl"
            >
              Convi
            </a>
          </Navbar.Start>
          <Navbar.Center className="hidden lg:flex">
            <Menu horizontal className="px-1">
              {useMenuStore.getState().menus.map((item, index) =>
                item.children.length !== 0 ? (
                  <Menu.Item key={index}>
                    <details>
                      <summary>{item.name}</summary>
                      <ul className="p-2">
                        {item.children.map((subitem, subindex) => (
                          <Menu.Item key={subindex}>
                            <a onClick={() => push(subitem.href)}>
                              {subitem.name}
                            </a>
                          </Menu.Item>
                        ))}
                      </ul>
                    </details>
                  </Menu.Item>
                ) : (
                  <Menu.Item key={index}>
                    <a onClick={() => push(item.href)}>{item.name}</a>
                  </Menu.Item>
                )
              )}
            </Menu>
          </Navbar.Center>
          <Navbar.End>
            <Dropdown end>
              <Button
                tag="label"
                tabIndex={0}
                color="ghost"
                className="avatar"
                shape="circle"
              >
                <div className="w-10 rounded-full">
                  <UserIcon className="h-10 w-10 mr-1" aria-hidden="true" />
                </div>
              </Button>
              <Dropdown.Menu className="mt-3 z-[1] w-52 menu-sm">
            <Dropdown.Item onClick={() => push("/perfil")}>Mi perfil</Dropdown.Item>
            <Dropdown.Item onClick={() => logout()}> Desconectar</Dropdown.Item>
          </Dropdown.Menu>
            </Dropdown>{" "}
          </Navbar.End>
        </Navbar>
      </Drawer>
      <main className="py-10">
      {GetRole() === "Authenticated" && <><ModalWhoIS /><ModalQuestion/>  </>}
        <div className="px-4 sm:px-6 lg:px-8">{props.children}</div>
      </main>
    </>
  );
}
