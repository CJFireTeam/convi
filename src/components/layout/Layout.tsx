import { Children, Fragment, ReactNode, useEffect, useState } from "react";
import { Dialog, Transition, Menu, Disclosure } from "@headlessui/react";
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
  } = useUserStore();
  const [navigation, setNavigation] = useState<
    {
      name: string;
      href: string;
      icon: React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
          title?: string;
          titleId?: string;
        } & React.RefAttributes<SVGSVGElement>
      >;
      current: boolean;
    }[]
  >([]);
  const { Loader, setLoader } = useLoaderContext();
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { push } = useRouter();
  const pathname = usePathname();
  const [role, setRoleUI] = useState("");
  useEffect(() => {
    if (pathname === "/") {
      const updatedNavigation = navigation.map((element) => ({
        ...element,
        current: element.href === "/",
      }));
      setNavigation(updatedNavigation);
      setTitle("Dashboard");
    } else {
      const segments = pathname.split("/");
      const firstSegment = segments[1];
      const updatedNavigation = navigation.map((element) => ({
        ...element,
        current: element.href === "/" + firstSegment,
      }));
      setNavigation(updatedNavigation);
      setTitle(capitalizeFirstLetter(firstSegment));
    }
  }, [pathname]);

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function desconectar() {
    Cookies.remove("bearer");
    Cookies.remove("establishment");
    Cookies.remove("role");
    push("/login");
  }
  function redirection(e: any) {
    if (e.href === "/logout") {
      desconectar();
      return;
    }
    push(e.href);
  }

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

  useEffect(() => {
    if (useUserStore.getState().GetRole() === "Authenticated") {
      setNavigation([
        { name: "Home", href: "/", icon: HomeIcon, current: true },
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
      ]);
    }
    if (useUserStore.getState().GetRole() === "Encargado de Convivencia Escolar") {
      setNavigation([
        { name: "Home", href: "/", icon: HomeIcon, current: true },
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
      ]);
    }
  }, [useUserStore.getState().GetRole()]);

  return (
    <>
      <Disclosure as="nav" className="bg-white shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center"></div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                    {navigation.map((item, index) => (
                      <a
                        key={index}
                        className={classNames(
                          "animate-fadein",
                          item.current
                            ? "inline-flex items-center border-b-2 border-primary px-1 pt-1 text-sm font-medium text-gray-900 cursor-pointer "
                            : "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 cursor-pointer"
                        )}
                        // className="inline-flex items-center ${} px-1 pt-1 text-sm font-medium text-gray-900"
                        onClick={() => redirection(item)}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0 mr-1"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                      
                    ))}
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="absolute -inset-1.5" />
                        <span className="text-black mt-1 mr-1"> {user.firstname} {user.first_lastname}</span>
                        <span className="sr-only">Open user menu</span>
                        <UserIcon className="h-8 w-8 rounded-full" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                onClick={() => redirection(item)}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                                )}
                              >
                                <span className="cursor-pointer">
                                  {item.name}
                                </span>
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <Menu as="div" className="relative ml-4 flex-shrink-0">
                <div>
                  <Menu.Button className="relative flex rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-4 pt-2">
                {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                {navigation.map((item, index) => (
                  <Disclosure.Button
                    key={index}
                    as="a"
                    className={classNames(
                      "cursor-pointer animate-fadein",
                      item.current
                        ? "flex items-center justify-between block border-l-4 border-primary bg-primary bg-opacity-10 py-2 pl-3 pr-4 text-base font-medium text-primary"
                        : "flex items-center justify-between block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    )}
                    onClick={() => redirection(item)}
                  >
                    <div className="inline-block flex items-center">
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="mx-2">{item.name}</span>
                    </div>
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">{props.children}</div>
      </main>
    </>
  );
}
