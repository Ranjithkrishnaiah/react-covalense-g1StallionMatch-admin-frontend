export type Products = {
    id: any;
    farmName: string;
    countryId: number;
    countryCode: string;
    stateId: number;
    stateName: string;
    website: string;
    totalStallions: number;
    promoted: number;
    users: number;
    received: number;
    sent: number;
    lastActive: string;
    isActive: boolean;
    isPromoted: boolean;
    countryName: string;
    createdOn: string;
    image: string;
    avatarUrl: string;
	  product_productName: string;
	  product_id: string;
  };
  export type ProductLists = {
    id: number;
	  productName: string;
  };