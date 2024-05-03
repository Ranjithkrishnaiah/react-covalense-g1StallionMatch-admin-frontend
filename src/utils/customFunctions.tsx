import React from 'react';
import { isFuture, isSameDay, isSameMonth, sub, add, formatDistance } from 'date-fns';
import { SxProps, Theme } from '@mui/material/styles';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import format from 'date-fns/format';
import { text } from 'node:stream/consumers';
import { Typography } from '@mui/material';
// import { fromPairs } from 'lodash';

/** This folder contains functions that could be reused accross multiple modules
 * Any new function added to this folder must be listed in the comment below by
 * describing its functionality in a single line while the detailed description
 * must be provided above the function before writing the function definition.
 *
 * List
 *
 * 1. makeObjectArrayFromArrays: Generate Object Array from 2 given arrays
 */

//This allows to build one-to-one mapping between between related variables brought from different locations
export const makeObjectArrayFromArrays = (arr1: string[], arr2: any[]) => {
  if (arr1.length !== arr2.length) {
    // console.log('Arrays must be of same length');
    return;
  } else {
    let CombinedArrayOfObjects = [];
    for (let i: number = 0; i < arr1.length; i++) {
      let obj = new Object({ [arr1[i]]: arr2[i] });
      CombinedArrayOfObjects.push(obj);
    }
    return CombinedArrayOfObjects;
  }
};

//functionName, reducerPath, baseUrl, tagType are strings
//callTypes is an object with specific parameters
/**
 * callTypes = {
 *  getMethod: {
 *  name: countries
 *  getResponseType: responseType,
 *  getRequestType: requestType,
 *  getUrl: api.countriesUrl,
 * }
 *
 * }
 */

type GetMethodsObject = {
  name: string | number | symbol;
  params: any;
  Url: string;
  cachePeriod: number;
};

type PostMethodObject = {
  name: string | number | symbol;
  body: object;
  method: 'POST' | 'PUT' | 'DELETE' | undefined;
  Url: string;
};

type GetFunctionObject = {
  reducerPath: string;
  baseUrl: string;
  providerTag: string;
  queryType: GetMethodsObject;
  invalidateTag: string;
  mutationType: PostMethodObject;
};

// type PostFunctionObject = {
//   reducerPath: string;
//   baseUrl: string;
//   invalidateTag: string;
//   mutationType: PostMethodObject;
// };

export const reduxRtkHOF = ({
  reducerPath,
  baseUrl,
  providerTag,
  queryType,
  invalidateTag,
  mutationType,
}: GetFunctionObject) => {
  const getURL = queryType.Url;
  const getParams = queryType.params;
  return createApi({
    reducerPath: reducerPath,
    baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
    tagTypes: [providerTag || invalidateTag],
    endpoints: (build) => ({
      [queryType.name]: build.query<any, void>({
        query: () => ({
          url: getURL,
          params: getParams,
        }),
        keepUnusedDataFor: queryType.cachePeriod, //Keeps country data valid for an year
        providesTags: (result, error) => [{ type: providerTag }],
      }),
      [mutationType.name]: build.mutation<any, void>({
        query: (body) => ({
          url: mutationType.Url,
          method: mutationType.method,
          body: body,
        }),

        invalidatesTags: [invalidateTag],
      }),
    }),
  });
};

// export const reduxRtkMutationHOF = ({ reducerPath, baseUrl, invalidateTag, mutationType}: PostFunctionObject) => {

//     return  createApi({
//             reducerPath: reducerPath,
//             baseQuery: fetchBaseQuery({ baseUrl: baseUrl}),
//             tagTypes: [invalidateTag],
//             endpoints: (build) => ({
//                  [mutationType.name]: build.mutation<any,void>({
//                     query: body => ({
//                         url: mutationType.Url,
//                         method: mutationType.method,
//                         body: body
//                     }),

//                     invalidatesTags: [invalidateTag]
//                 })
//             })
//         })
// }

