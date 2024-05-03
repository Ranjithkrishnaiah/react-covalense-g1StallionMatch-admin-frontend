import { Farm } from 'src/@types/farm'
import { api } from "src/api/apiPaths";
import { FarmMareList } from 'src/@types/farmMareList';
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithSale = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    sales: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.salesPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    sale: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    addSales: builder.mutation<{}, any>({
      query: (salesPayload) => (prepareAPIMutation(api.baseUrl, api.salesPath, '', 'POST', salesPayload, true)),
      invalidatesTags: ['sale']
    }),
    editSales: builder.mutation<{}, any>({
      query: ({ id, ...salesPayload })  => (prepareAPIMutation(api.baseUrl, api.salesPath + id, '', 'PATCH', salesPayload, true)),
      invalidatesTags: ['sale']
    }),
    deleteSale: builder.mutation<any, any>({
      query: (salesId)  => (prepareAPIMutation(api.baseUrl, api.salesPath + salesId, '', 'DELETE', {}, true)),
      invalidatesTags: ['sale']
    }),
    salesLots: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.salesLots, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    salesLotInfo: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLotInfo + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    currentMonthSales: builder.query<any, string>({
      query: (id) => (
        prepareAPIQuery(api.baseUrl, api.currentMonthSales + id, '', true)
      ),
      providesTags: (result, error) => [{ type: 'sale' }],   
    }),
    saleCompany: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.salesCompany, '', true)
      )     
    }),
    saleType: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.salesType, '', true)
      )     
    }),
    downloadSalesTemplate: builder.query<any, any>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.downloadSalesTemplate, '', true)
      )     
    }),
    salesLotsDetails: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLots + '/' + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    uploadLots: builder.mutation<{}, any>({
      query: (data) => (prepareAPIMutation(api.baseUrl, api.salesLots + '/' + data[0], '', 'POST', data[1], true)),
      invalidatesTags: ['sale']
    }),
    salesLotsHorseDetails: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLots + '/horse-details/' + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    downloadSalesLots: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLots + api.downloadsalesLots + '/' + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'sale' }],      
    }),
    verifyLots: builder.mutation<{}, any>({
      query: (data)  => (prepareAPIMutation(api.baseUrl, api.salesLots + '/' + data[0], '', 'PATCH', data[1], true)),
      invalidatesTags: ['sale']
    }),
    saleStatus: builder.query<any, void>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesStatus, '', true)
      ),
    }),
    lotLists: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLots + api.lotList + id, '', true)
      ),
      providesTags: ['sale']
    }),
    impactAnalysisTypeList: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.impactAnalysisType, '', true)
      ),
    }),
    reportSetting: builder.mutation<{}, any>({
      query: (data) => (prepareAPIMutation(api.baseUrl, api.salesLots + api.reportSettings + data[0], '', 'POST', data[1], true)),
      invalidatesTags: ['sale']
    }),
    salesByCountryId: builder.query<any, any>({
      query: (countryId: any) => (
        prepareAPIQuery(api.baseUrl, api.salesPath + api.salesByCountryIdPath + countryId, '', true)
      ),     
    }),
    salesLotBySalesId: builder.query<any, any>({
      query: (salesId: any) => (
        prepareAPIQuery(api.baseUrl, api.salesLots + api.salesLotBySaleIdPath + salesId, '', true)
      ),     
    }),
  }),
});

export const {
  useSalesQuery,
  useSaleQuery,
  useAddSalesMutation,
  useEditSalesMutation,
  useSaleCompanyQuery,
  useSaleTypeQuery,
  useDeleteSaleMutation,
  useDownloadSalesTemplateQuery,
  useSalesLotsQuery,
  useCurrentMonthSalesQuery,
  useUploadLotsMutation,
  useSalesLotInfoQuery,
  useSalesLotsDetailsQuery,
  useDownloadSalesLotsQuery,
  useVerifyLotsMutation,
  useSalesLotsHorseDetailsQuery,
  useSaleStatusQuery,
  useLotListsQuery,
  useImpactAnalysisTypeListQuery,
  useReportSettingMutation,
  useSalesByCountryIdQuery,
  useSalesLotBySalesIdQuery
} = apiWithSale;