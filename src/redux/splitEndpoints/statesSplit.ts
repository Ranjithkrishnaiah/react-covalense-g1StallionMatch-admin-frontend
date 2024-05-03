import { api } from "src/api/apiPaths";
import { States } from 'src/@types/states';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithStates = splitApi.injectEndpoints({
    endpoints: (builder) => ({
        states: builder.query<States[], void>({
            query: () => prepareAPIQuery(api.baseUrl, api.allStatesPath, '',true),
            providesTags: (result, error) => [{ type: 'States' }],
        }),
        statesByCountryId: builder.query<States[], any>({
            query: (id: number) => prepareAPIQuery(api.baseUrl, api.statesByCountryIdPath + id, '',true),
            providesTags: (result, error) => [{ type: 'States' }],
        }),
    }),
  });
  
  export const { useStatesQuery, useStatesByCountryIdQuery } = apiWithStates;