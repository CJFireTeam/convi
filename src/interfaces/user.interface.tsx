export default interface UserInterface {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    role: {
        id: number;
        name: string;
        description: string;
        type: string;
        createdAt: string;
        updatedAt: string;
    };
}