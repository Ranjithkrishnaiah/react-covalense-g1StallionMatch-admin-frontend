import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIMutation } from 'src/utils/customFunctions';

export const apiWithResendConfirmEmail = splitApi.injectEndpoints({
    endpoints: (build) => ({
        resendConfirmEmail: build.mutation<void,String>({
            query: (email) => (prepareAPIMutation(api.baseUrl, api.resendConfirmEmailPath + email, '', 'POST', {}, true)),
            invalidatesTags: ['member']
        }),
    }),
  });
  
export const { useResendConfirmEmailMutation } = apiWithResendConfirmEmail;