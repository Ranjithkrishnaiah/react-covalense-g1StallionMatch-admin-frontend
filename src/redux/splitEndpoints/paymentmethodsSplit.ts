import { Paymentmethods } from 'src/@types/paymentmethods';
import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithPaymentMethods = splitApi.injectEndpoints({
    endpoints: (build) => ({
        paymentmethods: build.query<Paymentmethods[], void>({
          query: () => prepareAPIQuery(api.baseUrl, api.paymentMethodsPath, '',true),
          providesTags: (result, error) => [{ type: 'PaymentMethods' }],
      }),
    }),
});

export const { usePaymentmethodsQuery } = apiWithPaymentMethods;