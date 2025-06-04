export interface ISuggestion {
  id: number;
  attributes: {
    created: {
      data: {
        id: number;
        attributes: {
          firstname: string;
          first_lastname: string;
          second_lastname: string;
          email: string;
        };
      };
    };
    establishment: {
      data: {
        id: number;
        attributes: {
          name: string;
          Region: string;
          Comuna: string;
        };
      };
    };
    suggestion: string;
    createdAt: string;
    updatedAt: string;
    response?: string;
    user_response?: {
      data: {
        id: number;
        attributes: {
          firstname: string;
          first_lastname: string;
        };
      } | null;
    } | null;
  };
}
