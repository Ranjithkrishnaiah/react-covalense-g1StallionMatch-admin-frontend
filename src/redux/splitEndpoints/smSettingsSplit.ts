import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithSmSetting = splitApi.injectEndpoints({
    endpoints: (builder) => ({
        smSetting: builder.query<any, void>({
        query: () => (
          prepareAPIQuery(api.baseUrl, api.smSettingsPath, '', true)
        ),      
        providesTags: (result, error) => [{ type: 'sm-setting' }],      
      }),
      updateSettings: builder.mutation<{}, any>({
        query: ({ ...rest }) => (prepareAPIMutation(api.baseUrl, api.smSettingsPath, '', 'POST', rest, true)),
        invalidatesTags: [{ type: 'sm-setting' }]
      }),
      getPageSetting: builder.query<any, any>({
        query: (pageId: number) => (
          prepareAPIQuery(api.baseUrl, api.pageSettingApiPath + "/" + pageId, '', true)
        ),
        providesTags: [{ type: 'page-settings' }]
      }),
      updateSetting: builder.mutation<{}, any>({
        query: (settingPayload) => (prepareAPIMutation(api.baseUrl, api.pageSettingApiPath, '', 'PUT', settingPayload, true)),
        invalidatesTags: ['page-settings', 'farm', 'stallions', 'member', 'notifications']
      }),
      updateHorseSetting: builder.mutation<{}, any>({
        query: (settingPayload) => (prepareAPIMutation(api.baseUrl, api.pageSettingApiPath + '/horse', '', 'POST', settingPayload, true)),
        invalidatesTags: ['page-settings', 'horses']
      }),
      updateReportSetting: builder.mutation<{}, any>({
        query: (settingPayload) => (prepareAPIMutation(api.baseUrl, api.pageSettingApiPath + '/report', '', 'POST', settingPayload, true)),
        invalidatesTags: ['page-settings', 'report']
      }),
      updateRaceSetting: builder.mutation<{}, any>({
        query: (settingPayload) => (prepareAPIMutation(api.baseUrl, api.pageSettingApiPath + '/race', '', 'POST', settingPayload, true)),
        invalidatesTags: ['page-settings', 'report','race']
      }),
      updateRunnersDetailsSetting: builder.mutation<{}, any>({
        query: (settingPayload) => (prepareAPIMutation(api.baseUrl, api.pageSettingApiPath + '/runner', '', 'POST', settingPayload, true)),
        invalidatesTags: ['page-settings', 'report']
      }),
    }),
  });

export const { 
    useSmSettingQuery, 
    useUpdateSettingsMutation,
    useGetPageSettingQuery,
    useUpdateSettingMutation,
    useUpdateHorseSettingMutation,
    useUpdateReportSettingMutation,
    useUpdateRaceSettingMutation,
    useUpdateRunnersDetailsSettingMutation
} = apiWithSmSetting;