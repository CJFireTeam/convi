export default interface UserInterface {
  id: number;
  attributes: {
    username: string;
    email: string;
    provider?: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt?: string;
    updatedAt?: string;
    second_lastname: string;
    first_lastname: string;
    firstname: string;
    secondname: string;
    establishment?: number;
    role?: {
      id: number;
      name: string;
      description: string;
      type: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}
