interface caseInterface {
    id: number;
    attributes: {
        fase:number;
        category:string;
        measures: string;
        createdAt: string;
        updatedAt: string;
        story: string;
        derived: boolean;
        when: {
            values: string[];
        };
        where: {
            values: string[];
        };
        who: {
            values: string[];
        };
        publishedAt: string;
        created: {
            data: {
                id: number;
                attributes: {
                    comuna: string;
                    direccion: string;
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
                    phone: string;
                    secondname: string;
                    tipo: string,
                    role: {
                        data: {
                            id:number,
                            attributes: {
                                createdAt: string;
                                updatedAt: string;
                                description: string;
                                name: string;
                                type: string;
                            }
                        }
                    }
                };
            };
        };
        directed: {
            data: {
                id: number;
                attributes: {
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
                        data: {
                            id:number,
                            attributes: {
                                createdAt: string;
                                updatedAt: string;
                                description: string;
                                name: string;
                                type: string;
                            }
                        }
                    }
                };
            };
        };
    };
}