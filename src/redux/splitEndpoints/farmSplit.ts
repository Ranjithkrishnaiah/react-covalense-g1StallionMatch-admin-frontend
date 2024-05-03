import { Farm } from 'src/@types/farm'
import { api } from "src/api/apiPaths";
import { FarmMareList } from 'src/@types/farmMareList';
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
import { FarmCountries } from 'src/@types/countries';

const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
export const apiWithFarm = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    farms: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    farm: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.farmPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    addFarm: builder.mutation<{}, any>({
      query: (farmPayload) => (prepareAPIMutation(api.baseUrl, api.farmPath, '', 'POST', farmPayload, true)),
      invalidatesTags: ['farm']
    }),
    editFarm: builder.mutation<{}, any>({
      query: ({ id, ...farmPayload })  => (prepareAPIMutation(api.baseUrl, api.farmPath + id, '', 'PATCH', farmPayload, true)),
      invalidatesTags: ['farm']
    }),
    profileImageUpload: builder.mutation<{}, any>({
      query: (farmProfileImagePayload)  => (prepareAPIMutation(api.baseUrl, api.farmPath + 'profile-image', '', 'POST', farmProfileImagePayload, true))
    }),
    mediaImageUpload: builder.mutation<{}, any>({
      query: ({ farmId, ...farmProfileImagePayload }) => (prepareAPIMutation(api.baseUrl, api.farmPath + farmId + '/media-files', '', 'POST', farmProfileImagePayload, true)),
      invalidatesTags: [{ type: 'farm' }]
    }),
    farmUserInvitation: builder.mutation<{}, any>({
      query: (farmUserInvitationPayload)  => (prepareAPIMutation(api.baseUrl, api.memberInvitation + 'invite-farmuser', '', 'POST', farmUserInvitationPayload, true))
    }),
    farmMareList: builder.query<FarmMareList[], string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.farmMareListApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    farmDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmDashboardPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    farmStallions: builder.query<any, any>({
      query: (farmId: any) => (
        prepareAPIQuery(api.baseUrl, api.farmPath + farmId + '/stallion-names', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    shareFarms: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.shareFarmApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    farmDashboardTotalVisitors: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPath +"dashboard-visitors", params, true)
      ),      
      providesTags: (result, error) => [{ type: 'farm' }],      
    }),
    getFarmMembers: builder.query<any, string>({
      query: (farmId: string) => (
        prepareAPIQuery(api.baseUrl, api.farmPath + farmId + "/members", '', true)
      ), 
      providesTags: (result, error) => [{ type: 'farm' }]
    }),
    farmDashboardWorldReach: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmDashboardPath + "world-reach-farms", params, true)
      ),  
      providesTags: (result, error) => [{ type: 'farm' }]
    }),
    downloadExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url: BaseAPI + '/v1' + 
            '/farms/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
            headers : prepareHeaders(),
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.xlsx`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    farmLocations: builder.query<FarmCountries[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.farmPath + 'locations', '',true),      
    }),
  }),
});

export const {
  useFarmsQuery,
  useFarmQuery,
  useAddFarmMutation,
  useEditFarmMutation,
  useProfileImageUploadMutation,
  useFarmUserInvitationMutation,
  useFarmMareListQuery,
  useFarmDashboardQuery,
  useFarmStallionsQuery,
  useShareFarmsQuery,
  useFarmDashboardTotalVisitorsQuery,
  useGetFarmMembersQuery,
  useFarmDashboardWorldReachQuery,
  useMediaImageUploadMutation,
  useDownloadExcelFileQuery,
  useFarmLocationsQuery
} = apiWithFarm;