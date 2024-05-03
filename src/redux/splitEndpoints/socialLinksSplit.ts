import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';
import { Sociallinks } from 'src/@types/sociallinks';

export const apiWithSociallinks = splitApi.injectEndpoints({
    endpoints: (build) => ({
        sociallinks: build.query<Sociallinks[], void>({
          query: (name: any) => prepareAPIQuery(api.baseUrl, api.socialLinksPath, '',true),
          providesTags: (result, error) => [{ type: 'SocialLinks' }],
        }),
        socialShare: build.query<Sociallinks[], void>({
          query: (name: any) => prepareAPIQuery(api.baseUrl, api.socialSharePath, '',true),
          providesTags: (result, error) => [{ type: 'SocialLinks' }],
        }),
    }),
  });
  
export const { useSociallinksQuery ,useSocialShareQuery} = apiWithSociallinks;