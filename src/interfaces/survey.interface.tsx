interface surveyInterface{
    id: number;
    attributes: {
        titulo: string;
        fechaInicio: string;
        fechaFin: string;
        creador:{
            data:{
                id: number;
                attributes: {
                    username: string;
                    email: string;
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
                            };
                        };
                    };
                };
            };
        };
        descripcion: string;
        status: boolean;
        usuarios:{
            data:{
                id: number;
                attributes: {
                    username: string;
                    email: string;
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
                            };
                        };
                    };
                };

            };
        };
        establishment:{
            data: {
                id: number;
                attributes: {
                    name: string;
                };
            };
        };
        formulario_pregutas:{
            data:{
                id: number;
                attributes:{
                    titulo: string;
                };
            };
        };
    };

}