// createApi({
//     reducerPath: "countriesApi",
//     baseQuery: fetchBaseQuery({ baseUrl: api.baseUrl}),
//     tagTypes: ['Country'],
//     endpoints: (build) => ({
//         countries: build.query<Countries[],void>({
//             query: () => api.countriesUrl,
//             keepUnusedDataFor: 60*60*24*365, //Keeps country data valid for an year
//             providesTags: (result, error) => [{type: 'Country'}],
//         })
//     })
// })

// export const { useCountriesQuery } = countriesApi;

//scrols to the top of the screen
export const scrollToTop = () => {
  setTimeout(() => {
    window.scrollTo(1, 0);
  }, 500);
};

export const dataGridTableStyles = (
  tableIdentifier: string,
  index: number | undefined,
  lastColumn: number
) => {
  //======== This is Specific Styling corresponding to data of different Grid Tables=====
  const notLastRowCondition = typeof index === 'number' && index < lastColumn - 1;

  const indexzero: SxProps<Theme> | undefined = {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1rem',
  };

  const lastIndex: SxProps<Theme> | undefined = {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const mareListsLastIndex: SxProps<Theme> | undefined = {
    display: 'block',
    width: '40px',
  };

  const secondIndex: SxProps<Theme> | undefined = {
    paddingRight: '5px',
  };

  const mareListsFirstIndex: SxProps<Theme> | undefined = {
    display: 'block',
    marginRight: '-3px',
  };

  const commonForList: SxProps<Theme> | undefined = {
    display: 'flex',
    alignItems: 'center',
    background: '#F4F1EF',
  };

  const listLastColumnCell: SxProps<Theme> | undefined = {
    justifyContent: 'center',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
  };

  const listFirstColumnCell: SxProps<Theme> | undefined = {
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
  };

  const rowSx: SxProps<Theme> | undefined = {
    display: 'flex',
    borderRadius: '8px',
    background: '#F4F1EF',
    padding: '0.5%',
    justifyContent: 'space-between',
  };

  const MareListIndexZero: SxProps<Theme> | undefined = {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1rem',
    fontSize: '16px',
    color: '#161716 ',
    fontFamily: 'Synthese-Regular',
    letterSpacing: '-0.01em',
  };

  switch (tableIdentifier) {
    case 'DASHBOARD':
      return {
        lg: index === 0 ? 4 : 2,
        xs: index === 0 ? 4 : 2,
        sx: index === 0 ? indexzero : index === lastColumn - 1 ? lastIndex : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        columnRowClassName: 'List-title',
      };

    case 'STALLION_SIRE DASHBOARD':
      return {
        lg: index === 0 ? 5 : index !== 4 ? 2 : 1,
        xs: index === 0 ? 5 : index !== 4 ? 2 : 1,
        sx: index === 0 ? indexzero : index === lastColumn - 1 ? lastIndex : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        columnRowClassName: 'List-title',
      };

    case 'LIST':
      return {
        lg: index === 0 ? 4 : 2,
        xs: index === 0 ? 4 : 2,
        sx:
          index === 0
            ? { ...commonForList, ...indexzero, ...listFirstColumnCell }
            : index === lastColumn - 1
            ? { ...commonForList, ...listLastColumnCell }
            : commonForList,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        // rowSx: rowSx,
        columnRowClassName: 'SPracerecord',
      };

    case 'STALLION_PAGE':
      return {
        lg: 2,
        xs: 2,
        sx: index === 0 ? { paddingLeft: 2 } : undefined,
        className: index === lastColumn - 1 ? 'SPracerecordTotal' : 'SPracerecordCount',
        notLastColumn: true,
        columnRowClassName: 'SPracerecord',
      };
    case 'PROGENY':
      return {
        lg: 2,
        xs: 2,
        sx: index === 0 ? { paddingLeft: 2 } : undefined,
        className: 'SPracerecordCount',
        notLastColumn: true,
        columnRowClassName: 'SPracerecord',
      };
    case 'FD-USERLIST':
      return {
        lg: index === 0 ? 4 : 2,
        xs: index === 0 ? 4 : 2,
        sx: index === 0 ? indexzero : index === lastColumn - 1 ? lastIndex : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        rowSx: rowSx,
        columnRowClassName: 'SPracerecord',
      };
    case 'MY-STALLIONS':
      return {
        lg: index === 0 ? 3 : index !== lastColumn - 1 ? 2 : 1,
        xs: index === 0 ? 3 : index !== lastColumn - 1 ? 2 : 1,
        sx:
          index === 0
            ? { ...commonForList, ...indexzero, ...listFirstColumnCell }
            : index === lastColumn - 1
            ? { ...commonForList, ...listLastColumnCell }
            : commonForList,
        className: 'List-content ',
        notLastColumn: notLastRowCondition,
        rowSx: rowSx,
        columnRowClassName: 'SPracerecord listTablehead',
      };
    case 'LIST-USERLIST':
      return {
        lg: index === 1 ? 4 : 2,
        xs: index === 1 ? 4 : 2,
        sx:
          index === 1
            ? { ...commonForList, ...indexzero, ...listFirstColumnCell }
            : index === lastColumn - 1
            ? { ...commonForList, ...listLastColumnCell }
            : commonForList,
        className: 'List-content user-list-table-wrp',
        notLastColumn: notLastRowCondition,
        rowSx: rowSx,
        columnRowClassName: 'SPracerecord',
      };
    case 'EMPTY-COLUMN-NAMES-DASHBOARD':
      return {
        lg: index === 0 ? 10 : 2,
        xs: index === 0 ? 10 : 2,
        sx: index === 0 ? indexzero : index === lastColumn - 1 ? lastIndex : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        columnRowClassName: 'List-border',
      };
    case 'EMPTY-COLUMN-NAMES-DASHBOARD-REPORTS-ORDERED':
      return {
        lg: index === 0 ? 10 : 2,
        xs: index === 0 ? 10 : 2,
        sx: index === 0 ? indexzero : index === lastColumn - 1 ? lastIndex : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
        columnRowClassName: 'List-border',
      };
    case 'EMPTY-COLUMN-NAME-LIST':
      return {
        lg: index === 0 ? 4 : 2,
        xs: index === 0 ? 4 : 2,
        sx:
          index === 0
            ? { ...commonForList, ...indexzero, ...listFirstColumnCell }
            : index === lastColumn - 1
            ? { ...commonForList, ...listLastColumnCell }
            : commonForList,
        className: 'List-content mare-list-table-wrp',
        notLastColumn: notLastRowCondition,
        rowSx: rowSx,
        columnRowClassName: 'List-border',
      };
    case 'RECENT-SEARCHES-DASHBOARD':
      return {
        lg: index === 0 ? 6 : 3,
        xs: index === 0 ? 6 : 3,
        sx: index === 0 ? indexzero : undefined,
        className: 'List-content',
        notLastColumn: true,
        columnRowClassName: 'List-border',
      };
    case 'EMPTY-COLUMN-NAMES-DASHBOARD-MARELISTS':
      return {
        lg: index === 0 ? 6 : 2,
        xs: index === 0 ? 6 : 2,
        sx:
          index === 0
            ? MareListIndexZero
            : index === 1
            ? mareListsFirstIndex
            : index === lastColumn - 1
            ? mareListsLastIndex
            : index === 2
            ? secondIndex
            : undefined,
        className: 'List-content',
        notLastColumn: notLastRowCondition,
      };
    case 'EMPTY-COLUMN-NAMES-MARE-LIST':
      return {
        lg: index === 0 ? 4 : 2,
        xs: index === 0 ? 4 : 2,
        sx:
          index === 0
            ? { ...commonForList, ...indexzero, ...listFirstColumnCell }
            : index === lastColumn - 1
            ? { ...commonForList, ...listLastColumnCell }
            : commonForList,
        className: 'List-content mare-list-table-wrp',
        notLastColumn: notLastRowCondition,
        rowSx: rowSx,
        columnRowClassName: 'List-border',
      };
  }
};

export const tableStyles = () => {};

export const timer = (eventUTCTimeStamp: number) => {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const localTime = Date.now() - new Date().getTimezoneOffset() * 60 * 1000;
  const timeDifference = localTime - eventUTCTimeStamp;

  const showPeriod = (difference: number) => {
    let output = null;

    if (difference / DAY >= 1 && difference / WEEK < 1) {
      output =
        Math.floor(difference / DAY) === 1
          ? '1 day ago'
          : Math.floor(difference / DAY) + ' days ago';
    } else if (difference / DAY >= 7 && difference / DAY < 30) {
      output =
        Math.floor(difference / WEEK) === 1
          ? '1 week ago'
          : Math.floor(difference / WEEK) + 'weeks ago';
    } else if (difference / MONTH >= 1 && difference / MONTH < 12) {
      output =
        Math.floor(difference / MONTH) === 1
          ? '1 month ago'
          : Math.floor(difference / MONTH) + ' months ago';
    } else if (difference / MONTH >= 12) {
      output =
        Math.floor(difference / YEAR) === 1
          ? '1 year ago'
          : Math.floor(difference / YEAR) + ' years ago';
      // console.log('D: ', Math.floor(difference / YEAR), output);
    } else if (difference / DAY < 1) {
      if (difference / HOUR >= 1) {
        output =
          Math.floor(difference / HOUR) === 1
            ? '1 hour ago'
            : Math.floor(difference / HOUR) + ' hours ago';
      } else if (difference / MINUTE >= 1) {
        output =
          Math.floor(difference / MINUTE) === 1
            ? '1 minute ago'
            : Math.floor(difference / MINUTE) + ' minutes ago';
      } else output = 'Just Now';
    }
    return output;
  };
  return showPeriod(timeDifference);

  // console.log("LO: ", localTime, localTime - eventUTCTimeStamp)
};
type DateRange = [number | null, number | null];
export function useDatePicker({ date }: { date: DateRange }) {
  const [dueDate, setDueDate] = React.useState<DateRange>([date[0], date[1]]);
  const [openPicker, setOpenPicker] = React.useState(false);
  const startTime = dueDate[0] || '';
  const endTime = dueDate[1] || '';

  const isSameDays = isSameDay(new Date(startTime), new Date(endTime));
  const isSameMonths = isSameMonth(new Date(startTime), new Date(endTime));

  const handleChangeDueDate: any = (newValue: DateRange) => {
    setDueDate(newValue);
  };

  const handleOpenPicker = () => {
    setOpenPicker(true);
  };

  const handleClosePicker = () => {
    setOpenPicker(false);
  };

  return {
    dueDate,
    startTime,
    endTime,
    isSameDays,
    isSameMonths,
    onChangeDueDate: handleChangeDueDate,
    openPicker,
    onOpenPicker: handleOpenPicker,
    onClosePicker: handleClosePicker,
  };
}

// const result = timer(Date.now() - new Date().getTimezoneOffset()*60*1000-15*31*24*60*60*1000);

export function prepareHeaders() {
  const accessToken = localStorage.getItem('accessToken');
  return { Authorization: `Bearer ${accessToken}` };
}

// Return query param value by query string name
export function getQueryParameterByName(name: any) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Prepare API Query for RTK
export function prepareAPIQuery(
  apiUrl: any,
  apiName: any,
  params: any,
  isAuthTokenRequired = false
) {
  const queryParams: any = {
    url: `${apiUrl}${apiName}`,
    params: params,
  };
  if (isAuthTokenRequired) {
    queryParams.headers = prepareHeaders();
  }
  return queryParams;
}

// Prepare API Mutation for RTK
export function prepareAPIMutation(
  apiUrl: any,
  apiName: any,
  params: any,
  method: any,
  payload = {},
  isAuthTokenRequired = false
) {
  const queryParams: any = {
    url: `${apiUrl}${apiName}`,
    params: params,
    method: method,
    body: payload,
  };
  if (isAuthTokenRequired) {
    queryParams.headers = prepareHeaders();
  }
  return queryParams;
}

//Converting date to required format
export const dateConvert: any = (str: any) => {
  if (str) {
    const result = format(new Date(str), 'yyyyMMdd');
    return result;
  }

  // var date = new Date(str),
  //   mnth = ("0" + (date.getMonth() + 1)).slice(-2),
  //   day = ("0" + date.getDate()).slice(-2);
  // return [day,mnth,date.getFullYear()].join("-");
};

//Converting date to required format
export const dateConvertHypen: any = (str: any) => {
  if (str) {
    const result = format(new Date(str), 'dd/MM/yyyy');
    return result;
  }
};

export const dateHypenConvert: any = (str: any) => {
  if (str) {
    const result = format(new Date(str), 'yyyy-MM-dd');
    return result;
  }
};

export const yearOnlyConvert: any = (str: any) => {
  if (str) {
    const result = format(new Date(str), 'yyyy');
    return result;
  }
};

export function parseDateAsDotFormat(dateToParse: string) {
  let parsedDate = new Date(dateToParse);
  const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
    parsedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${parsedDate.getFullYear()}`;
  return formattedDate;
}

export function getAccessTokenFromLocalStorage() {
  return localStorage.getItem('accessToken');
}

export const dateConvertDisplay: any = (str: any, isDotted = false) => {
  if (isDotted) {
    const result = format(new Date(str), 'dd.MM.yyyy');
    return result;
  }

  const result = format(new Date(str), 'dd-MM-yyyy');
  return result;
  // var date = new Date(str),
  //   mnth = ("0" + (date.getMonth() + 1)).slice(-2),
  //   day = ("0" + date.getDate()).slice(-2);
  // return [day,mnth,date.getFullYear()].join("-");
};

export const timeToDateConvert: any = (str: any) => {
  const result = format(new Date(str), 'dd/MM/yy');
  return result;
};

export function getLastWeek() {
  let lastWeek = sub(new Date(), {
    weeks: 1,
  });
  return lastWeek;
}

export function getNextWeek() {
  let lastWeek = add(new Date(), {
    weeks: 1,
  });
  return lastWeek;
}

export function currentDate() {
  let today = format(new Date(), 'yyyyMMdd');
  return today;
}

export function isToday(value: any) {
  let today = format(new Date(), 'dd-MM-yyyy') === format(new Date(value), 'dd-MM-yyyy');
  return today;
}

export function isStartDateInFuture(value: any) {
  let result = isFuture(new Date(value));
  return result;
}

export function getLastFourWeek() {
  let result = sub(new Date(), {
    weeks: 4.3481,
  });
  return result;
}
export function getLast3Months() {
  let result = sub(new Date(), {
    weeks: 13.0444,
  });
  return result;
}
export function getLast6Months() {
  let result = sub(new Date(), {
    weeks: 26.0888,
  });
  return result;
}
export function getLastYear() {
  let result = sub(new Date(), {
    weeks: 52.1775,
  });
  return result;
}

export function getLastFromDate(value: any) {
  const today = new Date();
  let weekVal = 4;
  switch (value) {
    case 'lastweek':
      weekVal = 1;
      break;
    case 'lastmonth':
      weekVal = 4;
      break;
    case 'last3months':
      weekVal = 13;
      break;
    case 'last6months':
      weekVal = 26;
      break;
    case 'lastyear':
      weekVal = 52;
      break;
    default:
      weekVal = 1;
      break;
  }
  let result =
    value === 'today'
      ? today
      : sub(new Date(), {
          weeks: weekVal,
        });
  return result;
}

export function getOPtionText(value: string) {
  let result = '';
  switch (value) {
    case 'lastweek':
      result = 'last week';
      break;
    case 'lastmonth':
      result = 'last month';
      break;
    case 'last3months':
      result = 'last 3 months';
      break;
    case 'last6months':
      result = 'last 6 months';
      break;
    case 'lastyear':
      result = 'last year';
      break;
    case 'thisyear':
      result = 'this year';
      break;  
    case 'custom':
      result = 'earlier';
      break;
    case 'today':
      result = 'today';
      break;
    case 'last7days':
      result = 'last 7 days';
      break;
    case 'last12months':
      result = 'last 12 months';
      break;
    case 'monthToDate':
      result = 'month to date';
      break;
    case 'quarterToDate':
      result = 'quarter to date';
      break;
    case 'yearToDate':
      result = 'year to date';
      break;
  }
  return result;
}

export function parseDate(dateToParse: string) {
  const result = format(new Date(dateToParse), 'dd/MM/yyyy');
  return result;
}

export function getDateForMessage(date: string) {
  const result = format(new Date(date), 'dd MMM yyyy');
  return result;
}

//converts the string into pasal case format
export function toPascalCase(sentence: string | number | undefined) {
  if (typeof sentence === 'string')
    return sentence
      .split(' ')
      .map((word: string) =>
        word
          .split('')
          .map((character: string, index: number) =>
            index === 0 ? character.toUpperCase() : character.toLowerCase()
          )
          .join('')
      )
      .join(' ');
  else if (typeof sentence === 'number') {
    return sentence;
  }
  return undefined;
}

export function parseDateSlashFormat(dateToParse: string) {
  let parsedDate = new Date(dateToParse);
  const formattedDate = `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
    .getDate()
    .toString()
    .padStart(2, '0')}-${parsedDate.getFullYear()}`;
  return formattedDate;
}

export function convert(str: any) {
  var date = new Date(str),
    mnth = ('0' + (date.getMonth() + 1)).slice(-2),
    day = ('0' + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join('-');
}

export function intToString(num: any) {
  num = num.toString().replace(/[^0-9.]/g, '');
  if (num < 1000) {
    return num;
  }
  let si = [
    { v: 1e3, s: 'k' },
    { v: 1e6, s: 'm' },
    { v: 1e9, s: 'b' },
    { v: 1e12, s: 't' },
    { v: 1e15, s: 'p' },
    { v: 1e18, s: 'e' },
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (num >= si[index].v) {
      break;
    }
  }
  return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[index].s;
}

export function timeStampConversation(time: any) {
  const res = time;
  const timestamp = res ? new Date(res) : 0;
  const distance: any = formatDistance(Date.now(), timestamp, { addSuffix: true });
  return distance.substring(distance.indexOf(distance.match(/\d+/g)));
}

export function parseDateTime(dateToParse: string) {
  let parsedDate = new Date(dateToParse);
  let parsedTime = new Date(dateToParse)
    .toLocaleTimeString()
    .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
  const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
    parsedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${parsedDate.getFullYear()} ${parsedTime
    .toLocaleString()
    .replace(/\s+/g, '')}`;
  return formattedDate;
}

