import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithSetting = splitApi.injectEndpoints({
    endpoints: (builder) => ({
        settings: builder.query<any, void>({
            query: () => (
              prepareAPIQuery(api.baseUrl, api.settingsPath, '', true)
            ),      
            providesTags: (result, error) => [{ type: 'setting' }],      
        }),
        setting: builder.query<any, object>({
            query: (params) => (
              prepareAPIQuery(api.baseUrl, api.settingsPath, params, true)
            ),      
            providesTags: (result, error) => [{ type: 'setting' }],      
        }),
        addSettings: builder.mutation<{}, any>({
            query: ({ ...rest }) => (prepareAPIMutation(api.baseUrl, api.settingsPath, '', 'POST', rest, true))
        }),
        editSettings: builder.mutation<{}, any>({
            query: ({ ...rest })  => (prepareAPIMutation(api.baseUrl, api.settingsPath + rest.id, '', 'PUT', rest, true))
        }),
    }),
  });

export const { useSettingsQuery, useSettingQuery, useEditSettingsMutation, useAddSettingsMutation } = apiWithSetting;