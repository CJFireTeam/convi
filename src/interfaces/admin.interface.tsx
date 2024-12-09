export interface IAdmin {
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
    role: {
        id: number;
        name: string;
        description: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    establishment: {
        id: number;
        name: string;
        status: boolean;
        address: string;
        Phone: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        Comuna: string;
        is_listing: boolean;
    }
   
}