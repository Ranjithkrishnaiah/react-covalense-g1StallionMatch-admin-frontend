const StallionColumnData: any = [
  { id: 1, name: 'Stallion', value: 'horseName' },
  { id: 5, name: 'Country', value: 'countryName' },
  { id: 2, name: 'Farms', value: 'farmName' },
  { id: 11, name: 'Service Fee', value: 'fee' },
  { id: 3, name: 'Last Updated', value: 'last_updated' },
  { id: 4, name: 'Promoted', value: 'isPromoted' },        
  { id: 6, name: 'Active', value: 'isActive' },
];

const FarmColumnData: any = [
  { id: 1, name: 'Name', value: 'farmName' },
  { id: 5, name: 'Country', value: 'countryName' },
  { id: 2, name: 'State', value: 'stateName' },
  { id: 11, name: 'Total Stallions', value: 'totalStallions' },
  { id: 3, name: 'Promoted', value: 'promoted' },
  { id: 4, name: '# Users', value: 'users' },        
  { id: 6, name: 'Last Active', value: 'createdOn' },
];

const MemberColumnData: any = [
  { id: 1, name: 'Name', value: 'fullName' },
  { id: 5, name: 'Email', value: 'emailAddress' },
  { id: 5, name: 'Country', value: 'countryCode' },
  { id: 2, name: 'Member Since', value: 'memberSince' },
  { id: 11, name: 'Last Active', value: 'lastActive' },
  { id: 3, name: 'Access Level', value: 'roleName' },
  { id: 4, name: 'Verified', value: 'isVerified' },   
];

const RunnerColumnData: any = [
  { id: 1, name: 'Date', value: 'raceDate' },
  { id: 2, name: 'Name', value: 'name' },
  { id: 3, name: 'Race #', value: 'id' },
  { id: 4, name: 'Class', value: 'class' },
  { id: 5, name: 'Horse', value: 'horseName' },
  { id: 6, name: 'Sire', value: 'sireName' },        
  { id: 7, name: 'Dam', value: 'damName' },
  { id: 7, name: 'Position', value: 'position' },
  { id: 7, name: 'Accuracy', value: 'accuracy' },
];

const RaceColumnData: any = [

  { id: 1, name: 'Race ID', value: 'raceId' },
  { id: 2, name: 'Race #', value: 'id' },
  { id: 2, name: 'Venue', value: 'venue' },  
  { id: 4, name: 'Country', value: 'country' },
  { id: 5, name: 'Name', value: 'displayName' },
  { id: 4, name: 'Class', value: 'class' },
  { id: 6, name: 'Track Type', value: 'trackType' },        
  { id: 7, name: 'Race Status', value: 'status' },
  { id: 7, name: 'Runners', value: 'runners' },
  { id: 7, name: 'Eligible', value: 'imported' },
  { id: 7, name: 'Date', value: 'raceDate' },
];

const NotificationColumnData: any = [
  { id: 1, name: 'Date', value: 'dateCreated' },
  { id: 2, name: 'Title', value: 'notificationTitle' },
  { id: 2, name: 'Message', value: 'messageText' },  
  { id: 4, name: 'Link', value: 'linkName' },
  { id: 5, name: 'Read', value: 'readNotification' },
];

const SaleColumnData: any = [
  { id: 1, name: 'Sale ID', value: 'id' },
  { id: 2, name: 'Sale Name', value: 'salesName' },
  { id: 3, name: 'Company', value: 'salesCompanyId' },  
  { id: 4, name: 'Country', value: 'countryId' },
  { id: 5, name: 'Lots', value: 'Lots' },
  { id: 6, name: 'Start Date', value: 'StartDate' },  
  { id: 7, name: 'Verified', value: 'Verified' },
  { id: 8, name: 'Status', value: 'Status' },
];

const ProductColumnData: any = [
  { id: 1, name: 'ID', value: 'id' },
  { id: 2, name: 'Name', value: 'productName' },
  { id: 3, name: 'Category', value: 'categoryName' },  
  { id: 4, name: 'MRR', value: 'MRR' },
  { id: 5, name: 'Created', value: 'created' },
  { id: 6, name: 'Updated', value: 'updated' },  
  { id: 7, name: 'Active', value: 'active' },
];

const PromocodeColumnData: any = [
  { id: 1, name: 'ID', value: 'id' },
  { id: 2, name: 'Name', value: 'promoCodeName' },
  { id: 3, name: 'Code', value: 'promoCode' },  
  { id: 4, name: 'Terms', value: 'discountType' },
  { id: 5, name: 'Redemptions', value: 'redemtions' },
  { id: 6, name: 'Created', value: 'createdOn' }, 
  { id: 7, name: 'Expires', value: 'endDate' }, 
  { id: 7, name: 'Active', value: 'isActive' },
];

export const SettingConstants = {
  DefaultStallionColumns : StallionColumnData,
  DefaultFarmColumns : FarmColumnData,
  DefaultMemberColumns : MemberColumnData,
  DefaultRunnerColumns : RunnerColumnData,
  DefaultRaceColumns : RaceColumnData,
  DefaultNotificationColumns : NotificationColumnData,
  DefaultSaleColumns : SaleColumnData,
  DefaultProductColumns : ProductColumnData,
  DefaultPromocodeColumns : PromocodeColumnData
}