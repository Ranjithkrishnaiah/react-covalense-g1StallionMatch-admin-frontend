import axios from "axios";
import { fetchData } from "./index";
const accessToken = localStorage.getItem('accessToken');

export const getRecentReportList = (order: any, page: any, limit: any, fromDate: any, toData: any) => fetchData(
    { url: `order-transactions/recent-order?order=${order}&page=${page}&limit=${limit}&fromDate=${fromDate}&toData=${toData}`, method: 'GET' });

export const getAllReportList = (order: any = "DESC", page: any = 1, limit: any = 25, isRequeiredApproval: any = '', name: any = "", isNameExactSearch: any = "", email: any = "",
    isEmailExactSearch: any = "", date: any = "", reportId: any = "", orderId: any = "", initiatedDate: any = "", completedDate: any = "", deliveredDate: any = "",
    orderStatusId: any = "", sireName: any = "", isSireNameExactSearch: any = "", damName: any = "", isDamNameExactSearch: any = "", countryId: any = "", paymentMethodId: any = "", currencyId: any = "",
    minPrice: any = 0, maxPrice: any = 100, companyName: any = "", isCompanyNameExactSearch: any = "") => fetchData(
        {
            url: `report/orders-list?order=${order}&page=${page}&limit=${limit}`, method: 'GET'
            //         url: `report/orders-list?order=${order}&page=${page}&limit=${limit}${isRequeiredApproval && "&isRequeiredApproval=" + isRequeiredApproval}${name && "&name=" + name}${isNameExactSearch && "&isNameExactSearch=" + isNameExactSearch}${email && "&email=" + email}
            // ${isEmailExactSearch && "&isEmailExactSearch=" + isEmailExactSearch}${date && "&date=" + date}${reportId && "&reportId=" + reportId}${orderId && "&orderId=" + orderId}${initiatedDate && "&initiatedDate=" + initiatedDate}${completedDate && "&completedDate=" + completedDate}
            // ${deliveredDate && "&deliveredDate=" + deliveredDate}${orderStatusId && "&orderStatusId=" + orderStatusId}${sireName && "&sireName=" + sireName}${isSireNameExactSearch && "&isSireNameExactSearch=" + isSireNameExactSearch}${damName && "&damName=" + damName}
            // ${isDamNameExactSearch && "&isDamNameExactSearch=" + isDamNameExactSearch}${countryId && "&countryId=" + countryId}${paymentMethodId && "&paymentMethodId=" + paymentMethodId}${currencyId && "&currencyId=" + currencyId}&minPrice=${minPrice}
            // &maxPrice=${maxPrice}${companyName && "&companyName=" + companyName}${isCompanyNameExactSearch && "&isCompanyNameExactSearch=" + isCompanyNameExactSearch}`, method: 'GET'
        });

export const getReportDashboardData = (fromDate: any, toDate: any) => fetchData(
    { url: `report/dashboard?fromDate=${fromDate}&toDate=${toDate}`, method: 'GET' });

export const getDashboardReportFile = (fromDate: any, toDate: any, kpiTitle: any) => fetchData(
    { url: `report/dashboard-report?fromDate=${fromDate}&toDate=${toDate}&kpiTitle=${kpiTitle}`, method: 'GET' });

export const getMostPopularLocations = (fromDate: any, toDate: any) => fetchData(
    { url: `report/most-popular-locations?fromDate=${fromDate}&toDate=${toDate}`, method: 'GET' });

export const getMostValuableUsers = (fromDate: any, toDate: any) => fetchData(
    { url: `report/most-valuable-users?fromDate=${fromDate}&toDate=${toDate}`, method: 'GET' });

export const getOrderHistoryChart = (fromDate: any, toDate: any) => fetchData(
    { url: `report/order-history-chart?fromDate=${fromDate}&toDate=${toDate}`, method: 'GET' });

export const getReportBreakDownChart = (fromDate: any, toDate: any) => fetchData(
    { url: `report/report-breakdown-chart?fromDate=${fromDate}&toDate=${toDate}`, method: 'GET' });

export const postReportsData = (data: any) => fetchData(
    { url: `orders`, method: 'POST', body: data });

export const getReportOrderbyId = (id: any) => fetchData(
    { url: `report/${id}`, method: 'GET' });

export const getStallionList = (order: any = "ASC", page: any = 1, limit: any = 100) => fetchData(
    { url: `stallions?order=${order}&page=${page}&limit=${limit}`, method: 'GET' });

//**** Report types ****//

export const postShortlistStallionReport = (data: any) => fetchData(
    { url: `orders/shortlist-stallion`, method: 'POST', body: data });

export const postStallionMatchProReport = (data: any) => fetchData(
    { url: `orders/stallion-match-pro`, method: 'POST', body: data });

export const postBoodMareAfinityReport = (data: any) => fetchData(
    { url: `orders/broodmare-afinity`, method: 'POST', body: data });

export const postSalesCatelogueReport = (data: any) => fetchData(
    { url: `orders/sales-catelogue`, method: 'POST', body: data });

export const postStallionXBreedingStockReport = (data: any) => fetchData(
    { url: `orders/stock-sale`, method: 'POST', body: data });

export const postStallionAfinityReport = (data: any) => fetchData(
    { url: `orders/stallion-afinity`, method: 'POST', body: data });

export const postBoodMareSireReport = (data: any) => fetchData(
    { url: `orders/broodmare-sire`, method: 'POST', body: data });


export const getsearchStallions = (stallionName: any) => fetchData(
    { url: `stallions?stallionName=${stallionName}`, method: 'GET' });


export const getfarms = (farmName: any) => fetchData(
    { url: `farms?farmName=${farmName}`, method: 'GET' });



export const getSearchMareList = (mareName: any) => fetchData(
    { url: `horses?horseName=${mareName}`, method: 'GET' });

// url: `http://localhost:5000/api/v1/horses?order=ASC&page=1&limit=25&horseName=${mareName}&sex=F`,

// export const getSearchMareList = (mareName: any) => {

//     let config: any = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: `http://localhost:5000/api/v1/horses?horseName=${mareName}`,
//         // url: `https://dev.stallionmatch.com/api/v1/stallions/search-mare-names?mareName=${mareName}`,
//         headers: {
//             'Authorization': `Bearer ${(accessToken)}`
//         }
//     };

//     return axios.request(config);
// }
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
export const getOrderByCountry = (startDate: number, endDate: number, country: number | string) => {
    let app1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjo1LCJlbWFpbCI6Im1hdHRoZXcuZW5uaXNAeW9wbWFpbC5jb20iLCJpYXQiOjE2ODE3OTM5MTUsImV4cCI6MTY4MTg4MDMxNX0.d-Y0Ln_xIGGUkwwMLPcPqZb1-jJRWxsOB1gzYHgvuZ4'
    let config: any = {
        method: 'get',
        maxBodyLength: Infinity,
        url: BaseAPI + '/v1' + `/report/orders-by-country?fromDate=${startDate}&toDate=${endDate}&countryId=${country}&groupedBy=${'Day'}`,
        headers: {
            'Authorization': `Bearer ${(accessToken)}`
        }
    };

    return axios.request(config);
}


