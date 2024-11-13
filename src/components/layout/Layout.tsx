import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";

import { SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { useLoaderContext } from "../../context/loader";
import axios from "axios";
import { redirect, usePathname, useRouter } from "next/navigation";
import Head from "next/head";
import { useUserStore } from "../../store/userStore";
import { api_me } from "../../services/axios.services";
import { IMenuChildren, Imenus, useMenuStore } from "../../store/menus.store";
import ModalWhoIS from "../authenticated/modalWhoIs";
import ModalQuestion from "../authenticated/modalQuestion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronUp, HelpCircle, Home, LogOut, Menu, Settings, User, User2 } from "lucide-react";
import { Button } from "../ui/button";

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
  const pathname = usePathname();
  const [role, setRoleUI] = useState("");
  const {
    menus,
    setMenusAuthenticated,
    setMenusEncargado,
    setMenusProfesor,
    setMenusAdministrador,
    setActive,
  } = useMenuStore();
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (useUserStore.getState().GetRole() === "Authenticated")
      setMenusAuthenticated();
    if (
      useUserStore.getState().GetRole() === "Encargado de Convivencia Escolar"
    )
      setMenusEncargado();
    if (useUserStore.getState().GetRole() === "Profesor") setMenusProfesor();
    if (useUserStore.getState().GetRole() === "admin") setMenusAdministrador();
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

  const [visible, setVisible] = useState(false);
  const toggleVisible = useCallback(() => {
    setVisible((visible) => !visible);
  }, []);


  useEffect(() => {
    const updateTitle = () => {
      setTitle(document.title || "Dashboard")
    }

    // Set initial title
    updateTitle()

    // Listen for title changes
    const targetNode = document.head || document.documentElement
    const config = { subtree: true, childList: true, characterData: true }

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          updateTitle()
          break
        }
      }
    })

    observer.observe(targetNode, config)

    return () => observer.disconnect()
  }, [])

  return (
    // <>
    //    <SidebarProvider>
    //   <AppSidebar items={useMenuStore.getState().menus} firstName={user.firstname} lastName={user.first_lastname}/>
    //   <main >
    //     <SidebarTrigger />
    //   {GetRole() === "Authenticated" && <><ModalWhoIS /><ModalQuestion/>  </>}
    //     {props.children}
    //   </main>
    //     {/* {props.children} */}
    // </SidebarProvider>

    // </>

    <SidebarProvider color="">
      <div className="flex h-screen overflow-y-hidden">
        <AppSidebar items={useMenuStore.getState().menus} firstName={user.firstname} lastName={user.first_lastname} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">{title}</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {props.children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ items, firstName, lastName }: { items: IMenuChildren[], firstName: string, lastName: string }) {
  const {
    desconectar,
  } = useUserStore();

  function logout() {
    Cookies.remove("bearer");
    Cookies.remove("establishment");
    Cookies.remove("role");
    desconectar();
    push("/login");
  }
  const { push } = useRouter();
  return (

    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {firstName[0]}{lastName[0]}
                    </div>
                    <span className="ml-3 font-semibold">{firstName} {lastName}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => push("/perfil")} >
                  <User className="mr-2 h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Desconectar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild className="select-none	cursor-pointer">
                <a onClick={() => push(item.href)}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}