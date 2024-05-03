import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareHeaders, prepareAPIQuery, prepareAPIMutation } from "src/utils/customFunctions";

export const apiWithSaveMemberDetails = splitApi.injectEndpoints({
    endpoints: (builder) => ({        
        saveMemberDetails: builder.mutation<void, object>({
            query: (data: any) => (prepareAPIMutation(api.baseUrl, api.saveMembersDetails, '', 'PATCH', data, true)),
            invalidatesTags: ['systemActivity']
        }),
        updateAuthMeProfileImage: builder.mutation<void, object>({
            query: (data: any) => (prepareAPIMutation(api.baseUrl, api.saveMembersDetails + '/profile-image', '', 'PATCH', data, true)),
        }),
        authMeProfileImageUploadStatus: builder.mutation<any, any>({
            query: (mediauuid)  => (prepareAPIMutation(api.baseUrl, api.marketingUploadStatusApiPath, '', 'POST', mediauuid, true)),
        }),
        authMeProfileDetails: builder.query<any, void>({
            query: () => prepareAPIQuery(api.baseUrl, api.saveMembersDetails, '', true),
        }),
    }),
});

export const {
    useSaveMemberDetailsMutation,
    useUpdateAuthMeProfileImageMutation,
    useAuthMeProfileImageUploadStatusMutation,
    useAuthMeProfileDetailsQuery
} = apiWithSaveMemberDetails;