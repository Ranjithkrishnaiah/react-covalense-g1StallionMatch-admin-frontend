import { api } from "src/api/apiPaths";
import { ProductLists } from 'src/@types/products';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
import { prepareHeaders } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
export const apiWithProduct = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    products: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.productPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'products' }],      
    }),
    product: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.productPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'products' }],      
    }),
    addProduct: builder.mutation<{}, any>({
      query: (productPayload) => (prepareAPIMutation(api.baseUrl, api.productPath, '', 'POST', productPayload, true)),
      invalidatesTags: ['products']
    }),
    updateProduct: builder.mutation<{}, any>({
      query: ({ id, ...productPayload })  => (prepareAPIMutation(api.baseUrl, api.productPath + id, '', 'PATCH', productPayload, true)),
      invalidatesTags: ['products']
    }),
    productDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.productPath + api.productDashboard, params, true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    productRedepmtionGraphData: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.productPath + api.productDashboard + '/' + api.productRedepmtionGraphData, params, true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    mostPopularPromocodes: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.productPath + api.productDashboard + '/' + api.productmostPopularPromocodes, params, true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    mostPopularProducts: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.productPath + api.productDashboard + '/' + api.productmostPopularProducts, params, true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    productList: builder.query<any, void>({
      query: (id: any) => (
      prepareAPIQuery(api.baseUrl, api.productPath + api.productListPath, '', true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    pricings: builder.query<any, string>({
      query: (id: any) => (
      prepareAPIQuery(api.baseUrl, api.pricingPath + '/' + id, '', true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    memberProductList: builder.query<ProductLists[], void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.productlListPath, '', true)
      ),      
      providesTags: (result, error) => ['products'],      
    }),
    downloadProductExcelFile: builder.query({
      queryFn: async ({ setupId }, api, extraOptions, baseQuery) => {
          const result:any = await baseQuery({
              url: BaseAPI + '/v1' + '/products/dashboard-report/?kpiTitle='+setupId.kpiTitle+'&fromDate='+setupId.fromDate+'&toDate='+setupId.toDate,
              headers : prepareHeaders(),
              responseHandler: ((response) => response.blob())
          })
          var hiddenElement = document.createElement('a');
          var url = window.URL || window.webkitURL;
          var blobPDF = url.createObjectURL(result?.data);
          hiddenElement.href = blobPDF;
          hiddenElement.target = '_blank';
          hiddenElement.download = `${setupId.kpiTitle}-${setupId.fromDate}-${setupId.toDate}.xlsx`;
          hiddenElement.click();
          return { data: null }
      }
    }),
  }),
});  


export const {
  useProductsQuery,
  useProductQuery,
  usePricingsQuery,
  useProductListQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useMemberProductListQuery,
  useProductDashboardQuery,
  useDownloadProductExcelFileQuery,
  useProductRedepmtionGraphDataQuery,
  useMostPopularPromocodesQuery,
  useMostPopularProductsQuery,
} = apiWithProduct;