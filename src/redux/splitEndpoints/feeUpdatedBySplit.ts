import { api } from "src/api/apiPaths";
import { Feestatus } from 'src/@types/feestatus';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithFeeUpdatedBy = splitApi.injectEndpoints({
    endpoints: (build) => ({
        feeupdatedby: build.query<Feestatus[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.feeupdatedbyPath, '',true),
        providesTags: (result, error) => [{ type: 'Feeupdatedby' }],
      }),
    }),
});

export const { useFeeupdatedbyQuery } = apiWithFeeUpdatedBy;
