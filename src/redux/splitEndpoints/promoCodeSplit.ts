import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithPromoCode = splitApi.injectEndpoints({
    endpoints: (builder) => ({
      promoCodes: builder.query<any, object>({
        query: (params) => (
          prepareAPIQuery(api.baseUrl, api.promoCodePath, params, true)
        ),      
        providesTags: (result, error) => [{ type: 'promoCodes' }],      
      }),
      promoCode: builder.query<any, string>({
        query: (id: any) => (
          prepareAPIQuery(api.baseUrl, api.promoCodePath + id, '', true)
        ),      
        providesTags: (result, error) => [{ type: 'promoCodes' }],      
      }),
      addPromoCode: builder.mutation<{}, any>({
        query: (promoCodePayload) => (prepareAPIMutation(api.baseUrl, api.promoCodePath, '', 'POST', promoCodePayload, true)),
        invalidatesTags: ['promoCodes']
      }),
      editPromoCode: builder.mutation<{}, any>({
        query: ({ id, ...promoCodePayload })  => (prepareAPIMutation(api.baseUrl, api.promoCodePath + id, '', 'PATCH', promoCodePayload, true)),
        invalidatesTags: ['promoCodes']
      }),
      sharePromocodeList: builder.query<any, object>({
        query: (params: any) => (
          prepareAPIQuery(api.baseUrl, api.sharepromoCodesApiPath, params, true)
        ), 
        providesTags: (result, error) => [{type: 'promoCodes'}]
      }), 
    }),
});  

export const {
  usePromoCodesQuery,
  usePromoCodeQuery,
  useAddPromoCodeMutation,
  useEditPromoCodeMutation,
  useSharePromocodeListQuery
} = apiWithPromoCode;