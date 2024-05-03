import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithMediaUploadStatus = splitApi.injectEndpoints({
  endpoints: (build) => ({    
    uploadMediaStatus: build.mutation<[], any>({
      query: (marketingUploadStatusPayload)  => (prepareAPIMutation(api.baseUrl, api.marketingUploadStatusApiPath, '', 'POST', marketingUploadStatusPayload, true)),
      // invalidatesTags: ['marketingHome']
    }),
  }),
});

export const {
  useUploadMediaStatusMutation
} = apiWithMediaUploadStatus;
