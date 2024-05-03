import { api } from "src/api/apiPaths";
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithProgenyTracker = splitApi.injectEndpoints({
    endpoints: (build) => ({
        progenyTracker: build.query<any, void>({
        query: () => prepareAPIQuery(api.baseUrl, api.progenyTrackerSR, '',true),
        providesTags: (result, error) => [{ type: 'progeny-tracker-sr' }],
      }),
    }),
  });

export const { useProgenyTrackerQuery } = apiWithProgenyTracker;