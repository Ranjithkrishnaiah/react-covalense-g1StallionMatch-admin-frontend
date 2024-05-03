import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithMatchedMares = splitApi.injectEndpoints({
    endpoints: (build) => ({
        matchedMares: build.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.matchedMares, '', true),
        providesTags: (result, error) => [{ type: 'matched-mares' }],
      }),
    }),
});

export const { useMatchedMaresQuery } = apiWithMatchedMares;