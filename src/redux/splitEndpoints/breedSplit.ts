import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Breed } from 'src/@types/breed';
import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithBreed = splitApi.injectEndpoints({
    endpoints: (build) => ({
        breed: build.query<Breed[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.breedPath, '',true),
        providesTags: (result, error) => [{ type: 'Breed' }],
      }),
    }),
  });
  
  export const { useBreedQuery } = apiWithBreed;
