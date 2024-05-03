import { api } from "src/api/apiPaths";
import { HorseTypes } from 'src/@types/horsetypes';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery, prepareAPIMutation } from 'src/utils/customFunctions';

export const apiWithMediaUplode = splitApi.injectEndpoints({
    endpoints: (build) => ({
        userImageUpload: build.mutation<void,object>({
            query: (data) => (prepareAPIMutation(api.baseUrl, api.userProfileImageUpload, '', 'POST', data, true)),            
        })
    }),
})

export const { useUserImageUploadMutation } = apiWithMediaUplode;