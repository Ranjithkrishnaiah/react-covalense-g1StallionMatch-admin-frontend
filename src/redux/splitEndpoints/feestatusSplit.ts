import { api } from "src/api/apiPaths";
import { Feestatus } from 'src/@types/feestatus';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithFeeStatus = splitApi.injectEndpoints({
    endpoints: (build) => ({
        feestatus: build.query<Feestatus[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.feestatusPath, '',true),
        providesTags: (result, error) => [{ type: 'Feestatus' }],
      }),
    }),
});

export const { useFeestatusQuery } = apiWithFeeStatus;
