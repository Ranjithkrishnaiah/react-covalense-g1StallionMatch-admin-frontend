import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation, prepareHeaders } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithRaceHorses = splitApi.injectEndpoints({
    endpoints: (builder) => ({
      raceHorses: builder.query<any, object>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.raceHorseApiPath, params, true)
        ),      
        providesTags: (result, error) => [{ type: 'raceHorses' }],      
      }),
      raceHorse: builder.query<any, string>({
        query: (id: any) => (
          prepareAPIQuery(api.baseUrl, api.raceHorseApiPath + id, '', true)
        ),      
        providesTags: (result, error) => [{ type: 'raceHorses' }],      
      }),
      addRaceHorse: builder.mutation<{}, any>({
        query: (raceHorsePayload) => (prepareAPIMutation(api.baseUrl, api.raceHorseApiPath, '', 'POST', raceHorsePayload, true)),
        invalidatesTags: ['raceHorses']
      }),
      seachByRaceHorseName: builder.query<any, any>({
        query: (name) => prepareAPIQuery(api.baseUrl, api.raceHorseApiPath + '/search-runner-horse-name?horseName=' + name, '', true),
      }),   
      updateRaceHorseStatus: builder.mutation<{}, any>({        
        query: (raceHorsePayload: any) => (prepareAPIMutation(api.baseUrl, api.raceHorseApiPath + '/' + raceHorsePayload.raceHorseId + '/activate-deactivate', '', 'PATCH', '', true)),
        invalidatesTags: ['raceHorses']
      }),
      updateRaceHorseUrl: builder.mutation<{}, any>({        
        query: ({ raceHorseId, ...raceHorsePayload }) => (prepareAPIMutation(api.baseUrl, api.raceHorseApiPath + '/' + raceHorseId + '/update-url', '', 'PATCH', raceHorsePayload, true)),
        invalidatesTags: ['raceHorses']
      }),
      downloadRaceHorseExcelFile: builder.query({
        queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
          const result: any = await baseQuery({
            url: BaseAPI + '/v1' + 
              '/race-horse/download-csv',
              headers : prepareHeaders(),
            responseHandler: (response) => response.blob(),
          });
          var hiddenElement = document.createElement('a');
          var url = window.URL || window.webkitURL;
          var blobPDF = url.createObjectURL(result?.data);
          hiddenElement.href = blobPDF;
          hiddenElement.target = '_blank';
          hiddenElement.download = `racehorses.xlsx`;
          hiddenElement.click();
          return { data: null };
        },
      }),
    }),
});  

export const { 
  useRaceHorsesQuery,
  useRaceHorseQuery,
  useAddRaceHorseMutation,
  useSeachByRaceHorseNameQuery,
  useUpdateRaceHorseStatusMutation,
  useUpdateRaceHorseUrlMutation,
  useDownloadRaceHorseExcelFileQuery
} = apiWithRaceHorses;