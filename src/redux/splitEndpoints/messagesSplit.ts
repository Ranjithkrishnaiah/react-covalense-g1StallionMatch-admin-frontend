import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation, prepareHeaders } from "src/utils/customFunctions";
const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
export const apiWithMessages = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    messages: builder.query<any, object>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath, params, true)
      ),      
      providesTags: (result, error) => [{ type: 'messages' }],      
    }),
    getUnreadMessagesType: builder.query<any, void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messagesUnreadCount, '', true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    updateMessageStatus: builder.mutation<{}, any>({
      query: ({ ...rest })  => (prepareAPIMutation(api.baseUrl, api.messagesApiPath, '', 'PATCH', rest, true)),
      invalidatesTags: ['messages']
    }),
    updateConversationStatus: builder.mutation<{}, any>({
      query: ({channelId, ...rest})  => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + '/read/' + channelId, '', 'PATCH', rest, true)),
      invalidatesTags: ['messages']
    }),
    deleteMessageConversation: builder.mutation<{}, any>({
      query: ({ ...rest })  => (prepareAPIMutation(api.baseUrl, api.messagesApiPath, '', 'DELETE', rest, true)),
      invalidatesTags: ['messages']
    }),
    getConversations: builder.query<any, string>({
      query: (id: any) => (
      prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + id, '', true)
      ),      
      providesTags: (result, error) => ['conversationMessage'],      
    }),
    postMessage: builder.mutation<{}, any>({
      query: (messagePayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath, '', 'POST', messagePayload, true)),
      invalidatesTags: ['conversationMessage']
    }),
    patchMessage: builder.mutation<{}, any>({
      query: (messagePayload)  => (prepareAPIMutation(api.baseUrl, api.messagesMedia, '', 'PATCH', messagePayload, true)),
      invalidatesTags: ['conversationMessage']
    }),
    postMessageAttachment: builder.mutation<{}, any>({
      query: (attachmentPayload) => (prepareAPIMutation(api.baseUrl, api.messagesMedia, '', 'POST', attachmentPayload, true)),
      invalidatesTags: ['conversationMessage']
    }),
    messageMediaUploadStatus: builder.mutation<{}, any>({
      query: (mediaPayload) => (prepareAPIMutation(api.baseUrl, api.mediaUploadStatusUrl, '', 'POST', mediaPayload, true)),
      invalidatesTags: ['conversationMessage']
    }),
    getFarmMembers: builder.query<any, any>({
      query: (farmId: any) => (
      prepareAPIQuery(api.baseUrl, api.farmPath + farmId + '/members' , '', true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    farmAutocompleteSearch: builder.query<any, any>({
      query: (params: any) => (
      prepareAPIQuery(api.baseUrl, api.farmPath + 'byName/' + params , '', true)
      ),      
      providesTags: (result, error) => ['farm'],      
    }),
    farmByUsers: builder.query<any, any>({
      query: (params: any) => (
      prepareAPIQuery(api.baseUrl, api.farmPath + 'searched-by-users/' + params , '', true)
      ),      
      providesTags: (result, error) => ['farm'],      
    }),
    stallionByUsers: builder.query<any, any>({
      query: (params: any) => (
      prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'searched-by-users/' + params , '', true)
      ),      
      providesTags: (result, error) => ['stallions'],      
    }),
    postFarmIds: builder.mutation<{}, any>({
      query: (farmIdsPayload) => (prepareAPIMutation(api.baseUrl, api.farmPath + 'by-farms', '', 'POST', farmIdsPayload, true)),
      // invalidatesTags: ['conversationMessage']
    }),
    postLocationIds: builder.mutation<{}, any>({
      query: (locationIdsPayload) => (prepareAPIMutation(api.baseUrl, api.farmPath + 'by-locations', '', 'POST', locationIdsPayload, true)),
      // invalidatesTags: ['conversationMessage']
    }),
    postLocalBoostIds: builder.mutation<{}, any>({
      query: (localBoostIdsPayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + '/' + api.localBoost + '/' + 'recipients-countries', '', 'POST', localBoostIdsPayload, true)),
      // invalidatesTags: ['conversationMessage']
    }),
    postBroadcast: builder.mutation<{}, any>({
      query: (broadcastPayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + '/broadcast', '', 'POST', broadcastPayload, true)),
      invalidatesTags: ['messages']
    }),
    postLocalBoost: builder.mutation<{}, any>({
      query: (localBoostPayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + '/' + api.localBoost, '', 'POST', localBoostPayload, true)),
      invalidatesTags: ['messages']
    }),
    messageDashboard: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messageDashboardPath, params, true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    mostMentionedStallions: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messageDashboardPath + '/' + 'most-mentioned-stallions', params, true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    mostEngagedUsers: builder.query<any, any>({
      query: (params) => (
      prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messageDashboardPath + '/' + 'most-engaged-users', params, true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    msgCountGraphData: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messageDashboardPath + '/' + 'msg-count-graph', params, true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    conversationBreakdownGraph: builder.query<any, any>({
      query: (params) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath + '/' + api.messageDashboardPath + '/' + 'conversation-breakdown', params, true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    messagesJson: builder.query<any, void>({
      query: () => (
      prepareAPIQuery(api.baseUrl, api.messagesApiPath, '', true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    message: builder.query<any, string>({
      query: (id: any) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath + id, '', true)
      ),      
      providesTags: (result, error) => ['messages'],      
    }),
    addMessage: builder.mutation<{}, any>({
      query: (messagePayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath, '', 'POST', messagePayload, true)),
      invalidatesTags: ['messages']
    }),
    editMessage: builder.mutation<{}, any>({
      query: ({ id, ...messagePayload })  => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + id, '', 'PATCH', messagePayload, true)),
      invalidatesTags: ['messages']
    }),
    addBoost: builder.mutation<{}, any>({
      query: (boostPayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath, '', 'POST', boostPayload, true)),
      invalidatesTags: ['messages']
    }),
    editBoost: builder.mutation<{}, any>({
      query: ({ id, ...boostPayload }) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + id, '', 'PATCH', boostPayload, true)),
      invalidatesTags: ['messages']
    }),
    shareMessages: builder.query<any, any>({
      query: (params: any) => (
        prepareAPIQuery(api.baseUrl, api.messagesApiPath + api.shareMessagesApiPath, params, true)
      ), 
      providesTags: (result, error) => [{ type: 'messages' }],
    }),
    damSireByMare: builder.query<any, any>({
      query: (name: any) => (
        prepareAPIQuery(api.baseUrl, api.stallionApiPath + 'dam-sire-searched-bymare?damSireName=' + name, '', true)
      ), 
    }),
    postLocalSearchByUsers: builder.mutation<{}, any>({
      query: (localSearchByUsersPayload) => (prepareAPIMutation(api.baseUrl, api.stallionApiPath + 'searched-by-users', '', 'POST', localSearchByUsersPayload, true)),
      // invalidatesTags: ['messages'],
    }),
    postExtendedBoost: builder.mutation<{}, any>({
      query: (localSearchByUsersPayload) => (prepareAPIMutation(api.baseUrl, api.messagesApiPath + '/' + api.extendedBoost, '', 'POST', localSearchByUsersPayload, true)),
      invalidatesTags: ['messages'],
    }),
    downloadMessagingExcelFile: builder.query({
      queryFn: async ({ setupId, name }, api, extraOptions, baseQuery) => {
        const result: any = await baseQuery({
          url:BaseAPI + '/v1' + 
            '/messages/dashboard-report/?kpiTitle=' +
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
  useMessagesQuery,
  useGetUnreadMessagesTypeQuery,
  useDeleteMessageConversationMutation,
  useUpdateMessageStatusMutation,
  useUpdateConversationStatusMutation,
  useGetConversationsQuery,
  usePostMessageMutation,
  usePatchMessageMutation,
  usePostMessageAttachmentMutation,
  useMessageMediaUploadStatusMutation,
  useGetFarmMembersQuery,
  useFarmAutocompleteSearchQuery,
  useFarmByUsersQuery,
  useStallionByUsersQuery,
  usePostFarmIdsMutation,
  usePostLocationIdsMutation,
  usePostLocalBoostIdsMutation,
  usePostBroadcastMutation,
  usePostLocalBoostMutation,
  useMessageDashboardQuery,
  useMostMentionedStallionsQuery,
  useMostEngagedUsersQuery,
  useMsgCountGraphDataQuery,
  useConversationBreakdownGraphQuery,
  //json server
  useMessagesJsonQuery,
  useMessageQuery,
  useAddMessageMutation,
  useEditMessageMutation,
  useAddBoostMutation,
  useEditBoostMutation,
  useShareMessagesQuery,
  usePostLocalSearchByUsersMutation,
  useDamSireByMareQuery,
  usePostExtendedBoostMutation,
  useDownloadMessagingExcelFileQuery
} = apiWithMessages;