import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithSystemActivity = splitApi.injectEndpoints({
    endpoints: (builder) => ({
        systemActivities: builder.query<any, object>({
            query: (params) => (
                prepareAPIQuery(api.baseUrl, api.systemActivityPath, params, true)
            ),
            providesTags: (result, error) => [{ type: 'systemActivity' }]
        }),
        systemActivity: builder.query<any, string>({
            query: (id: any) => (
                prepareAPIQuery(api.baseUrl, api.systemActivityPath + '/' + id, '', true)
            ),
            providesTags: ['systemActivity']
        }),
        editSystemActivity: builder.mutation<{}, any>({
            query: (obj: any) => (prepareAPIMutation(api.baseUrl, api.systemActivityPath + '/' + obj.id, '', 'PATCH', obj, true)),
            invalidatesTags: ['systemActivity']
        }),
    }),
});

export const {
    useSystemActivitiesQuery,
    useSystemActivityQuery,
    useEditSystemActivityMutation
} = apiWithSystemActivity;