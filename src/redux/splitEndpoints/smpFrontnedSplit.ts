import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithFrontend = splitApi.injectEndpoints({
  endpoints: (build) => ({
    stallionViewActivityMatchedMare: build.query<any, object>({
      query: (params) => prepareAPIQuery(api.frontendUrl, api.stallionViewActivityMatchedMareApiPath, params,true),
      providesTags: (result, error) => [{ type: 'stallion-matched-mare' }],
    }),
  }),
});

export const {
  useStallionViewActivityMatchedMareQuery,
} = apiWithFrontend;