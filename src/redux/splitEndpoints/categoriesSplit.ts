import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithCategory = splitApi.injectEndpoints({
    endpoints: (build) => ({
      categories: build.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.categoryPath, '', true),
        providesTags: (result, error) => [{ type: 'category' }],
      }),
    }),
  });
  
  export const { useCategoriesQuery } = apiWithCategory;