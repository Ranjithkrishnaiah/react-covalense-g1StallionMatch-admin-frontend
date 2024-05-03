import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';
import { StallionAutocomplete } from 'src/@types/stallionAutocomplete';

export const apiWithStallionAutocomplete = splitApi.injectEndpoints({
    endpoints: (build) => ({
        stallionAutocompleteSearch: build.query<any, any>({
          query: (name: any) => prepareAPIQuery(api.baseUrl, api.stallionAutocompletePath + '?stallionName=' + name, '', true),
        }),
    }),
  });
  
export const { useStallionAutocompleteSearchQuery } = apiWithStallionAutocomplete;