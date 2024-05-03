import { Promotionstatus } from 'src/@types/promotionstatus';
import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithPromotionStatus = splitApi.injectEndpoints({
    endpoints: (build) => ({
        promotionstatus: build.query<Promotionstatus[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.promotionstatusTagPath, '',true),
        providesTags: (result, error) => [{ type: 'Promotionstatus' }],
      }),
    }),
  });
  
export const { usePromotionstatusQuery } = apiWithPromotionStatus
