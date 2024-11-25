export interface IUserEstablishment{
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  second_lastname: string;
  first_lastname: string;
  firstname: string;
  secondname: string;
  createdAt: string;
  updatedAt: string;
  tipo: string;
  direccion: string;
  region: string;
  comuna: string;
  phone: string;
  canUploadDoc: boolean;
}

export interface IDocuments{
    attributes:{
        createdAt:string;
        Eliminado:boolean;
        descriptionDoc:string;
        document:{
            data:{
                attributes:{
                    createdAt: Date;
                    url: string;
                    name: string;
                }
                id:number;
            }[]
        }
        establishmentId:{
            data:{
                attributes:{
                    name:string;
                }
                id:number;
            }
        }
        establishment_course:{
            data:{
                attributes:{
                    Grade:string;
                    Letter:string;
                }
                id:number;
            }
        }
        userId:{
            data:{
                attributes:{
                    firstname:string;
                    first_lastname:string;
                }
                id:number;
            }
        }
        user_destiny: {
            data: {
                attributes: {
                    firstname: string;
                    first_lastname: string;
                }
                id: number;
            }
        }
    }
    id:number;
}

export interface ICourse{
    Grade:string;
    Letter:string;
    id:number
}