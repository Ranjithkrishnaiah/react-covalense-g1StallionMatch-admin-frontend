import { api } from "src/api/apiPaths";
import { Currencies } from 'src/@types/currencies';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithCurrencies = splitApi.injectEndpoints({
    endpoints: (build) => ({
        currencies: build.query<Currencies[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.currencyPath, '',true),
        providesTags: (result, error) => [{ type: 'Currency' }],
      }),
    }),
  });
  
export const { useCurrenciesQuery } = apiWithCurrencies;