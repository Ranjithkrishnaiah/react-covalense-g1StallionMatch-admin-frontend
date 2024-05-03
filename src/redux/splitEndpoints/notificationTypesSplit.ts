import { NotificationTypes } from 'src/@types/notificationTypes';
import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithNotificationTypes = splitApi.injectEndpoints({
    endpoints: (build) => ({
        notificationtypes: build.query<NotificationTypes[], void>({
        query: () => prepareAPIQuery(api.baseUrl, api.notificationTypesPath, '', true),
        providesTags: (result, error) => [{ type: 'NotificationTypes' }],
      }),
    }),
});

export const { useNotificationtypesQuery } = apiWithNotificationTypes;