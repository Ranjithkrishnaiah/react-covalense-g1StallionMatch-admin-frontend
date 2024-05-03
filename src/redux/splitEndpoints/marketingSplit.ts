import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";
import { MarketingHomePage, HeroImages, Banner1, Banner2, Testimonials, MarketingAddHomePage } from 'src/@types/marketing';

export const apiWithMarketing = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    marketingPage: builder.query<any, any>({
      query: (pageId) => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageApiPath+pageId, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    marketingStallionMatchPage: builder.query<any, any>({
      query: (pageId:any) => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageApiPath+pageId.matchPageId, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    marketingMainHomePage: builder.query<any, any>({
      query: (pageId:any) => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageApiPath+pageId.matchPageId, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    homePage: builder.query<any,void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageApiPath + '1883F682-D219-449A-ADC0-17C577F5A6D9', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),   
    homePageFormElements: builder.query<MarketingAddHomePage, any>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageAddEditApiPath, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }), 
    addHomePage: builder.mutation<any, any>({
      query: ({pageId, ...marketingHomePayload})  => (prepareAPIMutation(api.baseUrl, api.marketingHomePageAddEditApiPath + pageId, '', 'PATCH', marketingHomePayload, true)),
      invalidatesTags: ['marketingHome']
    }),  
    homeCarasouls: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageCarasoulApiPath, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    homeCarasoul: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageCarasoulApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    addHomePageCarasoul: builder.mutation<{}, any>({
      query: (marketingHomeCarasoulPayload) => (prepareAPIMutation(api.baseUrl, api.marketingHomePageCarasoulApiPath, '', 'POST', marketingHomeCarasoulPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    editHomePageCarasoul: builder.mutation<{}, any>({
      query: ({ id, ...marketingHomeCarasoulPayload })  => (prepareAPIMutation(api.baseUrl, api.marketingHomePageCarasoulApiPath + id, '', 'PATCH', marketingHomeCarasoulPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    deleteByUuid: builder.mutation<any, any>({
      query: ({id})  => (prepareAPIMutation(api.baseUrl, api.marketingDeleteUuidApiPath + id, '', 'DELETE', {}, true)),
      invalidatesTags: ['marketingHome']
    }),
    homeTestimonials: builder.query<any, void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageTestimonialApiPath, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    homeTestimonial: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageTestimonialApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingHome' }],      
    }),
    addHomePageTestimonial: builder.mutation<{}, any>({
      query: (marketingHomeTestimonialPayload) => (prepareAPIMutation(api.baseUrl, api.marketingHomePageTestimonialApiPath, '', 'POST', marketingHomeTestimonialPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    editHomePageTestimonial: builder.mutation<{}, any>({
      query: ({ id, ...marketingHomeTestimonialPayload })  => (prepareAPIMutation(api.baseUrl, api.marketingHomePageTestimonialApiPath + id, '', 'PATCH', marketingHomeTestimonialPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    uploadImage: builder.mutation<{}, any>({
      query: (marketingUploadImagePayload)  => (prepareAPIMutation(api.baseUrl, api.marketingImageUploadApiPath, '', 'POST', marketingUploadImagePayload, true)),
      // invalidatesTags: ['marketingHome']
    }),
    reorderMarketingPageSectionListRows: builder.mutation<{}, any>({
      query: ({ PageSectionId, ...reorderReqData })  => (prepareAPIMutation(api.baseUrl, api.marketingPageSectionApiPath + "/" + PageSectionId + "/reorder", '', 'PATCH', reorderReqData, true)),
      invalidatesTags: ['marketingHome']
    }),
    //Second Tab
    addPricingTile: builder.mutation<{}, any>({
      query: ({ pricingTileType, ...reqPayload }) => (prepareAPIMutation(api.baseUrl, api.pricingTileApiPath + '?type=' + pricingTileType, '', 'POST', reqPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    deletePricingTile: builder.mutation<{}, any>({
      query: ({ pricingTileType, ...reqPayload }) => (prepareAPIMutation(api.baseUrl, api.pricingTileApiPath + '?type=' + pricingTileType, '', 'DELETE', reqPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    //Third Tab
    trendsPage: builder.query<any,void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingHomePageApiPath+'961FA78B-D162-4E58-9D5F-B2943B66DB26', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingTrends' }],      
    }),   
    addTrendPage: builder.mutation<{}, any>({
      query: (marketingTrendsPayload) => (prepareAPIMutation(api.baseUrl, api.marketingTrendsAddEditApiPath, '', 'POST', marketingTrendsPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    editTrendPage: builder.mutation<{}, any>({
      query: ({ id, ...marketingTrendsPayload })  => (prepareAPIMutation(api.baseUrl, api.marketingTrendsAddEditApiPath + id, '', 'PATCH', marketingTrendsPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    //Fourth Tab
    reportsOverviewPage: builder.query<any,void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.marketingReportsOverviewPageApiPath, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingReportsOverview' }],      
    }),  
    reportOverviewPage: builder.query<any, string>({
      query: (id) => (
        prepareAPIQuery(api.baseUrl, api.marketingReportsOverviewPageApiPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingReportsOverview' }],      
    }), 
    addReportOverview: builder.mutation<{}, any>({
      query: (marketingReportOverviewPayload)  => (prepareAPIMutation(api.baseUrl, api.marketingReportsOverviewPageApiPath, '', 'POST', marketingReportOverviewPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
    editReportOverview: builder.mutation<{}, any>({
      query: ({ id, ...rest })  => (prepareAPIMutation(api.baseUrl, api.marketingReportsOverviewPageApiPath + id, '', 'PATCH', rest, true)),
      invalidatesTags: ['marketingHome', 'marketingReportsOverview']
    }),
    uploadPdf: builder.mutation<{}, any>({
      query: (marketingUploadPdfPayload)  => (prepareAPIMutation(api.baseUrl, api.marketingPdfUploadApiPath, '', 'POST', marketingUploadPdfPayload, true)),
      // invalidatesTags: ['marketingHome']
    }),
    // fifth Tab
    farmPage: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.marketingFarmPageApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingFarm' }],      
    }),
    farmPageProfile: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPageApiPath + params.pageId + '/' + params.farmId + '/profile', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingFarm' }],      
    }),
    farmPageMedia: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPageApiPath + params.pageId + '/' + params.farmId + '/media', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketing farm media' }],      
    }),
    farmPageGalleryImage: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPageApiPath + params.pageId + '/' + params.farmId + '/gallery-images', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingFarmGallery' }],      
    }),
    editFarmPage: builder.mutation<{}, any>({
      query: ({ pageId, farmId, ...rest })  => (prepareAPIMutation(api.baseUrl, api.farmPageApiPath + pageId + '/' + farmId, '', 'PATCH', rest, true)),
      // invalidatesTags: ['farm', 'marketingFarmGallery', 'marketing farm media']
      invalidatesTags: ['marketingFarmGallery']
    }),
    postFarmGalleryimageUpload: builder.mutation<any, any>({
      query: (payload)  => (prepareAPIMutation(api.baseUrl, '/farms/' + payload?.farmId + '/gallery-images', '', 'POST', payload, true)),
    }),
    patchFarmProfileGalleryimage: builder.mutation<any, any>({
      query: ({ farmId, ...payload })  => (prepareAPIMutation(api.baseUrl, '/farms/' + payload?.farmId + '/gallery-images', '', 'PATCH', payload, true)),
    }),
    farmGalleryImagesUploadStatus: builder.mutation<any, any>({
      query: (mediauuid)  => (prepareAPIMutation(api.baseUrl, api.marketingUploadStatusApiPath, '', 'POST', mediauuid, true)),
      invalidatesTags: ['marketingHome']
    }),
    getFarmMedia: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.farmPageApiPath + params.pageId + '/' + params.farmId + '/media', { mediaId: params.mediaId }, true)
      ),       
    }),
    addFarmMedia: builder.mutation<{}, any>({
      query: ({ pageId, farmId, ...farmMediaPayload })  => (prepareAPIMutation(api.baseUrl, api.farmPageApiPath + pageId + "/" + farmId + "/media", '', 'POST', farmMediaPayload, true)),
      // invalidatesTags: ['marketingFarmGallery', 'marketing farm media']
    }),
    //Sixth Tab
    stallionPage: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.marketingStallionPageApiPath, params, true)
      ),
      providesTags: (result, error) => ['marketingStallion']
    }),
    stallionTestimonials: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.marketingStallionPageTestimonialApiPath + params.pageId + '/' + params.stallionId + '/testimonials', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketingStallionPageTestimonialTag' }],      
    }),
    stallionTestimonial: builder.query<any, any>({
      query: (params: any) => (
        prepareAPIQuery(api.baseUrl, api.marketingStallionPageTestimonialApiPath + params.pageId + '/' + params.stallionId + '/testimonials', {testimonialId: params.testimonialId}, true)
      ),      
      // providesTags: (result, error) => [{ type: 'marketingStallionPageTestimonialTag' }],      
    }),
    addStallionTestimonial: builder.mutation<{}, any>({
      query: ({ pageId, stallionId, ...stallionTesimonialsPayload }) => (prepareAPIMutation(api.baseUrl, api.marketingStallionPageTestimonialApiPath + pageId + "/" + stallionId + "/testimonial", '', 'POST', stallionTesimonialsPayload, true)),
      // invalidatesTags: ['marketingStallionPageTestimonialTag']
    }),
    editStallionTestimonial: builder.mutation<{}, any>({
      query: ({ pageId, stallionId, ...stallionTesimonialsPayload })  => (prepareAPIMutation(api.baseUrl, api.marketingStallionPageTestimonialApiPath + pageId + "/" + stallionId + "/testimonial", '', 'PATCH', stallionTesimonialsPayload, true)),
      // invalidatesTags: ['marketingStallionPageTestimonialTag']
    }),
    editMarketingStallion: builder.mutation<{}, any>({
      query: ({ pageId, stallionId, ...stallionPayload })  => (prepareAPIMutation(api.baseUrl, api.marketingStallionPageTestimonialApiPath + pageId + "/" + stallionId, '', 'PATCH', stallionPayload, true)),
      invalidatesTags: ['stallions','marketing stallion']
    }),
    uploadStallionTestimonialImage: builder.mutation<{}, any>({
      query: ({ pageId, stallionId, ...marketingStallionTestimonialImagePayload })  => (prepareAPIMutation(api.baseUrl, api.marketingStallionPageTestimonialApiPath + pageId + "/" + stallionId + "/testimonials-media", '', 'POST', marketingStallionTestimonialImagePayload, true)),
    }),
    getStallionGalleryImages: builder.query<any, any>({
      query: (params: any) => (
        prepareAPIQuery(api.baseUrl, api.marketingStallionPageTestimonialApiPath + params.pageId + '/' + params.stallionId + '/gallery-images', '', true)
      ),      
      providesTags: (result, error) => [{ type: 'marketing stallion' }],      
    }),
    patchStallionProfileGalleryimage: builder.mutation<{}, any>({
      query: ({ stallionId, pageId, ...payload })  => (prepareAPIMutation(api.baseUrl, '/stallion/' + pageId + '/' + stallionId + '/gallery-images', '', 'POST', payload, true)),      
    }),
    // seventh Tab
    getRaceHorse: builder.query<any, any>({
      query: ({ pageId, ...params })=> prepareAPIQuery(api.baseUrl, api.marketingRaceHorsePageApiPath + pageId, params, true),
      providesTags: (result, error) => ['marketingHome']
    }),
    ///////
    deleteImageByUuid: builder.mutation<any, any>({
      query: (params: any) => (prepareAPIMutation(api.baseUrl, api.marketingDeleteImageByUuidApiPath + params.pageSectionUuId, '', 'DELETE', '', true)),
      invalidatesTags: ['marketingHome']
    }),
    deleteCarouselImageByUuid: builder.mutation<any, any>({
      query: (carouselId: any) => (prepareAPIMutation(api.baseUrl, api.marketingHomePageCarasoulApiPath + "delete-image/" + carouselId, '', 'DELETE', '', true)),
    }),
    deleteTestimonialImageByUuid: builder.mutation<any, any>({
      query: (testimonialId: any) => (prepareAPIMutation(api.baseUrl, api.marketingHomePageTestimonialApiPath + "delete-image/" + testimonialId, '', 'DELETE', '', true)),
    }),
    deleteReportOverviewImageByUuid: builder.mutation<any, any>({
      query: (params: any) => (prepareAPIMutation(api.baseUrl, api.marketingReportsOverviewPageApiPath + params.reportOverviewlId + "/file/" + params.fileType, '', 'DELETE', '', true)),
    }),
    updateFarmMarketingPage: builder.mutation<any, any>({
      query: ({pageId, ...marketingFarmPayload}) => (prepareAPIMutation(api.baseUrl, api.marketingFarmPageAddEditApiPath + pageId, '', 'PATCH', marketingFarmPayload, true)),
      invalidatesTags: ['marketingHome']
    }),
  }),
});

export const {
  useHomePageQuery,
  useHomeCarasoulQuery,
  useAddHomePageCarasoulMutation,
  useEditHomePageCarasoulMutation,
  useHomeTestimonialQuery,
  useAddHomePageTestimonialMutation,
  useEditHomePageTestimonialMutation,
  useAddHomePageMutation,
  useHomePageFormElementsQuery,
  useTrendsPageQuery,
  useAddTrendPageMutation,
  useEditTrendPageMutation,
  useReportsOverviewPageQuery,
  useReportOverviewPageQuery,
  useAddReportOverviewMutation,
  useEditReportOverviewMutation,
  useHomeCarasoulsQuery,
  useHomeTestimonialsQuery,
  useUploadImageMutation,
  useDeleteByUuidMutation,
  useMarketingPageQuery,
  useReorderMarketingPageSectionListRowsMutation,
  useAddPricingTileMutation,
  useDeletePricingTileMutation,
  useUploadPdfMutation,
  useStallionPageQuery,
  useStallionTestimonialsQuery,
  useStallionTestimonialQuery,
  useAddStallionTestimonialMutation,
  useEditStallionTestimonialMutation,
  useEditMarketingStallionMutation,
  usePatchStallionProfileGalleryimageMutation,
  useGetStallionGalleryImagesQuery,
  useUploadStallionTestimonialImageMutation,
  useFarmPageProfileQuery,
  useFarmPageMediaQuery,
  useFarmPageGalleryImageQuery,
  useEditFarmPageMutation,
  usePatchFarmProfileGalleryimageMutation,
  useFarmGalleryImagesUploadStatusMutation,
  usePostFarmGalleryimageUploadMutation,
  useGetFarmMediaQuery,
  useAddFarmMediaMutation,
  useDeleteImageByUuidMutation,
  useDeleteCarouselImageByUuidMutation,
  useDeleteTestimonialImageByUuidMutation,
  useDeleteReportOverviewImageByUuidMutation,
  useGetRaceHorseQuery,
  useUpdateFarmMarketingPageMutation,
  useMarketingStallionMatchPageQuery,
  useMarketingMainHomePageQuery
} = apiWithMarketing;
