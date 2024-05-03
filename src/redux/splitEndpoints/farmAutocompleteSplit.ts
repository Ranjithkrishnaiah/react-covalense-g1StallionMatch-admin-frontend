import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithFarmAutocomplete = splitApi.injectEndpoints({
    endpoints: (build) => ({
        farmAutocomplete: build.query<any, any>({
        query: (data: any) => prepareAPIQuery(api.baseUrl, api.farmAutocompletePath + '?farmName=' + data.farmName+'&isFarmNameExactSearch='+data.isFarmNameExactSearch, '',true),
        providesTags: (result, error) => [{ type: 'FarmAutocomplete' }],
      }),
    }),
  });
  
export const { useFarmAutocompleteQuery } = apiWithFarmAutocomplete;