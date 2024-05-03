import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithStallion = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    stallions: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'stallion' }],      
    }),    
    stallion: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'stallion' }],      
    }),
    addStallion: builder.mutation<{}, any>({
      query: (stallionPayload) => (prepareAPIMutation(api.baseUrl, api.stallionApiPath, '', 'POST', stallionPayload, true)),
      invalidatesTags: ['stallion']
    }),
    editStallion: builder.mutation<{}, any>({
      query: ({ id, ...stallionPayload })  => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + id, '', 'PATCH', stallionPayload, true)),
      invalidatesTags: ['stallion']
    }),
    profileImageUpload: builder.mutation<{}, any>({
      query: (stallionProfileImagePayload)  => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + 'profile-image', '', 'POST', stallionProfileImagePayload, true)),
      invalidatesTags: ['stallion']
    }),
    stallionAutocomplete: builder.query<any, any>({
      query: (name: any) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + '?stallionName=' + name, ''),
      providesTags: (result, error) => [{ type: 'stallion' }],
    }),
  }),
});

export const {
  useStallionsQuery,
  useStallionQuery,
  useStallionAutocompleteQuery,
  useProfileImageUploadMutation,
  useAddStallionMutation,
  useEditStallionMutation,
} = apiWithStallion;