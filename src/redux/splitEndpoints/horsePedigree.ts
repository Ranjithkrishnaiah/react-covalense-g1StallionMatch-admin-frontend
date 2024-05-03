import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HorsePedigree } from 'src/@types/horsePedigree';

export const pedigreesApi = createApi({
    reducerPath: "pedigreesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/"}),
    tagTypes: ['horsePedigrees'],
    endpoints: (builder) => ({
        pedigrees: builder.query<HorsePedigree[],void>({
            query: () => "/horsePedigrees",
            providesTags: (result, error) => [{type: 'horsePedigrees'}]
        })
    })
})

export const { usePedigreesQuery } = pedigreesApi;
