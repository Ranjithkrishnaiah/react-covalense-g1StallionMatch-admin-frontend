import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation, prepareHeaders } from "src/utils/customFunctions";
import { Member, CreatedBy, MemberRecentOrders, RecentOrdersMember } from 'src/@types/member'
import { MemberCountries } from 'src/@types/countries';
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;

export const apiWithMembers = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    members: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.memberPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'member' }],      
    }),
    member: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.memberPath + id, '', true)
      ),      
      providesTags: (result, error) => [{ type: 'member' }],      
    }),
    addMember: builder.mutation<{}, any>({
      query: (memberPayload) => (prepareAPIMutation(api.baseUrl, api.memberPath, '', 'POST', memberPayload, true)),
      invalidatesTags: ['member']
    }),
    editMember: builder.mutation<{}, any>({
      query: ({ id, ...memberPayload })  => (prepareAPIMutation(api.baseUrl, api.memberPath + id, '', 'PATCH', memberPayload, true)),
      invalidatesTags: ['member']
    }),
    memberInvitation: builder.mutation<{}, any>({
      query: (memberInvitationPayload) => (prepareAPIMutation(api.baseUrl, api.memberInvitation, '', 'POST', memberInvitationPayload, true)),
      invalidatesTags: ['member']
    }),
    nameAutocompleteSearch: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.memberPath + 'byName/' + params, '', true),
      providesTags: (result, error) => [{ type: 'member' }],
    }), 
    emailAutocompleteSearch: builder.query<any, any>({
      query: (params) => prepareAPIQuery(api.baseUrl, api.memberPath + 'byEmail/' + params, '', true),
      providesTags: (result, error) => [{ type: 'member' }],
    }), 
    createdBy: builder.query<CreatedBy[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.createdByAPIPath, '', true),
      providesTags: (result, error) => [{ type: 'member' }],
    }),
    membersListWithoutAdmins: builder.query<[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.membersListWithoutAdmins, '', true),
      providesTags: (result, error) => [{ type: 'member' }],
    }),
    memberDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.memberDashboardPath, params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    memberDashboardRegByCountry: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberDashboardPath +"registations-by-country", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    memberDashboardRegRate: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberDashboardPath +"registration-rate", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    MemberDashboardWorldReach: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberDashboardPath + "world-reach-members", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    memberDashboardTotalVisitors: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberPath +"dashboard-visitors", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    memberDashboardAvgVisitorsGrowth: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberPath +"dashboard-avg-visitors", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    memberDashboardSessions: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.memberPath +"dashboard-sessions", params, true)
      ),      
      providesTags: (result, error) => ['member'],      
    }),
    shareMember: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.shareMemberApiPath, params, true)
      ), 
      providesTags: (result, error) => ['member']
    }),
    getMemberRecentorder: builder.query<MemberRecentOrders[], any>({
      query: (memberId) => (
        prepareAPIQuery(api.baseUrl, api.recentMemberOrderApiPath + memberId, '', true)
      ),
      providesTags: (result, error) => ['member']
    }),
    memberStatus: builder.query<any,void>({
      query: () => (
        prepareAPIQuery(api.baseUrl, api.memberStatus, '', true)
      ),
      providesTags: (result, error) => [{type: 'member status'}]
    }),
    memberRecentOrders: builder.query<RecentOrdersMember[], any>({
      query: ({ id, ...memberPayload }) => (
        prepareAPIQuery(api.baseUrl, api.memberRecentOrders + id, memberPayload, true)
      ),      
      providesTags: (result, error) => [{ type: 'member' }],      
    }),
    downloadMemberExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/members/dashboard-report/?kpiTitle=' +
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
    memberLocations: builder.query<MemberCountries[], void>({
      query: () => prepareAPIQuery(api.baseUrl, api.memberPath + 'locations', '',true),      
    }),
  }),
});  

export const {
  useMembersQuery,
  useMemberQuery,
  useAddMemberMutation,
  useEditMemberMutation,
  useNameAutocompleteSearchQuery,
  useEmailAutocompleteSearchQuery,
  useMemberInvitationMutation,
  useCreatedByQuery,
  useMembersListWithoutAdminsQuery,
  useMemberDashboardQuery,
  useMemberDashboardRegByCountryQuery,
  useMemberDashboardRegRateQuery,
  useMemberDashboardTotalVisitorsQuery,
  useMemberDashboardAvgVisitorsGrowthQuery,
  useMemberDashboardSessionsQuery,
  useMemberDashboardWorldReachQuery,
  useShareMemberQuery,
  useGetMemberRecentorderQuery,
  useMemberStatusQuery,
  useMemberRecentOrdersQuery,
  useDownloadMemberExcelFileQuery,
  useMemberLocationsQuery
} = apiWithMembers;