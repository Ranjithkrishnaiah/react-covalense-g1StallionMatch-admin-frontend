import { Farm } from 'src/@types/farm'
import { api } from "src/api/apiPaths";
import { FarmMareList } from 'src/@types/farmMareList';
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
export const apiWithRunnerDetails = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    runners: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.runnerPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'runner' }],      
    }),
    runner: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.runnerPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'runner' }],      
    }),
    addRunner: builder.mutation<{}, any>({
      query: (runnerPayload) => (prepareAPIMutation(api.baseUrl, api.runnerPath, '', 'POST', runnerPayload, true)),
      invalidatesTags: ['runner']
    }),
    editRunner: builder.mutation<{}, any>({
      query: ({ id, ...runnerPayload })  => (prepareAPIMutation(api.baseUrl, api.runnerPath + id, '', 'PATCH', runnerPayload, true)),
      invalidatesTags: ['runner']
    }),
    runnerFinalPosition: builder.query<any, void>({
        query: () => (prepareAPIQuery(api.baseUrl, api.runnerFinalPosition, '', true))     
    }),
    runnerWeightUnit: builder.query<any, void>({
        query: () => (prepareAPIQuery(api.baseUrl, api.runnerWeightUnit, '', true))     
    }),
    runnersSource: builder.query<any, void>({
        query: () => (prepareAPIQuery(api.baseUrl, api.source, '', true))     
    }),
    runnersOwner: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.runnersOwner + '?order=ASC&name=' + name, '', true),
        providesTags: (result, error) => [{ type: 'stallions' }],
    }),
    runnersJockey: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.runnersJockey + '?order=ASC&name=' + name, '', true),
        providesTags: (result, error) => [{ type: 'stallions' }],
    }),  
    runnersTrainer: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.runnersTrainer + '?order=ASC&name=' + name, '', true),
        providesTags: (result, error) => [{ type: 'stallions' }],
    }),  
    runnersHorseName: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.runnersHorseName + '?order=ASC&name=' + name, '', true),
        providesTags: (result, error) => [{ type: 'stallions' }],
    }), 
    runnersGetHorseDetails: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.runnerGetHorseDetails + '/' + name, '', true),
        providesTags: (result, error) => [{ type: 'stallions' }],
    }),   
    changeEligibilityAll: builder.mutation<{}, any>({
        query: ({ id, ...rest })  => (prepareAPIMutation(api.baseUrl, api.runnerPath + id + '/' + api.changeEligibility + 'All', '', 'PATCH', rest, true)),
        invalidatesTags: ['runner']
    }),
    changeEligibilityForOnlyRunner: builder.mutation<{}, any>({
        query: ({ id, ...rest })  => (prepareAPIMutation(api.baseUrl, api.runnerPath + api.updateOnlyRunner + id, '', 'PATCH', rest, true)),
        invalidatesTags: ['runner']
    }),
    runnerDashboard: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.runnerPath + api.runnerDashboard, params, true)
        ),      
        providesTags: (result, error) => ['runner'],      
    }),
    runnerDashboardHorseColor: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.runnerPath + api.runnerDashboard + "common-horse-colours", params, true)
        ),      
        providesTags: (result, error) => ['runner'],      
    }),
    runnerDashboardWorldReach: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.runnerPath + api.runnerDashboard + "world-reach", params, true)
        ),      
        providesTags: (result, error) => ['runner'],      
    }),
    runnersGetRating: builder.query<any, any>({
        query: (name: any) => (
          prepareAPIQuery(api.baseUrl, '/runner' + api.runnerRating + '/' + name, '', true)
        ), 
        providesTags: [{ type: 'runner' }]
    }),
    shareRunners: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.shareRunnerApiPath, params, true)
      ), 
      providesTags: (result, error) => [{type: 'runner'}]
    }),
    runnerDashboardAccuracyRating: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.runnerPath + api.runnerDashboard + 'accuracy-rating', params, true)
      ),      
      providesTags: (result, error) => ['runner'],      
  }),
    downloadRunnerExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/runner/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate +
            '&countryId=' +
            setupId.countryId,
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
  }),
});

export const {
  useRunnersQuery,
  useRunnerQuery,
  useAddRunnerMutation,
  useEditRunnerMutation,
  useRunnerFinalPositionQuery,
  useRunnersOwnerQuery,
  useRunnersJockeyQuery,
  useRunnersTrainerQuery,
  useRunnerWeightUnitQuery,
  useRunnersSourceQuery,
  useRunnersHorseNameQuery,
  useRunnersGetHorseDetailsQuery,
  useChangeEligibilityAllMutation,
  useChangeEligibilityForOnlyRunnerMutation,
  useRunnerDashboardQuery,
  useRunnerDashboardHorseColorQuery,
  useRunnerDashboardWorldReachQuery,
  useRunnersGetRatingQuery,
  useShareRunnersQuery,
  useDownloadRunnerExcelFileQuery,
  useRunnerDashboardAccuracyRatingQuery
} = apiWithRunnerDetails;