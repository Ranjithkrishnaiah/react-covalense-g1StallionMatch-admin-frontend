import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation, prepareHeaders } from "src/utils/customFunctions";
import { HorseCountries } from 'src/@types/countries';

const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithHorses = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    horses: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.horsePath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'horses' }],      
    }),    
    horse: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.horsePath + id + '/tree', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'horses' }],      
    }),
    addHorse: builder.mutation<{}, any>({
      query: (horsePayload) => (prepareAPIMutation(api.baseUrl, api.horsePath, '', 'POST', horsePayload, true)),
      invalidatesTags: ['horses']
    }),
    editHorse: builder.mutation<{}, any>({
      query: ({ id, ...horsePayload })  => (prepareAPIMutation(api.baseUrl, api.horsePath + id, '', 'PATCH', horsePayload, true)),
      invalidatesTags: ['horses']
    }),
    horseAutocomplete: builder.query<any, any>({
      query: (name: any) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-horse-name?horseName=' + name, '',true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    RunnerAutocomplete: builder.query<any, any>({
      query: (name) => prepareAPIQuery(api.baseUrl, '/runner' + api.runnersHorseName + '?name=' + name?.horseName, '',true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    RunnerHorseMatchedMares: builder.query<any, any>({
      query: (params: any) => prepareAPIQuery(api.baseUrl, '/runner' + api.runnerHorseMatchedMares, params,true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    sireAutocomplete: builder.query<any, any>({
      query: (name) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-sire-name?sireName=' + name, '',true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    damAutocomplete: builder.query<any, any>({
      query: (name) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-dam-name?damName=' + name, '',true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    sireAutocompleteSearch: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-sire-name', params,true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    damAutocompleteSearch: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-dam-name', params,true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    horseAutocompleteSearch: builder.query<any, any>({
      query: (params: any) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-horse-name', params,true),
      providesTags: (result, error) => [{ type: 'horses' }],
    }),
    updateHorsePedigree: builder.mutation<{}, any>({
      query: ({ prevPedigreeId, ...horsePayload })  => (prepareAPIMutation(api.baseUrl, api.horsePath + prevPedigreeId + '/pedigree/', '', 'PATCH', horsePayload, true)),
      invalidatesTags: ['horses']
    }),
    horseNameAlias: builder.query<any, any>({
      query: ({ horseId, ...params }) => prepareAPIQuery(api.baseUrl, api.horseNameAliasAPIPath + horseId, params,true),
      providesTags: (result, error) => [{ type: 'horse-name-alias' }],
    }),
    deleteHorseNameAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseNameAliasAPIPath + horseAliasPayload.horseId + "/" + horseAliasPayload.horseName, '', 'DELETE', {}, true)),
      invalidatesTags: ['horse-name-alias']
    }),
    changeVisibilityHorseNameAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseNameAliasAPIPath +"change_visibility/"+ horseAliasPayload.horseId + "/" + horseAliasPayload.horseName, '', 'PATCH', { "isActive": horseAliasPayload.isActive }, true)),
      invalidatesTags: ['horse-name-alias']
    }),
    updateHorseNameAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseNameAliasAPIPath + horseAliasPayload.horseId + "/" + horseAliasPayload.horseName, '', 'PATCH', {}, true)),
      invalidatesTags: ['horse-name-alias']
    }),
    createHorseNameAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseNameAliasAPIPath, '', 'POST', horseAliasPayload, true)),
      invalidatesTags: ['horse-name-alias']
    }),
    horseCOBAlias: builder.query<any, any>({
      query: ({ horseId, ...params }) => prepareAPIQuery(api.baseUrl, api.horseCOBAliasAPIPath + horseId, params, true),
      providesTags: (result, error) => [{ type: 'horse-cob-alias' }],
    }),
    horseNameDefaultAlias: builder.query<any, any>({
      query: ({ horseId, ...params }) => prepareAPIQuery(api.baseUrl, api.horseNameDefaultAliasAPIPath + horseId, '', true),
      providesTags: (result, error) => [{ type: 'horse-name-alias' }],
    }),
    deleteHorseCoBAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseCOBAliasAPIPath + horseAliasPayload.horseId + "/" + horseAliasPayload.countryId, '', 'DELETE', {}, true)),
      invalidatesTags: ['horse-cob-alias']
    }),
    changeVisibilityHorseCoBAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseCOBAliasAPIPath + "change-visibility/" + horseAliasPayload.horseId + "/" + horseAliasPayload.countryId, '', 'PATCH', { "isActive": horseAliasPayload.isActive }, true)),
      invalidatesTags: ['horse-cob-alias']
    }),
    updateHorseCoBAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseCOBAliasAPIPath + horseAliasPayload.horseId + "/" + horseAliasPayload.countryId, '', 'PATCH', {}, true)),
      invalidatesTags: ['horse-cob-alias']
    }),
    createHorseCoBAlias: builder.mutation<{}, any>({
      query: (horseAliasPayload)  => (prepareAPIMutation(api.baseUrl, api.horseCOBAliasAPIPath, '', 'POST', horseAliasPayload, true)),
      invalidatesTags: ['horse-cob-alias']
    }),
    horseCoBDefaultAlias: builder.query<any, any>({
      query: ({ horseId, ...params }) => prepareAPIQuery(api.baseUrl, api.horseCOBDefaultAliasAPIPath + horseId, '', true),
      providesTags: (result, error) => [{ type: 'horse-cob-alias' }],
    }),
    horseDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.horseDashboardPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'horses' }],      
    }),
    horseHeaderKeywordSearch: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.horseKeywordSearchPath + "?keyWord=" + params.keyWord, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'horses' }],      
    }),
    HorseDetailsByid: builder.query<any, any>({
      query: (obj) => (
        prepareAPIQuery(api.baseUrl, '/horses/' + obj?.id + '/' + obj?.viewType, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'horses' }],      
    }),
    progenyByHorseId: builder.query<any, any>({
      query: ({horseId, ...params}) => (
        prepareAPIQuery(api.baseUrl, api.horsePath + horseId +'/progeny', params, true)
      ),
      providesTags: (result, error) => [{ type: 'horses' }]
    }),
    horseDetailsById: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.horsePath + id, '', true)
      ), 
      providesTags: ['horses']
    }),
    downloadHorseExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/horses/dashboard-report/?kpiTitle=' +
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
    uploadHorseImage: builder.mutation<{}, any>({
      query: ({ horseId, ...horseImagePayload })  => (prepareAPIMutation(api.baseUrl, api.horsePath + horseId + "/profile-image", '', 'POST', horseImagePayload, true)),
    }),
    updateHorseImage: builder.mutation<{}, any>({
      query: ({ horseId, ...horseImagePayload })  => (prepareAPIMutation(api.baseUrl, api.horsePath + horseId + "/profile-image", '', 'PATCH', horseImagePayload, true)),
      // invalidatesTags: ['horses']
    }),
    deleteHorseImage: builder.mutation<any, any>({
      query: (horseId)  => (prepareAPIMutation(api.baseUrl, api.horsePath + horseId + "/profile-image", '', 'DELETE', {}, true)),
      invalidatesTags: ['horses']
    }),
    horseImagesUploadStatus: builder.mutation<any, any>({
      query: (mediauuid)  => (prepareAPIMutation(api.baseUrl, api.marketingUploadStatusApiPath, '', 'POST', mediauuid, true)),
      invalidatesTags: ['horses']
    }),
    horseMergeExists: builder.query<any, any>({
      query: (param: any) => prepareAPIQuery(api.baseUrl, api.horsePath + param.horseId + '/horse-name-search?horseName=' + param.name, '',true),      
    }),
    mergeHorse: builder.mutation<{}, any>({
      query: (horseMergePayload) => (prepareAPIMutation(api.baseUrl, api.horsePath + "merge", '', 'POST', horseMergePayload, true)),
    }),
    horseLocations: builder.query<HorseCountries[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.horsePath + 'locations', '',true),      
    }),
    getStallionRequest: builder.query<any, string>({
      query: (requestId: any) => (
        prepareAPIQuery(api.baseUrl, api.stallionRequestApiPath + requestId, '', true)
      ),
    }),
    getMareRequest: builder.query<any, string>({
      query: (requestId: any) => (
        prepareAPIQuery(api.baseUrl, api.mareRequestApiPath + requestId, '', true)
      ),
    }),
    getHorsePositionByIdAndTag: builder.query<any, any>({
      query: (param) => (
        prepareAPIQuery(api.baseUrl, api.horsePath + param.pedigreeId + '/tag/' +param.tag , '', true)
      ),
    }),
    createHorseWithPedigree: builder.mutation<{}, any>({
      query: (horseWithPedigreePayload) => (prepareAPIMutation(api.baseUrl, api.horsePath + "create-horse-with-pedigree", '', 'POST', horseWithPedigreePayload, true)),
    }),
    newPedigreeAutocompleteSearch: builder.query<any, any>({
      query: (params: any) => prepareAPIQuery(api.baseUrl, api.horsePath + 'search-horse-by-name-sex', params, true),
    }),
  }),
});

