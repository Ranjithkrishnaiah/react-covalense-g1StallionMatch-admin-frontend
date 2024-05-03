import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareHeaders } from 'src/utils/customFunctions';
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

type OderStatusLists = {
  id: number;
  status: string;
  createdBy: number;
  createdOn: string;
};

export const apiWithReports = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    reports: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/orders-list', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    reportOrderStatus: builder.query<OderStatusLists[], void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, '/order-status', '', true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    shareReportList: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.shareReportDownload, params, true)
      ),
    }),
    downloadReportsExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url: BaseAPI + '/v1' +
            '/report/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
          headers: prepareHeaders(),
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
    reportDashboardData: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/dashboard', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getMostPopularLocations: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/most-popular-locations', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getMostValuableUsers: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/most-valuable-users', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getOrderHistoryChart: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/order-history-chart', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getReportBreakDownChart: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/report-breakdown-chart', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getRecentReportList: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.orderTransactionsApiPath + '/recent-order', params, true)
      ),
      providesTags: (result, error) => [{ type: 'report' }],
    }),
    getMinMaxReportValue: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportMinMaxPrice, params, true)
      )
    }),
    getOrderByCountry: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.reportsPath + '/orders-by-country', params, true)
      )
    }),
    getStallionByFeeAndLocation: builder.query<any, void>({
      query: (params: any) =>  (prepareAPIQuery(api.baseUrl, '/stallions/search-in-fee-range', params,true)),
      // providesTags: (result, error) => [{ type: 'stallionDetails' }],
    }),
  }),
});

export const {
  useReportsQuery,
  useReportOrderStatusQuery,
  useShareReportListQuery,
  useDownloadReportsExcelFileQuery,  
  useGetMinMaxReportValueQuery,
  useReportDashboardDataQuery,
  useGetMostPopularLocationsQuery,
  useGetMostValuableUsersQuery,
  useGetOrderHistoryChartQuery,
  useGetReportBreakDownChartQuery,
  useGetRecentReportListQuery,
  useGetOrderByCountryQuery,
  useGetStallionByFeeAndLocationQuery
} = apiWithReports
