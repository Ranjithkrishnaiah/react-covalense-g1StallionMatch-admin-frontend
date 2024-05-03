import { api } from "src/api/apiPaths";
import { RetiredReason } from 'src/@types/retiredReason';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithRetiredReason = splitApi.injectEndpoints({
    endpoints: (build) => ({
      retiredReason: build.query<RetiredReason[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.retiredReasonPath, '',true),
        providesTags: (result, error) => [{ type: 'RetiredReason' }],
      }),
    }),
  });
  
export const { useRetiredReasonQuery } = apiWithRetiredReason;