export const {
  useHorsesQuery,
  useHorseQuery,
  useAddHorseMutation,
  useEditHorseMutation,
  useHorseAutocompleteQuery,
  useSireAutocompleteQuery,
  useDamAutocompleteQuery,
  useSireAutocompleteSearchQuery,
  useDamAutocompleteSearchQuery,
  useUpdateHorsePedigreeMutation,
  useHorseAutocompleteSearchQuery,
  useRunnerAutocompleteQuery,
  useHorseNameAliasQuery,
  useCreateHorseNameAliasMutation,
  useDeleteHorseNameAliasMutation,
  useChangeVisibilityHorseNameAliasMutation,
  useHorseCOBAliasQuery,
  useCreateHorseCoBAliasMutation,
  useDeleteHorseCoBAliasMutation,
  useChangeVisibilityHorseCoBAliasMutation,
  useHorseDashboardQuery,
  useHorseHeaderKeywordSearchQuery,
  useRunnerHorseMatchedMaresQuery,
  useHorseDetailsByidQuery,
  useUpdateHorseCoBAliasMutation,
  useUpdateHorseNameAliasMutation,
  useHorseNameDefaultAliasQuery,
  useHorseCoBDefaultAliasQuery,
  useProgenyByHorseIdQuery,
  useHorseDetailsByIdQuery,
  useDownloadHorseExcelFileQuery,
  useUploadHorseImageMutation,
  useUpdateHorseImageMutation,
  useDeleteHorseImageMutation,
  useHorseImagesUploadStatusMutation,
  useHorseMergeExistsQuery,
  useMergeHorseMutation,
  useHorseLocationsQuery,
  useGetStallionRequestQuery,
  useGetHorsePositionByIdAndTagQuery,
  useCreateHorseWithPedigreeMutation,
  useNewPedigreeAutocompleteSearchQuery,
  useGetMareRequestQuery
} = apiWithHorses;