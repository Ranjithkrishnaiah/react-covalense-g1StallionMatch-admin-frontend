import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareHeaders } from 'src/utils/customFunctions';
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithMainDashboard = splitApi.injectEndpoints({
  endpoints: (build) => ({
    mainDashboard: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard, params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    totalVisitors: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard + 'dashboard-visitors', params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    totalRegistrations: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard + 'total-registrations', params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    topVisitedFarms: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard + 'top-visited-farms', params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    visitorStatistics: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard + 'dashboard-visitors-statistics', params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    newCustomers: build.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.appDashboard + 'new-customers', params, true),
      providesTags: (result, error) => [{ type: 'app-dashboard' }],
    }),
    downloadDashboardExcelFile: build.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/app-dashboard/dashboard-report/?kpiTitle=' +
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
  }),
});

export const {
  useMainDashboardQuery,
  useTotalVisitorsQuery,
  useTopVisitedFarmsQuery,
  useTotalRegistrationsQuery,
  useVisitorStatisticsQuery,
  useNewCustomersQuery,
  useDownloadDashboardExcelFileQuery
} = apiWithMainDashboard;