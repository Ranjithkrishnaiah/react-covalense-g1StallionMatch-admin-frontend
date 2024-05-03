import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithUserManagement = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    role: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.role, '', true)
      ),
      providesTags: (result, error) => [{ type: 'userManagement' }],
    }),
    adminModuleAccessLevel: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.adminModuleAccessLevel, '', true)
      ),
      providesTags: (result, error) => [{ type: 'userManagement' }],
    }),
    roleSettings: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.role + '/settings', '', true)
      ),
    }),
    roleBasedAccessLevel: builder.query<any, any>({
      query: (roleId: any) => (
        prepareAPIQuery(api.baseUrl, api.permissionAccessLevelApiPath + '/role/' + roleId, '', true)
      ),
    }),
    adminModulePermissionAccessLevel: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.permissionAccessLevelApiPath, '', true)
      ),
    }),
    updateRoleBasedPermissionAccessLevel: builder.mutation<{}, any>({
      query: ({ roleId, ...roleBasedAccessPayload }) => (prepareAPIMutation(api.baseUrl, api.permissionAccessLevelApiPath + '/role/' + roleId, '', 'PATCH', roleBasedAccessPayload, true)),
      invalidatesTags: ['users']
    }),
    getUsers: builder.query<any, object>({
      query: (params: any) => (
        prepareAPIQuery(api.baseUrl, api.userApiPath, params, true)
      ),
      providesTags: (result, error) => [{ type: 'users' }]
    }),
    getUser: builder.query<any, any>({
      query: (id) => (
        prepareAPIQuery(api.baseUrl, api.userApiPath + "/" + id, '', true)
      ),
      providesTags: (result, error) => [{ type: 'users' }]
    }),
    addUser: builder.mutation<{}, any>({
      query: (userPayload) => (prepareAPIMutation(api.baseUrl, api.userApiPath, '', 'POST', userPayload, true)),
      invalidatesTags: ['users']
    }),
    editUser: builder.mutation<{}, any>({
      query: ({ userId, ...userPayload }) => (prepareAPIMutation(api.baseUrl, api.userApiPath + "/" + userId, '', 'PATCH', userPayload, true)),
      invalidatesTags: ['users']
    }),
    deleteUser: builder.mutation<any, any>({
      query: ({ id }) => (prepareAPIMutation(api.baseUrl, api.userApiPath + "/" + id, '', 'DELETE', '', true)),
      invalidatesTags: ['users']
    }),
    getAppPermissionByUserToken: builder.query<any, any>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.appPermissionByUserApiPath, '', true)
      ),
      providesTags: (result, error) => [{ type: 'app-permission' }]
    }),
    updateUserStatus: builder.mutation<{}, any>({
      query: (obj: any) => (prepareAPIMutation(api.baseUrl, api.updateUserStatus + obj.memberUuid + '/' + obj.status, '', 'PATCH', {}, true)),
      invalidatesTags: ['users']
    }),
    downloadUserListExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url: BaseAPI + '/v1' +
            '/users/download'
          ,
          headers: prepareHeaders(),
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var pdfLink = result?.data[0]?.downloadUrl;
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `Usermanagement List.xlsx`;
        hiddenElement.click();
        return { data: null };
      },
    }),
  }),
});

export const {
  useRoleQuery,
  useAdminModuleAccessLevelQuery,
  useRoleSettingsQuery,
  useAdminModulePermissionAccessLevelQuery,
  useRoleBasedAccessLevelQuery,
  useUpdateRoleBasedPermissionAccessLevelMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useEditUserMutation,
  useGetAppPermissionByUserTokenQuery,
  useDownloadUserListExcelFileQuery,
  useUpdateUserStatusMutation
} = apiWithUserManagement;