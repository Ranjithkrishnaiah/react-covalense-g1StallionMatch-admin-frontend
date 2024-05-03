import { api } from 'src/api/apiPaths';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithNotifications = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.notificationsApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'notifications' }],      
    }),
    getTitles: builder.query<any, void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.notificationsApiPath + '/' + api.notificationsTitles, '', true)
      ),      
      providesTags: (result, error) => ['notifications'],      
    }),
    getLinkType: builder.query<any, void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.notificationsApiPath + '/' + api.notificationsLinkTypes, '', true)
      ),      
      providesTags: (result, error) => ['notifications'],      
    }),
    getUnreadNotificationsType: builder.query<any, void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.notificationsApiPath + '/my/' + api.notificationsUnreadCount, '', true)
      ),      
      providesTags: (result, error) => ['notifications'],      
    }),
    updateReadNotification: builder.mutation<{}, any>({
      query: ({ notificationId, ...notificationPayload })  => (prepareAPIMutation(api.baseUrl, api.notificationsApiPath + '/' + notificationId, '', 'PATCH', notificationPayload, true)),
      invalidatesTags: ['notifications']
    }),
    deleteNotification: builder.mutation<{}, any>({
      query: ({ notificationId, ...notificationPayload })  => (prepareAPIMutation(api.baseUrl, api.notificationsApiPath + '/' + notificationId, '', 'DELETE', notificationPayload, true)),
      invalidatesTags: ['notifications']
    }),
    shareNotifications: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.notificationsApiPath + api.shareNotificationApiPath, params, true)
      ),      
      providesTags: (result, error) => ['notifications'],      
    }),
  }),
});  

export const {
  useNotificationsQuery,
  useGetTitlesQuery,
  useGetLinkTypeQuery,
  useGetUnreadNotificationsTypeQuery,
  useUpdateReadNotificationMutation,
  useDeleteNotificationMutation,
  useShareNotificationsQuery
} = apiWithNotifications;
