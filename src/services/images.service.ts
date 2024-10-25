const baseURL: string =  process.env.NEXT_PUBLIC_BACKEND_ACCES as string;

export function getFile(path:string) {
    return baseURL + path
  }