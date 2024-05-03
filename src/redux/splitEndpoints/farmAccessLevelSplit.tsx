import { api } from "src/api/apiPaths";
import { FarmAccessLevel } from 'src/@types/farmAccessLevel';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithFarmAccessLevel = splitApi.injectEndpoints({
    endpoints: (build) => ({
        farmAccessLevel: build.query<FarmAccessLevel[], void>({
          query: () => prepareAPIQuery(api.baseUrl, api.farmAccessLevelPath, '',true),
          providesTags: (result, error) => [{ type: 'farmAccessLevel' }],
        }),
    }),
  });
  
  export const { useFarmAccessLevelQuery } = apiWithFarmAccessLevel;