export function addDecimalUptoTwo(num: string): number {
  let value: number = Number(num);
  let res: string[] = num.split('.');
  if (res[1]?.length > 2) {
    value = parseFloat(value.toFixed(2));
  } else {
    value = value;
  }
  return value;
}

export function displayStringInShort(str: string) {
  if (str.length > 18) {
    return str.substring(0, 18) + '...';
  } else {
    return str;
  }
}

export function getRatingText(value: any) {
  let profileRatingTempText = '';
  if (value < 25) {
    profileRatingTempText = 'Poor';
  } else if (value <= 75) {
    profileRatingTempText = 'Intermediate';
  } else if (value > 75) {
    profileRatingTempText = 'Good';
  }

  return profileRatingTempText;
}

export function formatDate(inputDate: string): string {
  // Split the input date into day, month, and year
  const [day, month, year] = inputDate.split('-');

  // Create a new Date object with the specified year, month (subtract 1 as it's zero-based), and day
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Set the time portion to 00:00:01.000
  date.setHours(0, 0, 1, 0);

  // Format the date in the desired format
  const formattedDate = date.toISOString();

  return formattedDate;
}

export const InsertCommas = (fee: any) => {
  if (fee) {
    let tempFee = fee.toString();

    let nStr = tempFee + '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
  return fee;
};

// Function to check for blank object
export function isObjectEmpty(obj: any) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
}

