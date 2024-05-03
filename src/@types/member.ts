// export type Member = {
//     id: any;
//     image: string;
//     fullName: string;
//     email: string;
//     businessName: string;
//     address: string;
//     country: string;
//     mobile: string;
//     farm: string;
//     paymentMethod: string;
//     card: string;
//     expiry: string;
//     isEmail: string;
//     isSms: string;
//     isPromotional: string;
//     profileDetails: profileDetails[];
//     accountDetails: accountDetails[];
//     notifications: notifications[];
//     orderHistory: orderHistory[];
// };
export interface stallion  {
  stallionId: string,
  yearToStud: number,
  yearToRetired: number,
  horseName: string,
  yob: number,
  countryName:string,
};

export interface farmsType {
  farmId: string,
  farmName: string,
  countryName: string,
};

export type Member = {
  id: any;
  fullName: string;
  email: string;
  country: string;
  address: string;
  verifiedAccount: boolean;
  sso: boolean;
  status: boolean;
  socialLinkId: number;
  paymentMethodId: number;
  preferenceCentre: string;
  linkedFarms: string;
  myMares: string;
  horse: stallion[];
  horseMultiple: stallion[];
  broodmareSires: string;
  farmsMultiple: farmsType[];
  farms:farmsType[];
  recentOrders: string;
  emailAddress: string;
  countryCode: string;
  memberSince: string; 
  lastActive: string; 
  roleName: string;
  isVerified: boolean;
  accessLevelId: number;
  statusId: number;
  countryId: number;
  roleId: number;
  preferedCenter: string;
  memberUuid: string;
  memberId: number;
  accessLevel: number;
};


export type profileDetails = {
    image: string;
    fullName: string;
    email: string;
    businessName: string;
    address: string;
    country: string;
    mobile: string;
    farm: string;
  };

  export type accountDetails = {
    paymentMethod: string;
    card: string;
    expiry: string;
  };

  export type notifications = {
    email: boolean;
    sms: boolean;
    promotional: boolean;
  };

  export type orderHistory = {
    orderId: string;
    type: string;
    details: string;
    price: string;
    status: string;
    invoiceLink: string;
    orderDate: string;
  };

  export type CreatedBy = {
    id: any;
    fullName: any;
  }

  export type MemberRecentOrders = {
    productId: number;
    orderId: number;
    productName: string;
  };

  export type RecentOrdersMember = {
    orderId: number;
    reportLink: string;
    reportName: string;
  };