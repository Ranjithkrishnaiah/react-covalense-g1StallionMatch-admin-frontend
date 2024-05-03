// import { RawNodeDatum } from "react-d3-tree/lib/types/common";

// ----------------------------------------------------------------------
export type Horse = {
    id: string | number | any;
    horseId: string;
    horseUuid: string;
    horseName: string;
    name: string;
    yob: number | string;
    nationalityId: number;
    cob: number | string;
    colourId: number;
    gender: string;
    gelding: boolean;    
    breed: string;
    lockStatus: string;
    isThoroughbred: boolean | string;
    eligibilty: boolean;
    isActive: boolean;
    isLocked: boolean;
    isVerified: boolean;
    pedigreeId: string;
    generation: string;
    horsePedigrees: any;
    horseTypeId: number;
    pedigreeid: string;
    sex: string;
    geldingType: string;
    createdOn: string;
    countryName: string;
    pedigreeTreeLevel: number;
    totalPrizeMoneyEarned: number;
    currencyId: number;
    countryId: number;
    dob: string;
    missingYob: boolean;
    missingCob: boolean;
    unVerified: boolean;
    progeny: number;
    runner: number;
    stakes: number;
    breeding: string;
    userName: string;
    horseAlias: any;
    sireName: any;
    damName: any;
};

export type HorseForm = {
  totalPrizeMoneyEarned?: number;
  currencyId?: number;
  horseTypeId: number;
  gelding: boolean;
  sex: string;
  colourId: number;
  countryId: number;
  yob?: any;
  horseName: string;
  isLocked: true;
  id: string;
  dob?: string;
  generation?: number;
};

export type HorseState = {
  isLoading: boolean;
  error: Error | string | null;
  horses: Horse[];
  horse: Horse | null;
  sortBy: string | null;
  filters: {
    horse: string[];
    yob: string[];
    cob: string[];
    horseColor: string[];
    sex: string[];
    gelding: string[];
    type: string;
    status: string[];
    isThoroughbred: string; 
    level: number;
    pedigreeId: string; 
    horsePedigrees: any;    
  };
};

export type HorseFilter = {
  horse: string[];
  yob: string[];
  cob: string[];
  horseColor: string[];
  sex: string[];
  gelding: string[];    
  type: string;
  status: string[];
  isThoroughbred: string;
  level: number;
  pedigreeId: string;
  horsePedigrees: any;
};

export type horseAlias = {
  horseId: number;
  horseUuid: string;
  horseName: string;
  isActive: boolean;
  isDefault: boolean;
}

export type newHorse = {
  horseId: string;
  horseName: string;
  sex: string;
  yob: number;
  dob: string;
  countryId: number;
  colourId: number;
  gelding: boolean;
  isLocked: boolean;
  horseTypeId: number;
  cob: string;
  G1Tag: string;
  G1TagFull: string;
  isVerified: boolean;
  progenyId: string;
  legendColor: string;
  totalPrizeMoneyEarned: number;
  createdOn: string;
  verifiedBy: string;
  verifiedOn: string;
  modifiedBy: string;
  modifiedOn: string;
  createdBy: string;
  run: number;
  totalWin: number;
  group_1_wins: number;
  group_2_wins: number;
  group_3_wins: number;
  listedWins: number;
  eligibility: boolean;
  favouriteStallion: number;
  favBroodmareSire: number;
  myMares: number;
  profilePic: string;
}

export type pedigreeHorse = {
  tag: string;
  olduuid: string;
  newuuid: string;
  horseData: {
    horseId: string;
    horseName: string;
    sex: string;
    yob: number;
    dob: string;
    countryId: number;
    colourId: number;
    gelding: boolean;
    isLocked: boolean;
    horseTypeId: number;
    cob: string;
    G1Tag: string;
    G1TagFull: string;
    isVerified: boolean;
    progenyId: string;
    legendColor: string;
  }
}