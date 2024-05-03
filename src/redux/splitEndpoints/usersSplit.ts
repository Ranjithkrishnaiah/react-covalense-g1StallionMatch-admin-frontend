import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithUsers = splitApi.injectEndpoints({
    endpoints: (builder) => ({
      users: builder.query<any, object>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.memberPath + api.usersPath, params, true)
        ),      
        providesTags: (result, error) => [{ type: 'users' }],      
      }),
      getUserDetailsByToken: builder.query<any, void>({
        query: () => (
          prepareAPIQuery(api.baseUrl, api.saveMembersDetails, '', true)
        ),      
        providesTags: (result, error) => [{ type: 'user profile' }],      
      }),
      deleteUser: builder.mutation<{}, any>({
        query: ({ id }) => (prepareAPIMutation(api.baseUrl, api.memberPath + 'list/' + id, '', 'DELETE', {}, true)),
        invalidatesTags: [{ type: 'users' }]
      }),
    }),
  });
  
export const {
  useUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsByTokenQuery
} = apiWithUsers;