export function getDateRange(range: any) {
  const today = new Date();
  const startDate = new Date(today);
  let endDate = new Date(today);

  switch (range) {
    case 'today':
      break;
    case 'last7days':
      startDate.setDate(today.getDate() - 6);
      break;
    case 'last3months':
      startDate.setMonth(today.getMonth() - 2);
      startDate.setDate(1);
      break;
    case 'last12months':
      startDate.setFullYear(today.getFullYear() - 1);
      startDate.setDate(1);
      break;
    case 'monthToDate':
      startDate.setDate(1);
      break;
    case 'quarterToDate':
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      break;
    case 'yearToDate':
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
  }

  // const formattedStartDate = startDate.toISOString().split('T')[0];
  // const formattedEndDate = endDate.toISOString().split('T')[0];
  const formattedStartDate = formatDateWithNoHypen(startDate);
  const formattedEndDate = formatDateWithNoHypen(endDate);

  return { startDate: formattedStartDate, endDate: formattedEndDate };
}

export function formatDateWithNoHypen(date: any) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getLastMonth() {
  let result = sub(new Date(), {
    months: 1,
  });
  return result;
}

export function startOfMonth() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  return startOfMonth;
}

export function startOfYear() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  return startOfYear;
}

export function startOfWeek() {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  return startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
}

