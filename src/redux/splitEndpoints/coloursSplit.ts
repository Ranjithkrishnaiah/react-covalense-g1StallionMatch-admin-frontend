import { api } from "src/api/apiPaths";
import { Colours } from 'src/@types/colours';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithColours = splitApi.injectEndpoints({
    endpoints: (build) => ({
        colours: build.query<Colours[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.coloursPath, '',true),
        providesTags: (result, error) => [{ type: 'Colour' }],
      }),
    }),
});
  
export const { useColoursQuery } = apiWithColours;
