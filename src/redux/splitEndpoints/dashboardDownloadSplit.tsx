import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Farm } from 'src/@types/farm';
import { api } from '../../api/apiPaths';
import { FarmMareList } from 'src/@types/farmMareList';

const accessToken = localStorage.getItem('accessToken');
export const dashboardDownloadApi = createApi({
  reducerPath: api.farmDashboardCsvReducerPath,
  baseQuery: fetchBaseQuery({
    baseUrl: api.baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      return headers;
    },
  }),
  tagTypes: [api.farmTag],
  endpoints: (builder) => ({
    downloadExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/farms/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadRaceExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/race/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate +
            '&countryId=' +
            setupId.countryId,
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${setupId.countryId}-${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.xlsx`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    downloadRunnerExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/runner/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate +
            '&countryId=' +
            setupId.countryId,
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${setupId.countryId}-${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.xlsx`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    downloadMessagingExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/messages/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadHorseExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/horses/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadMemberExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/members/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadStallionExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/stallions/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadDashboardExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/app-dashboard/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
    downloadStallionAnalyticsPdfFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/stallions/analytics/download' +
            '?fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate +
            '&stallionId=' +
            setupId.stallionId
            ,
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var pdfLink = result?.data[0]?.downloadUrl;
        
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.pdf`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    downloadStallionStudFeeHistoryPdfFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/stallions/fee-history/download' +
            '?fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate +
            '&stallionId=' +
            setupId.stallionId
            ,
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var pdfLink = result?.data[0]?.downloadUrl;
        
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.pdf`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    downloadUserListExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/users/download'
            ,
          responseHandler: (response) => response.blob(),
        });
        var hiddenElement = document.createElement('a');
        var url = window.URL || window.webkitURL;
        var pdfLink = result?.data[0]?.downloadUrl;        
        var blobPDF = url.createObjectURL(result?.data);
        hiddenElement.href = blobPDF;
        hiddenElement.target = '_blank';
        hiddenElement.download = `Report.xlsx`;
        hiddenElement.click();
        return { data: null };
      },
    }),
    downloadReportsExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:
            '/report/dashboard-report/?kpiTitle=' +
            setupId.kpiTitle +
            '&fromDate=' +
            setupId.fromDate +
            '&toDate=' +
            setupId.toDate,
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
  useDownloadExcelFileQuery,
  useDownloadRaceExcelFileQuery,
  useDownloadRunnerExcelFileQuery,
  useDownloadMessagingExcelFileQuery,
  useDownloadHorseExcelFileQuery,
  useDownloadMemberExcelFileQuery,
  useDownloadStallionExcelFileQuery,
  useDownloadDashboardExcelFileQuery,
  useDownloadStallionAnalyticsPdfFileQuery,
  useDownloadStallionStudFeeHistoryPdfFileQuery,
  useDownloadUserListExcelFileQuery,
  useDownloadReportsExcelFileQuery,
} = dashboardDownloadApi;
