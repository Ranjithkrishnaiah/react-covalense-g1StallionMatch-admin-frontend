import { Farm } from 'src/@types/farm'
import { api } from "src/api/apiPaths";
import { FarmMareList } from 'src/@types/farmMareList';
import { StallionCountries } from 'src/@types/countries';
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithStallions = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    stallions: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions' }],      
    }),    
    stallion: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions' }],      
    }),
    addStallion: builder.mutation<{}, any>({
      query: (stallionPayload) => (prepareAPIMutation(api.baseUrl, api.stallionApiPath, '', 'POST', stallionPayload, true)),
      invalidatesTags: ['stallions']
    }),
    editStallion: builder.mutation<{}, any>({
      query: ({ id, ...stallionPayload })  => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + id, '', 'PATCH', stallionPayload, true)),
      invalidatesTags: ['stallions']
    }),
    profileImageUpload: builder.mutation<{}, any>({
      query: (stallionProfileImagePayload)  => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + 'profile-image', '', 'POST', stallionProfileImagePayload, true)),
      invalidatesTags: ['stallions']
    }),
    stallionAutocomplete: builder.query<any, any>({
      query: (name: any) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + '?stallionName=' + name, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    stallionGrandSireAutocomplete: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'search-grand-sire-name', params,true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    stallionSireAutocomplete: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'search-sire-name', params,true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    stallionDamSireAutocomplete: builder.query<any, any>({
      query: (name) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'search-dam-sire-name?damSireName=' + name, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberFavouriteStallion: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberFavouriteStallionApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberFavouriteMare: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberFavouriteMareApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberFavMare: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberFavMareApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberFavouriteBroodmareSire: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberFavouriteBroodmareSireApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberFavouriteFarm: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberFavouriteFarmApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    memberLinkedFarm: builder.query<any, any>({
      query: (mermberId: number) => prepareAPIQuery(api.baseUrl, api.memberLinkedFarmApiPath + mermberId, '',true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    stallionDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionDashboardPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions' }],      
    }),
    stallionStudFeeHistory: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionStudFeeApiPath + params.id+'/stud-fee?order='+params.order+'&page='+params.page+'&limit='+params.limit+'&date='+params.date, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions-service-fees' }],      
    }),
    stallionStudFeeChart: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl,  api.stallionStudFeeApiPath + params.id +'/Stud-fee-chart?&date='+params.date, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions-service-fees' }],      
    }),
    progenyTracker: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl,  api.progenyTrackerApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'progeny-tracker' }],      
    }),
    shareStallions: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl,  api.shareStallionApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'stallions' }],      
    }),
    stallionsAutocomplete: builder.query<any, any>({
      query: (param: any) => prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'search-stallion-name?', param, true),
      providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    stallionsDashboardWorldReach: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionDashboardPath + "world-reach-stallions", params, true)
      ),      
      providesTags: (result, error) => ['stallions'],      
    }),
    stallionActivityMatchedMare: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + api.stallionActivityMatchedMareApiPath, params, true)
      ),
      providesTags: (result, error) => ['matched-mares']
    }),
    stallionActivityKeyStatistic: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + api.stallionActivityKeyStatisticApiPath, params, true)
      ),
      providesTags: (result, error) => ['key-statistics']
    }),
    stallionActivityCloseAnalytics: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + api.stallionActivityCloseAnalyticsApiPath, params, true)
      ),
      providesTags: (result, error) => ['close-analytics']
    }),
    getStallionMatchedActivity: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + api.stallionMatchedActivityApiPath, params, true)
      ),
      providesTags: (result, error) => ['match-activity']
    }),
    getStallionAnalyticsPdf: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + "analytics/download", params, true)
      ),
      providesTags: (result, error) => ['match-activity']
    }),
    getStallionStudFeeHistoryPdf: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + "fee-history/download", params, true)
      ),
      providesTags: (result, error) => ['fee-history']
    }),
    getCurrenciesMinMaxValue: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + "price-range?", params, true)
      ),
      providesTags: (result, error) => ['match-activity']
    }),
    postEmailShare: builder.mutation<{}, any>({
      query: (emailPayload) => (prepareAPIMutation(api.baseUrl, api.socialShareEmail, '', 'POST', emailPayload, true)),
      invalidatesTags: ['stallions']
    }),
    downloadStallionExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/stallions/dashboard-report/?kpiTitle=' +
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
    stallionLocations: builder.query<StallionCountries[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'locations', '',true),      
    }),
    stallionProfileImageUpload: builder.mutation<{}, any>({
      query: (stallionProfileImagePayload)  => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + 'profile-image', '', 'POST', stallionProfileImagePayload, true)),
      invalidatesTags: ['stallions']
    }),
  }),
});

export const {
  useStallionsQuery,
  useStallionQuery,
  useStallionAutocompleteQuery,
  useStallionGrandSireAutocompleteQuery,
  useStallionSireAutocompleteQuery, 
  useStallionDamSireAutocompleteQuery, 
  useMemberFavouriteStallionQuery,
  useMemberFavouriteMareQuery,
  useMemberFavouriteBroodmareSireQuery,
  useMemberFavouriteFarmQuery,
  useMemberLinkedFarmQuery,
  useStallionDashboardQuery,
  useProfileImageUploadMutation,
  useAddStallionMutation,
  useEditStallionMutation,
  useStallionStudFeeHistoryQuery,
  useStallionStudFeeChartQuery,
  useProgenyTrackerQuery,
  useShareStallionsQuery,
  useStallionsAutocompleteQuery,
  useStallionsDashboardWorldReachQuery,
  useStallionActivityMatchedMareQuery,
  useStallionActivityKeyStatisticQuery,
  useStallionActivityCloseAnalyticsQuery,
  useGetStallionMatchedActivityQuery,
  useGetStallionAnalyticsPdfQuery,
  useGetStallionStudFeeHistoryPdfQuery,
  useGetCurrenciesMinMaxValueQuery,
  useDownloadStallionExcelFileQuery,
  useMemberFavMareQuery,
  useStallionLocationsQuery,
  usePostEmailShareMutation,
  useStallionProfileImageUploadMutation
} = apiWithStallions;