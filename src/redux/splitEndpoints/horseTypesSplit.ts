import { api } from "src/api/apiPaths";
import { HorseTypes } from 'src/@types/horsetypes';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithHorseTypes = splitApi.injectEndpoints({
    endpoints: (build) => ({
        horseTypes: build.query<HorseTypes[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.horseTypesPath, '',true),
        providesTags: (result, error) => [{ type: 'HorseTypes' }],
      }),
    }),
});

export const { useHorseTypesQuery } = apiWithHorseTypes;