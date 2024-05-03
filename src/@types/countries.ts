export interface Countries {
    id: number;
    countryName: string;
}

export interface HorseCountries {
    countryId: number,
    countryName: string,
};

export interface FarmCountries {
    countryId: number,
    countryName: string,
};

export interface MemberCountries {
    countryId: number,
    countryName: string,
};

export interface StallionCountries {
    countryId: number,
    label: string,
    children: state[];
};

export interface state {
    countryId: number,
    stateId: number,
    label: string,
  };
