import { createSlice } from '@reduxjs/toolkit';

const horseColumnDataMain = [
  {
    value: 'horseName',
    numeric: false,
    disablePadding: true,
    name: 'Horse',
  },
  {
    value: 'sex',
    numeric: false,
    disablePadding: true,
    name: 'Sex',
  },
  {
    value: 'yob',
    numeric: true,
    disablePadding: true,
    name: 'YOB',
  },
  {
    value: 'countryName',
    numeric: false,
    disablePadding: true,
    name: 'Country',
  },
  {
    value: 'breeding',
    numeric: false,
    disablePadding: true,
    name: 'Breeding',
  },
  {
    value: 'createdOn',
    numeric: false,
    disablePadding: true,
    name: 'Created',
  },
  {
    value: 'runner',
    numeric: false,
    disablePadding: true,
    name: 'Runner',
  },
  {
    value: 'stakes',
    numeric: false,
    disablePadding: true,
    name: 'Stakes',
  },
  {
    value: 'isVerified',
    numeric: false,
    disablePadding: true,
    name: 'Verified',
  },
  {
    value: 'progeny',
    numeric: false,
    disablePadding: true,
    name: 'Progeny',
  },
];

const initialState: any = {
  selectedFarmSettings: {
    defaultDisplay: 'horseName',
    defaultGeneration: 6,
    source: [],
    verifyStatus: '',
    breed: '',
    startDate: ''
  },
  selectedMessageSettings: {
    retainTrashPeriod: '',
    expirylength: 'none',
  },
  selectedReportsSettings: {
    defaultDisplayColumn: 'createdOn',
    sendFrom: 'none',
    replyTo: 'none',
    approvalAutomation: true,
    deliveryAutomation: true,
  },
  horseColumnData:[...horseColumnDataMain],
  horseGenerationData:[
    { id: 1, name: '1', value: 1 },
    { id: 2, name: '2', value: 2 },
    { id: 3, name: '3', value: 3 },
    { id: 4, name: '4', value: 4 },
    { id: 5, name: '5', value: 5 },
    { id: 6, name: '6', value: 6 },
  ],
  horseSourceData:[
    { id: 1, name: 'Internal', value: 'internal' },
    { id: 2, name: 'DB', value: 'db' },
  ],
  horseVerifiedStatusData:[
    { id: 1, name: 'Verified', value: 'verified' },
    { id: 2, name: 'Unverified', value: 'unverified' },
  ],
  horseBreedStatusData:[
    { id: 1, name: 'Breed1', value: 'breed1' },
    { id: 2, name: 'Breed2', value: 'bree2' },
  ],
  orderReportOpened: false,
  reportFilterOpened: false,

};

const slice = createSlice({
  name: 'filterSettings',
  initialState,
  reducers: {
    // START LOADING
    setFarmFilterSettings(state, action) {
      state.selectedFarmSettings = action.payload;
    },
    setMessageFilterSettings(state, action) {
      state.selectedMessageSettings = action.payload;
    },
    setSelectedReportsSettings(state, action) {
      state.selectedReportsSettings = action.payload;
    },
    setHorseColumnData(state, action) {
      state.horseColumnData = action.payload;
    },
    setHorseGenerationData(state, action) {
      state.horseGenerationData = action.payload;
    },
    setHorseSourceData(state, action) {
      state.horseSourceData = action.payload;
    },
    setHorseVerifiedStatusData(state, action) {
      state.horseVerifiedStatusData = action.payload;
    },
    setHorseBreedStatusData(state, action) {
      state.horseBreedStatusData = action.payload;
    },
    setOrderReportOpened(state, action) {
      state.orderReportOpened = action.payload;
    }, 
    setReportFilterOpened(state, action) {
      state.reportFilterOpened = action.payload;
    },
  },
});

export const {
  setReportFilterOpened,
  setOrderReportOpened,
  setFarmFilterSettings,
  setHorseColumnData,
  setHorseGenerationData,
  setHorseSourceData,
  setHorseVerifiedStatusData,
  setHorseBreedStatusData,
  setSelectedReportsSettings,
  setMessageFilterSettings
} = slice.actions;


export default slice;
