import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIMutation } from 'src/utils/customFunctions';

export const apiWithForgotPassword = splitApi.injectEndpoints({
    endpoints: (build) => ({
        forgotPassworduser: build.mutation<void,Object>({
            query: (email:Object) => (prepareAPIMutation(api.baseUrl, api.forgotPasswordPath, '', 'POST', email, true)),
            invalidatesTags: ['member']
        }),
    }),
});

export const { useForgotPassworduserMutation } = apiWithForgotPassword;