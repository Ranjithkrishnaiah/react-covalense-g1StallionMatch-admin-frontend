import { api } from "src/api/apiPaths";
import { Countries } from 'src/@types/countries';
import { splitApi } from '../rootMiddleware';
import { prepareAPIQuery } from 'src/utils/customFunctions';

export const apiWithCountries = splitApi.injectEndpoints({
    endpoints: (build) => ({
        countries: build.query<Countries[], void>({
          query: () => prepareAPIQuery(api.baseUrl, api.countriesPath, '',true),
          providesTags: (result, error) => [{ type: 'Country' }],
        }),
        eligibleRaceCountries: build.query<Countries[], void>({
          query: () => prepareAPIQuery(api.baseUrl, api.eligibleRaceCountries, '',true),
          providesTags: (result, error) => [{ type: 'Country' }],
        }),
    }),
  });
  
  export const { useCountriesQuery,useEligibleRaceCountriesQuery } = apiWithCountries;
