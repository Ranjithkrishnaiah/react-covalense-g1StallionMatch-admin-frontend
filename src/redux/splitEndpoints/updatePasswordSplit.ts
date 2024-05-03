import { prepareAPIMutation } from "src/utils/customFunctions";
import { splitApi } from "../rootMiddleware";
import { api } from "src/api/apiPaths";

export const apiupdatePassword = splitApi.injectEndpoints({
    endpoints: (builder) =>({
        updatePasswordUser: builder.mutation<void, object>({
            query:(data:any)=>(prepareAPIMutation(api.baseUrl,api.updatePassword,'',"PATCH",data,true)),
            invalidatesTags: [{ type: 'user profile' }]
        })
    })
})

export const {useUpdatePasswordUserMutation} = apiupdatePassword