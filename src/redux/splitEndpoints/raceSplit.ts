import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation, prepareHeaders } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithRace = splitApi.injectEndpoints({
    endpoints: (builder) => ({
      races: builder.query<any, object>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath, params, true)
        ),      
        providesTags: (result, error) => [{ type: 'race' }],      
      }),
      race: builder.query<any, string>({
        query: (id: any) => (
          prepareAPIQuery(api.baseUrl, api.racePath + id, '', true)
        ),      
        providesTags: (result, error) => [{ type: 'race' }],      
      }),
      addRaces: builder.mutation<{}, any>({
        query: (racePayload) => (prepareAPIMutation(api.baseUrl, api.racePath, '', 'POST', racePayload, true)),
        invalidatesTags: ['race']
      }),
      editRace: builder.mutation<{}, any>({
        query: ({ id, ...racePayload })  => (prepareAPIMutation(api.baseUrl, api.racePath + id, '', 'PATCH', racePayload, true)),
        invalidatesTags: ['race']
      }),
      raceVenue: builder.query<any, any>({
        query: (params) => prepareAPIQuery(api.baseUrl, api.raceVenue + '?order=ASC', params, true),
        providesTags: (result, error) => [{ type: 'FarmAutocomplete' }],
      }), 
      byRaceName: builder.query<any, any>({
        query: (params) => prepareAPIQuery(api.baseUrl, api.byRaceName + '/' + params, '',true),
      }), 
      raceTrackCondition: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceTrackCondition, '', true),
      }),
      raceTrackType: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceTrackType, '', true),
      }),
      raceType: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceType, '', true),
      }),
      raceClass: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceClass, '', true),
      }),
      raceStake: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStake, '', true),
      }),
      raceStatus: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStatus, '', true),
      }),
      raceStatusSexRestriction: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStatusSexRestriction, '', true),
      }),
      raceStatusAgeRestriction: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStatusAgeRestriction, '', true),
      }),
      raceStatusIsImportrd: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStatusIsImportrd, '', true),
      }),
      raceStatusAPIStatus: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStatusAPIStatus, '', true),
      }),
      raceDistanceUnitApi: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceDistanceUnit, '', true),
      }),
      changeEligibility: builder.mutation<{}, any>({
        query: ({ id, ...racePayload })  => (prepareAPIMutation(api.baseUrl, api.racePath + api.changeEligibility + id, '', 'PATCH', racePayload, true)),
        invalidatesTags: ['race']
      }),
      raceDashboard: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath + api.raceDashboardPath, params, true)
        ),      
        providesTags: (result, error) => ['race'],      
      }),
      raceDashboardMostValuedRaces: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath + api.raceDashboardPath + "most-valuable-races", params, true)
        ),      
        providesTags: (result, error) => ['race'],      
      }),
      raceDashboardTopPrizeMoney: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath + api.raceDashboardPath + "top-prizemoney", params, true)
        ),      
        providesTags: (result, error) => ['race'],      
      }),
      raceDashboardAvgDistance: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath + api.raceDashboardPath + "avg-distance", params, true)
        ),      
        providesTags: (result, error) => ['race'],      
      }),
      raceDashboardWorldReach: builder.query<any, any>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.racePath + api.raceDashboardPath + "world-reach", params, true)
        ),      
        providesTags: (result, error) => ['race'],      
      }),
      shareRaceList: builder.query<any, object>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.shareRaceApiPath, params, true)
        ),  
        providesTags: (result, error) => ['race']
      }),
      raceStakeCategory: builder.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.raceStakeCategoryApiPath, '', true),
      }),
      downloadRaceExcelFile: builder.query({
        queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
          const result: any = await baseQuery({
            url: BaseAPI + '/v1' + 
              '/race/dashboard-report/?kpiTitle=' +
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

export const { useRacesQuery,
  useRaceQuery,
  useAddRacesMutation,
  useEditRaceMutation,
  useRaceVenueQuery,
  useRaceTrackConditionQuery,
  useRaceTrackTypeQuery,
  useRaceTypeQuery,
  useRaceClassQuery,
  useRaceStatusQuery,
  useRaceStakeQuery,
  useRaceStatusAgeRestrictionQuery,
  useRaceStatusSexRestrictionQuery,
  useRaceStatusAPIStatusQuery,
  useRaceStatusIsImportrdQuery,
  useRaceDistanceUnitApiQuery,
  useChangeEligibilityMutation,
  useRaceDashboardQuery,
  useByRaceNameQuery,
  useRaceDashboardMostValuedRacesQuery,
  useRaceDashboardTopPrizeMoneyQuery,
  useRaceDashboardWorldReachQuery,
  useRaceDashboardAvgDistanceQuery,
  useShareRaceListQuery,
  useDownloadRaceExcelFileQuery,
  useRaceStakeCategoryQuery
} = apiWithRace;