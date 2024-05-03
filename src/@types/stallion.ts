// ----------------------------------------------------------------------
export type PromotedStatus = 'yes' | 'no';

export type ActiveStatus = 'yes' | 'no';

export type Stallion = {
    id: any;
    name: string;
    horseName: string;
    countryName: string;
    farmName: string;
    serviceFee: number;
    lastUpdated: Date | string | number;
    promoted: string;
    status: string;
    country:string;
    state:string;
    currency:string;
    yearToStud: number;
    yearToRetired: number;
    avatarUrl: string;
    stallionId: string;
    url: string;
    image: string;
    yob: number;
    colourName: string;
    currencyCode: string;
    fee: number;
    stateName: string;
    isPromoted: boolean;
    isActive: boolean;
    countryId: number;
    stateId: number;
    horseId: string;
    farmId: string;
    currencyId: number;
    serviceFeeYear: number;
    serviceFeeStatus: number;
    height: number;
    feeYear: number;
    startDate: string;
    reasonId: number;
    isPrivateFee: boolean;
    stallionName: string;
    last_updated: string;
    userName: string;
    currencySymbol: string;
};

export type StallionState = {
    isLoading: boolean;
    error: Error | string | null;
    stallions: Stallion[];
    stallion: Stallion | null;
    sortBy: string | null;
    filters: {
      stallion: string[];
      farm: string[];
      promotedStatus: string[];
      status: string[];
      country: string[];
      state: string[];
      serviceFee: string;
      includePrivateFee: string;
      feeStatus: string[];
    };
  };
  
  export type StallionFilter = {
      stallion: string[];
      farm: string;
      promotedStatus: string[];
      status: string;
      country: string;
      state: string;
      serviceFee: string;
      includePrivateFee: string;
      feeStatus: string;
  };