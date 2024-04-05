interface caseInterface {
    id: number;
    attributes: {
        measures: string;
        createdAt: string;
        updatedAt: string;
        story: string;
        when: string;
        where: string;
        who: {
            values: string[];
        };
        publishedAt: string;
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