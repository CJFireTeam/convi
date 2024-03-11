import React, {
  createContext,
  useState,
  useContext,
  FunctionComponent,
  ReactNode,
  useEffect,
} from "react";

interface MyContextType {
  Loader: boolean;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoaderContext = createContext<MyContextType | undefined>(undefined);

export const LoaderProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [Loader, setLoader] = useState<boolean>(false);

  //   useEffect(() => {
  //     document.body.style.overflow = 'hidden'; // Deshabilita el scroll cuando se monta el componente

  //     return () => {
  //       document.body.style.overflow = ''; // Habilita el scroll cuando se desmonta el componente
  //     };
  //   }, []);
  // if (Loader) {
  //   return (
  //     <LoaderContext.Provider value={{ Loader, setLoader }}>
  //       <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
  //         <div className="flex flex-col items-center">
  //           <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600"></div>
  //           <div className="mt-4 text-gray-700">Cargando...</div>
  //         </div>
  //       </div>
  //     </LoaderContext.Provider>
  //   );
  // }
  return (
    <LoaderContext.Provider value={{ Loader, setLoader }}>
        { Loader ?? (<div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600"></div>
            <div className="mt-4 text-gray-700">Cargando...</div>
          </div>
        </div>)}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoaderContext = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoaderContext must be used within a MyContextProvider");
  }
  return context;
};
