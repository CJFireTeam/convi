export default interface stablishmentI {
    id: number;
    attributes: {
        name: string;
        status: boolean;
        address: string;
        Phone: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        Comuna: string;
    };
}

export interface IAllEstablishment {
    id: number;
    attributes: {
        name: string;
        status: boolean;
        address: string;
        Phone: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        Region: string;
        Comuna: string;
        users: {
            data: {
                id: number;
                attributes: {
                    tipo: string;
                    firstname: string;
                    first_lastname: string;
                    second_lastname: string;
                    role: {
                        data: {
                            id: number;
                            attributes: {
                                name: string;
                            }
                        }
                    }
                }
            }[]
        }
    };
}