export const percentageValue = (value: any) => {
  if (value) {
    if (value >= 0) {
      return (
        <Typography variant="body2" className="HDB-block-count green">
          +{value}% <i className="icon-Arrow-up" style={{ marginLeft: '5px' }}></i>
        </Typography>
      );
    } else {
      return (
        <Typography variant="body2" className="HDB-block-count red">
          {value}% <i className="icon-Arrow-down" style={{ marginLeft: '5px' }}></i>
        </Typography>
      );
    }
  } else {
    return null;
  }
};

export function getHorsePedigree (selectedHorseData: any, tag: string) {
  const pattern: (number | null)[][] = 
    (tag === 'S') ? 
      [
        [selectedHorseData[0][0], null],
        [selectedHorseData[1][0], selectedHorseData[1][1], null, null],
        [selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null],
        [selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7], null, null, null, null, null, null, null, null],
        [selectedHorseData[4][0], selectedHorseData[4][1], selectedHorseData[4][2], selectedHorseData[4][3], selectedHorseData[4][4], selectedHorseData[4][5], selectedHorseData[4][6], selectedHorseData[4][7], selectedHorseData[4][8], selectedHorseData[4][9], selectedHorseData[4][10], selectedHorseData[4][11], selectedHorseData[4][12], selectedHorseData[4][13], selectedHorseData[4][14], selectedHorseData[4][15], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'D') ?
      [
        [null, selectedHorseData[0][0]],
        [null, null, selectedHorseData[1][0], selectedHorseData[1][1]],
        [null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3]],
        [null, null, null, null, null, null, null, null, selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[4][0], selectedHorseData[4][1], selectedHorseData[4][2], selectedHorseData[4][3], selectedHorseData[4][4], selectedHorseData[4][5], selectedHorseData[4][6], selectedHorseData[4][7], selectedHorseData[4][8], selectedHorseData[4][9], selectedHorseData[4][10], selectedHorseData[4][11], selectedHorseData[4][12], selectedHorseData[4][13], selectedHorseData[4][14], selectedHorseData[4][15]]
      ] :
      (tag === 'SS') ?
      [
        [null, null],
        [selectedHorseData[0][0], null, null, null],
        [selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null],
        [selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null],
        [selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SD') ?
      [
        [null, null],
        [null, selectedHorseData[0][0], null, null],
        [null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null],
        [null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DS') ?
      [
        [null, null],
        [null, null, selectedHorseData[0][0], null],
        [null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7], null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DD') ?
      [
        [null, null],
        [null, null, null, selectedHorseData[0][0]],
        [null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1]],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[3][0], selectedHorseData[3][1], selectedHorseData[3][2], selectedHorseData[3][3], selectedHorseData[3][4], selectedHorseData[3][5], selectedHorseData[3][6], selectedHorseData[3][7]]
      ] :
      (tag === 'SSS') ?
      [
        [null, null],
        [null, null, null, null],
        [selectedHorseData[0][0], null, null, null, null, null, null, null],
        [selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, selectedHorseData[0][0], null, null, null, null, null, null],
        [null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, selectedHorseData[0][0], null, null, null, null],
        [null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, selectedHorseData[0][0], null, null, null, null],
        [null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, selectedHorseData[0][0], null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, selectedHorseData[0][0], null, null],
        [null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, selectedHorseData[0][0], null],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3], null, null, null, null]
      ] : 
      (tag === 'DDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, selectedHorseData[0][0]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[2][0], selectedHorseData[2][1], selectedHorseData[2][2], selectedHorseData[2][3]]
      ] : 
      (tag === 'SSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'SDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (tag === 'DSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null, null, null]
      ] :
      (tag === 'DDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null, null, null]
      ] :
      (tag === 'DDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1], null, null]
      ] :
      (tag === 'DDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[1][0], selectedHorseData[1][1]]
      ] :
      (tag === 'SSSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SSDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'SDDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DSDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null, null]
      ] :
      (tag === 'DDSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null, null]
      ] :
      (tag === 'DDSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null, null]
      ] :
      (tag === 'DDSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null, null]
      ] :
      (tag === 'DDSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null, null]
      ] :
      (tag === 'DDDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null, null]
      ] :
      (tag === 'DDDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null, null]
      ] :
      (tag === 'DDDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], null]
      ] :
      (tag === 'DDDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, selectedHorseData[0][0], ]
      ] :
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ]; 
  return pattern;
}

 // Function to update horseNames either with +add or blank
 export function updateHorseNames(arr: any, newHorseFormData: any) {  

  // Update horseNames based on progenyId matching horseId
  const updatedArr = arr?.map((innerArr: any, index: number) => {
      return innerArr?.map((item: any, key: number) => {
        let horseId =   item.horseId;
        let progenyId = item.progenyId;
        let horseName = item.horseName;
        let isLocked = item.isLocked;
        let legendColor = item.legendColor;
        let ageDiffFlag = false;
        let geldingFlag = false;
      
        // Check if horseName is "No Record" and progenyId matches a horseId
        if (horseName === "NO RECORD" && horseId !== progenyId) {
          horseName = "+add";
          horseId = 0;
          isLocked = false;
          legendColor = "";
        } else if (horseName === "NO RECORD" && horseId === progenyId) {
          horseName = ""; // Set to blank if progenyId doesn't match
          horseId = 0;
          isLocked = false;
          legendColor = "";
        }
        
        // Finally return the updated json object based on pedigree flat data
        return {
          ...item,          
          horseName: horseName,
          horseId: horseId,
          isLocked: isLocked,
          legendColor: legendColor,          
        };
      });
  });
  return updatedArr;
}