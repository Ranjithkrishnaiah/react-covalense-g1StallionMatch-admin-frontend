import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginObject } from 'src/@types/login';
import { api } from 'src/api/apiPaths';
import { splitApi } from '../rootMiddleware';
import { prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithLogin = splitApi.injectEndpoints({
    endpoints: (build) => ({
      login: build.mutation<any, LoginObject>({
        query: (loginDetails) => (prepareAPIMutation(api.baseUrl, api.loginPath, '', 'POST', loginDetails)),
      }),
    }),
  });
  
export const { useLoginMutation } = apiWithLogin;