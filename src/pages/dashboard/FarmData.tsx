// @mu
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  StyledEngineProvider,
  TableSortLabel,
  styled,
  Card,
  Popover,
} from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import Page from 'src/components/Page';
import DottedWorldFarmMap from 'src/components/graph/DottedWorldFarmMap';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect } from 'react';
import { Farm } from 'src/@types/farm';
import Scrollbar from 'src/components/Scrollbar';
import './dashboard.css';
import { FarmListTableRow } from 'src/sections/@dashboard/farm/list';
import { Spinner } from 'src/components/Spinner';
import FarmFilterSidebar from 'src/sections/@dashboard/farm/filter/FarmFilterSidebar';
import FarmNewEditModal from 'src/sections/@dashboard/farm/FarmNewEditModal';
import {
  useFarmDashboardQuery,
  useFarmsQuery,
  useShareFarmsQuery,
  useFarmDashboardTotalVisitorsQuery,
  useDownloadExcelFileQuery,
} from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
// hooks
import useSettings from 'src/hooks/useSettings';
import { MenuProps } from '../../constants/MenuProps';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  parseDateAsDotFormat,
  dateHypenConvert,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import CsvLink from 'react-csv-export';
import { toPascalCase } from 'src/utils/customFunctions';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
import useCounter from 'src/hooks/useCounter';
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { CircularSpinner } from 'src/components/CircularSpinner';

// ----------------------------------------------------------------------
// HtmlTooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// table headCells
const headCells = [
  {
    id: 'farmName',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'stateName',
    numeric: false,
    disablePadding: true,
    label: 'State',
  },
  {
    id: 'totalStallions',
    numeric: true,
    disablePadding: true,
    label: 'Total Stallions',
  },
  {
    id: 'promoted',
    numeric: true,
    disablePadding: true,
    label: 'Promoted',
  },
  {
    id: 'users',
    numeric: true,
    disablePadding: true,
    label: '# Users',
  },
  {
    id: 'modifiedOn',
    numeric: false,
    disablePadding: true,
    label: 'Last Active',
  },
];

export default function FarmData() {
  // initial states
  const filterCounterhook = useCounter(0);
  const [filterStatus, setFilterStatus] = useState(false);
  const [clickedPopover, setClickedPopover] = useState(false);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);

  const [farmModuleAccess, setFarmModuleAccess] = useState({
    farm_list: false,
    farm_dashboard: false,
    farm_dashboard_download: false,
    farm_list_download: false,
    farm_edit_promoted: false,
  });
  // API call to get App Permission By UserToken
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });
  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;
  // onSuccess API call
  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  React.useEffect(() => {
    if (valuesExist.hasOwnProperty('FARM_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setFarmModuleAccess({
      ...farmModuleAccess,
      farm_list: !valuesExist?.hasOwnProperty('FARM_ADMIN_READ_ONLY') ? false : true,
      farm_list_download: !valuesExist?.hasOwnProperty('FARM_ADMIN_EXPORT_LISTS') ? false : true,
      farm_dashboard: !valuesExist?.hasOwnProperty('FARM_ADMIN_VIEW_FARMS_DASHBOARD')
        ? false
        : true,
      farm_dashboard_download: !valuesExist?.hasOwnProperty('FARM_ADMIN_DASHBOARD_EXPORT_FUNCTION')
        ? false
        : true,
      farm_edit_promoted: !valuesExist?.hasOwnProperty('FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE')
        ? false
        : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  // API call to get farm page settings
  const pageId = process.env.REACT_APP_FARM_PAGE_ID;
  const {
    data: farmSettings,
    isFetching: isFarmSettingFetching,
    isLoading: isFarmSettingLoading,
    isSuccess: isFarmSettingSuccess,
  } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });
  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('totalStallions');
  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };

  // Enhanced TableHead handler
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      // table head section
      <TableHead className="farmTableHead">
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={
                  order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon
                }
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'ASC'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'DESC' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
                {headCell.label === 'Name' ? (
                  <Box className="tooltipPopoverbox">
                    <HtmlTooltip
                      className="tableTooltip"
                      title={
                        <React.Fragment>
                          <Box className="tooltipPopoverBody HorseDetailsPopover">
                            <p>
                              <i className="popover-circle red"></i> Requires Verification
                            </p>
                            <p>
                              <i className="popover-circle black"></i> Verified & Complete
                            </p>
                          </Box>
                        </React.Fragment>
                      }
                    >
                      <i className="icon-Info-circle tooltip-table" />
                    </HtmlTooltip>
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className="icon-share-wrapper">
            {!farmModuleAccess.farm_list_download && (
              <i
                className={'icon-Share'}
                onClick={() => setClickedPopover(true)}
                style={{ cursor: 'pointer' }}
              />
            )}
            {farmModuleAccess.farm_list_download && (
              <CsvLink data={csvShareData} fileName={`Farm_Data (${new Date()})`}>
                <i className={'icon-Share'} style={{ cursor: 'pointer' }} />
              </CsvLink>
            )}
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }
  const [tableData, setTableData] = useState<Farm[]>([]);
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [dateValue, setDateValue] = React.useState(null);
  const handlePromotedDate = (date: any) => {
    setDateValue(date);
  };
  // filter handler
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };
  // filter Applied handle
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };
  // Remove Filter Applied handler
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('totalStallions');
  // onSuccess page settings API
  useEffect(() => {
    if (isFarmSettingSuccess) {
      setOrderBy(farmSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(farmSettings?.settingsResponse?.defaultDisplay);
    }
    if (isSearchClicked) {
      setGetFilters({
        ...getFilters,
        sortBy: farmSettings?.settingsResponse?.defaultDisplay,
      });
    }
  }, [farmSettings]);

  // pagination counts and clear
  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  // filter name handler
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  // newState
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  // clear All handler to reset data
  const clearAll = () => {
    setStateValue({
      farmName: '',
      isFarmNameExactSearch: true,
      farmId: '',
      countryId: null,
      countryName: { countryName: '' },
      active: 'none',
      activePeriod: '',
      activePeriodRange: [null, null],
      promotedStatus: 'none',
      expiredStallion: 'none',
      isVerified: true,
      isVerifiedClicked: false,
      order: order,
      sortBy: orderBy,
      page: page,
      limit: limit,
      isSortByClicked: false,
    });
    setFarmName('');
    setCountryId('none');
    setActive('none');
    setActivePeriod('');
    handleRemoveFilterApplied();
    setPromotedStatus('none');
    setExpiredStallion('none');
    setIsVerified(false);
    setIsFarmNameExactSearch(true);
    setDateValueFilter(null);
    handleRemoveFilterApplied();
    setConvertedActivePeriodRangeValue('');
    setConvertedActivePeriodDateValue([null, null]);
    setIsSearchClicked(false);
  };

  // API call to get farms list
  const data = useFarmsQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
    refetchOnMountOrArgChange: true,
  });
  const farmList = data?.data?.data ? data?.data?.data : [];

  // API call to download farms stats data
  const downloadData: any = useShareFarmsQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
    refetchOnMountOrArgChange: true,
  });
  const [csvShareData, setCsvShareData] = useState<any>([]);
  // csv download data
  React.useEffect(() => {
    let headerobj = {
      horseName: 'Name',
      countryName: 'Country',
      farmName: 'State',
      fee: 'Total Stallions',
      last_updated: 'Promoted',
      isPromoted: '# Users',
      isActive: 'Last Active',
    };
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { farmName, countryName, stateName, totalStallions, promoted, users, modifiedOn } = item;
      const lastActiveOn: any = parseDateAsDotFormat(modifiedOn);
      const FarmName = toPascalCase(farmName);
      tempArr.push({
        FarmName,
        countryName,
        stateName,
        totalStallions,
        promoted,
        users,
        lastActiveOn,
      });
    });
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // farm List Props
  const farmListProps = {
    page: page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
    clearAll,
  };
  useEffect(() => {
    setTableData(data?.data || tableData);
  }, [data]);
  // Edit Popup handler
  const handleEditPopup = () => {
    setOpen(!open);
  };
  // open Edit Popup
  const handleEditState = () => {
    setEdit(true);
  };
  // close Edit Popup
  const handleCloseEditState = () => {
    setEdit(!isEdit);
  };
  const [selected, setSelected] = useState([]);

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  // close menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const { farmname = '' } = useParams();
  const [farmName, setFarmName] = React.useState(farmname || '');
  const [farmId, setFarmId] = React.useState('');
  const [countryId, setCountryId] = React.useState('none');
  const [active, setActive] = React.useState('none');
  const [activePeriod, setActivePeriod] = React.useState('');
  const [promotedStatus, setPromotedStatus] = React.useState('none');
  const [expiredStallion, setExpiredStallion] = React.useState('none');
  const [isVerified, setIsVerified] = React.useState(false);
  const [dateValueFilter, setDateValueFilter] = React.useState(null);
  const [isFarmNameExactSearch, setIsFarmNameExactSearch] = React.useState(true);
  const [convertedActivePeriodRangeValue, setConvertedActivePeriodRangeValue] = React.useState('');
  const [convertedActivePeriodDateValue, setConvertedActivePeriodDateValue] = React.useState([
    null,
    null,
  ]);
  // initial states
  const [state, setStateValue] = useState({
    farmName: farmname || '',
    isFarmNameExactSearch: true,
    farmId: '',
    countryId: null,
    countryName: { countryName: '' },
    active: 'none',
    activePeriod: '',
    activePeriodRange: [null, null],
    promotedStatus: 'none',
    expiredStallion: 'none',
    isVerified: false,
    isVerifiedClicked: false,
    order: order,
    sortBy: orderBy,
    page: page,
    limit: limit,
    isSortByClicked: false,
  });

  // pagination limit handler
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...{ page: 1 },
      ...{ limit: pageLimit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(farmName != '' && { farmName: farmName }),
      ...(farmId !== '' && { farmId: farmId }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(active !== 'none' && { Status: active }),
      ...(dateHypenConvert(convertedActivePeriodDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedActivePeriodDateValue[0]) +
          '/' +
          dateHypenConvert(convertedActivePeriodDateValue[1]),
      }),
      ...(promotedStatus !== 'none' && { PromotedStatus: promotedStatus }),
      ...(expiredStallion !== 'none' && { expiredStallion: expiredStallion }),
      ...(state?.isVerifiedClicked && { RequiresVerification: isVerified }),
      ...(dateValueFilter !== null && { dateValue: dateValueFilter }),
      ...(farmName != '' && { isFarmNameExactSearch: isFarmNameExactSearch }),
    };
    handleFilter(datafltr);
  };

  // pagination handler
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...{ page: pageNum },
      ...{ limit: limit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(farmName != '' && { farmName: farmName }),
      ...(farmId !== '' && { farmId: farmId }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(active !== 'none' && { Status: active }),
      ...(dateHypenConvert(convertedActivePeriodDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedActivePeriodDateValue[0]) +
          '/' +
          dateHypenConvert(convertedActivePeriodDateValue[1]),
      }),
      ...(promotedStatus !== 'none' && { PromotedStatus: promotedStatus }),
      ...(expiredStallion !== 'none' && { expiredStallion: expiredStallion }),
      ...(state?.isVerifiedClicked && { RequiresVerification: isVerified }),
      ...(dateValueFilter !== null && { dateValue: dateValueFilter }),
      ...(farmName != '' && { isFarmNameExactSearch: isFarmNameExactSearch }),
    };
    handleFilter(datafltr);
  };

  // table sort handler
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    setStateValue({
      ...state,
      isSortByClicked: true,
    });
    const datafltr = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: isAsc ? 'DESC' : 'ASC' },
      ...{ sortBy: property },
      ...(farmName != '' && { farmName: farmName }),
      ...(farmId !== '' && { farmId: farmId }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(active !== 'none' && { Status: active }),
      ...(dateHypenConvert(convertedActivePeriodDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedActivePeriodDateValue[0]) +
          '/' +
          dateHypenConvert(convertedActivePeriodDateValue[1]),
      }),
      ...(promotedStatus !== 'none' && { PromotedStatus: promotedStatus }),
      ...(expiredStallion !== 'none' && { expiredStallion: expiredStallion }),
      ...(state?.isVerifiedClicked && { RequiresVerification: isVerified }),
      ...(dateValueFilter !== null && { dateValue: dateValueFilter }),
      ...(farmName != '' && { isFarmNameExactSearch: isFarmNameExactSearch }),
    };
    handleFilter(datafltr);
  };

  // setSelected handler
  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = farmList.map((n: any) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('today');
  const [dateOptionSelected, setDateOptionSelected] = useState('today');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);
  // DatePicker handler
  const handleDatePicker = (event: SelectChangeEvent<any>): void => {
    const optionVal: any = event.target.value;
    setDateOptionSelected(getOPtionText(optionVal));
    setDateDefaultSelected(event.target.value);

    if (optionVal === 'lastyear') {
      // Last year
      const last_year_start = startOfYear(subYears(current_date, 1));
      const last_year_end = endOfYear(subYears(current_date, 1));
      setDateFrom(format(last_year_start, 'yyyy-MM-dd HH:mm:ss'));
      setDateTo(format(last_year_end, 'yyyyMMdd'));
    } else if (optionVal === 'thisyear') {
      // This year (end date is the current date)
      const this_year_start = startOfYear(current_date);
      const this_year_end = endOfDay(current_date); // End date is the current date
      setDateFrom(format(this_year_start, 'yyyy-MM-dd HH:mm:ss'));
      setDateTo(format(this_year_end, 'yyyyMMdd'));
    } else {
      setDateFrom(getLastFromDate(optionVal));
      setDateTo(currentDate());
    }
    setConvertedCreatedRangeValue('');
    setConvertedCreatedDateValue([null, null]);
  };

  const fromDateConverted =
    dateDefaultSelected === 'custom'
      ? dateConvert(convertedCreatedDateValue[0])
      : dateConvert(dateFrom);
  const toDateConverted =
    dateDefaultSelected === 'custom' ? dateConvert(convertedCreatedDateValue[1]) : dateTo;
  const isDashboardAPI = fromDateConverted > 0 && toDateConverted > 0 ? true : false;

  // API call to get dashboard API Data
  const {
    data: dashboardAPIData,
    error,
    isFetching,
    isLoading,
    isSuccess,
    status,
  } = useFarmDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI }
  );
  const dashboardData = isSuccess ? dashboardAPIData : DashboardConstants.farmDashboardStaticData;

  // API call to get visitor API Data
  const {
    data: visitorAPIData,
    isFetching: isVisitorFetching,
    isLoading: isVisitorLoading,
    isSuccess: isVisitorSuccess,
  } = useFarmDashboardTotalVisitorsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );
  // const totalFarmVisitorData: any = isVisitorSuccess
  //   ? visitorAPIData
  //   : DashboardConstants.totalFarmVisitorStaticData;

  // filter dashboard data based on KPI title
  const totalFarmData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Total Farms');
  const totalPromotedFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Farm Promoted'
  );
  const totalNewFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'New Farms'
  );
  const totalFarmUserData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Farm User'
  );
  const totalFarmVisitorData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Farm visitor'
  );
  const totalFarmUserGrowthData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Farm User Growth'
  );
  const totalFarmPromotedLocationData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Farm promoted location'
  );
  const totalMostValuableFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most valuable Farm'
  );
  const totalMostEngagedFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Engaged Farm'
  );
  const totalTopRefererFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Top Referrer Farm'
  );
  const totalMostActiveFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Active Farm'
  );
  const totalLargestFarmData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Largest Farm'
  );

  // download csv based on KPI title
  const [csvData, setCsvData] = useState<any>('');
  React.useEffect(() => {
    setCsvData([
      {
        'Total Farms': totalFarmData[0]?.CurrentValue > 0 ? totalFarmData[0]?.CurrentValue : 0,
        'Total Promoted Farms':
          totalPromotedFarmData[0]?.CurrentValue > 0 ? totalPromotedFarmData[0]?.CurrentValue : 0,
        'New Farms': totalNewFarmData[0]?.CurrentValue > 0 ? totalNewFarmData[0]?.CurrentValue : 0,
        'Total Visitors':
          totalFarmVisitorData[0]?.CurrentValue > 0 ? totalFarmVisitorData[0]?.CurrentValue : 0,
        'Total Farm Users':
          totalFarmUserData[0]?.CurrentValue > 0 ? totalFarmUserData[0]?.CurrentValue : 0,
        'Farm User Growth':
          totalFarmUserGrowthData[0]?.CurrentValue > 0
            ? totalFarmUserGrowthData[0]?.CurrentValue
            : 0,
        'Most Promoted Location':
          totalFarmPromotedLocationData[0]?.CurrentName !== ''
            ? toPascalCase(totalFarmPromotedLocationData[0]?.CurrentName)
            : '',
        'Most Valuable Farm':
          totalMostValuableFarmData[0]?.CurrentName !== ''
            ? toPascalCase(totalMostValuableFarmData[0]?.CurrentName)
            : '',
        'Most Engaged Farm':
          totalMostEngagedFarmData[0]?.CurrentName !== ''
            ? toPascalCase(totalMostEngagedFarmData[0]?.CurrentName)
            : '',
        'Top Referrer':
          totalTopRefererFarmData[0]?.CurrentName !== ''
            ? toPascalCase(totalTopRefererFarmData[0]?.CurrentName)
            : '',
        'Most Active Farm':
          totalMostActiveFarmData[0]?.CurrentName !== ''
            ? toPascalCase(totalMostActiveFarmData[0]?.CurrentName)
            : '',
        'Largest Farm':
          totalLargestFarmData[0]?.CurrentName !== ''
            ? toPascalCase(totalLargestFarmData[0]?.CurrentName)
            : '',
      },
    ]);
  }, [isFetching, isVisitorFetching]);

  const [isTotalFarmsDownload, setIsTotalFarmsDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});
  // API call to get total Farms Csv Data
  const {
    data: totalFarmsCsvData,
    isFetching: isTotalFarmsCsvDataFetching,
    isLoading: isTotalFarmsCsvDataLoading,
    isSuccess: isTotalFarmsCsvDataSuccess,
    status: farmDownloadStatus,
  } = useDownloadExcelFileQuery(
    { setupId: excelPayload, name: 'farm' },
    { skip: !isTotalFarmsDownload }
  );
  // download Total Farm Csv handler
  const downloadTotalFarmCsv = (kpiType: any) => {
    if (userModuleAccess) {
      setExcelPayload({
        kpiTitle: kpiType,
        fromDate: fromDateConverted,
        toDate: toDateConverted,
      });
      setIsTotalFarmsDownload(true);
    } else {
      setClickedPopover(true);
    }
  };
  React.useEffect(() => {
    setIsTotalFarmsDownload(false);
  }, [isTotalFarmsCsvDataSuccess]);

  const { pathname } = useLocation();
  const getFarmId = pathname.split('/')[4];

  // handle filter based on farmId
  useEffect(() => {
    if (pathname) {
      if (pathname.search('edit') > 0) {
        if (getFarmId) {
          handleFilter({
            page: page,
            limit: limit,
            order: order,
            sortBy: orderBy,
          });
          handleFilterApplied();
          setIsSearchClicked(true);
          handleEditPopup();
          setRowId(getFarmId);
          handleCloseMenu();
          handleEditState();
        } else {
          handleRemoveFilterApplied();
          setIsSearchClicked(false);
        }
      }
    }
  }, [getFarmId]);

  return (
    <StyledEngineProvider injectFirst>
      <>
        {/* farm header section */}
        <DashboardHeader
          isCollapse={isCollapse}
          onOpenSidebar={() => setOpenHeader(true)}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          moduleListProps={farmListProps}
          isSearchClicked={isSearchClicked}
        />
        {/* farm filter section */}
        <Page title="Farm Dashboard" sx={{ display: 'flex' }} className="FarmDataDashboard">
          <FarmFilterSidebar
            handleFilter={handleFilter}
            handleFilterApplied={handleFilterApplied}
            handleRemoveFilterApplied={handleRemoveFilterApplied}
            isFilterApplied={isFilterApplied}
            rowCount={!isFilterApplied ? 0 : data?.data?.meta?.itemCount}
            page={page}
            limit={limit}
            isSearchClicked={isSearchClicked}
            setIsSearchClicked={setIsSearchClicked}
            setPage={setPage}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            farmName={farmName}
            setFarmName={setFarmName}
            countryId={countryId}
            setCountryId={setCountryId}
            active={active}
            setActive={setActive}
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
            promotedStatus={promotedStatus}
            setPromotedStatus={setPromotedStatus}
            expiredStallion={expiredStallion}
            setExpiredStallion={setExpiredStallion}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            dateValueFilter={dateValueFilter}
            setDateValueFilter={setDateValueFilter}
            state={state}
            setStateValue={setStateValue}
            isFarmNameExactSearch={isFarmNameExactSearch}
            setIsFarmNameExactSearch={setIsFarmNameExactSearch}
            convertedActivePeriodRangeValue={convertedActivePeriodRangeValue}
            setConvertedActivePeriodRangeValue={setConvertedActivePeriodRangeValue}
            convertedActivePeriodDateValue={convertedActivePeriodDateValue}
            setConvertedActivePeriodDateValue={setConvertedActivePeriodDateValue}
            defaultPageOrderBy={defaultPageOrderBy}
            setDefaultPageOrderBy={setDefaultPageOrderBy}
            handleOpenFilterParam={handleOpenFilterParam}
          />
          <Box className="FarmDataDashboardRight" sx={{ width: '100%' }} px={2}>
            <Container>
              {/* toast message */}
              {apiStatus && (
                <CustomToasterMessage
                  apiStatus={true}
                  setApiStatus={setApiStatus}
                  apiStatusMsg={apiStatusMsg}
                  setApiStatusMsg={setApiStatusMsg}
                />
              )}
              {!isSearchClicked ? (
                status === 'rejected' ? (
                  <UnAuthorized />
                ) : (
                  <Box>
                    <Stack direction="row" className="MainTitleHeader">
                      <Grid container mt={2}>
                        <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
                          <Typography variant="h4" className="MainTitle">
                            Farm Dashboard
                          </Typography>
                        </Grid>
                        <Grid item lg={6} sm={6} className="MainTitleHeadRight">
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent: { lg: 'right', sm: 'right', xs: 'left' },
                              display: 'flex',
                            }}
                          >
                            {/* csv share section */}
                            <Box className="Share">
                              <CsvLink
                                data={csvData}
                                fileName={`Farm_Data (${dateDefaultSelected})`}
                                withTimeStamp
                              >
                                <Button type="button" className="ShareBtn">
                                  <i className="icon-Share"></i>
                                </Button>
                              </CsvLink>
                            </Box>
                            {/* csv share section ends */}

                            {/* datepicker section */}
                            <Box className="edit-field">
                              <Select
                                MenuProps={MenuProps}
                                className="selectDropDown"
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                value={dateDefaultSelected}
                                sx={{ height: '40px', minWidth: '168px' }}
                                onChange={handleDatePicker}
                              >
                                {dateFilterList?.map(({ id, name }) => {
                                  return (
                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                      {name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </Box>

                            {dateDefaultSelected === 'custom' && (
                              <Box className="edit-field calender-wrapper">
                                <CustomRangePicker
                                  placeholderText="Enter date range"
                                  convertedDateRangeValue={convertedCreatedRangeValue}
                                  setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                                  convertedDateValue={convertedCreatedDateValue}
                                  setConvertedYobDateValue={setConvertedCreatedDateValue}
                                />
                              </Box>
                            )}
                            {/* datepicker section ends */}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Stack>
                    {/* farm dashboard stats section */}
                    <Box mt={3} className="FarmDataDashboardBody">
                      <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Total Farms{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('TOTAL_FARMS')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalFarmData[0]?.CurrentValue &&
                                      InsertCommas(totalFarmData[0]?.CurrentValue)}
                                  </Typography>
                                  {totalFarmData && percentageValue(totalFarmData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to{' '}
                                  {totalFarmData[0]?.PrevValue &&
                                    InsertCommas(totalFarmData[0]?.PrevValue)}{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Total Promoted Farms{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('FARM_PROMOTED')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalPromotedFarmData[0]?.CurrentValue &&
                                      InsertCommas(totalPromotedFarmData[0]?.CurrentValue)}
                                  </Typography>
                                  {totalPromotedFarmData &&
                                    percentageValue(totalPromotedFarmData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to{' '}
                                  {totalPromotedFarmData[0]?.PrevValue &&
                                    InsertCommas(totalPromotedFarmData[0]?.PrevValue)}{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  New Farms{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('NEW_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalNewFarmData[0]?.CurrentValue &&
                                      InsertCommas(totalNewFarmData[0]?.CurrentValue)}
                                  </Typography>
                                  {totalNewFarmData &&
                                    percentageValue(totalNewFarmData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to{' '}
                                  {totalNewFarmData[0]?.PrevValue &&
                                    InsertCommas(totalNewFarmData[0]?.PrevValue)}{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Total Visitors{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('FARM_VISITOR')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalFarmVisitorData[0]?.CurrentValue &&
                                      InsertCommas(totalFarmVisitorData[0]?.CurrentValue)}
                                  </Typography>
                                  {totalFarmVisitorData &&
                                    percentageValue(totalFarmVisitorData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to{' '}
                                  {totalFarmVisitorData[0]?.PrevValue &&
                                    InsertCommas(totalFarmVisitorData[0]?.PrevValue)}{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Dotted World Map Farm */}
                    <Box mt={3} className="WorldReachWrapper dottedMap-Wrapper">
                      <Box
                        className="WorldReachBox"
                        sx={{ background: '#ffffff', height: '580px' }}
                      >
                        <Typography variant="h5">World Reach</Typography>
                        <Box className="WorldReachBoxBody">
                          <DottedWorldFarmMap
                            fromDate={fromDateConverted}
                            toDate={toDateConverted}
                            totalFarms={totalFarmData[0]?.CurrentValue}
                          />
                        </Box>
                      </Box>
                    </Box>
                    {/* Dotted World Map Farm ends */}

                    <Box mt={2} className="FarmDataDashboardBody">
                      <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Total Farm Users{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('FARM_USER')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalFarmUserData[0]?.CurrentValue &&
                                      InsertCommas(totalFarmUserData[0]?.CurrentValue)}
                                  </Typography>
                                  {totalFarmUserData &&
                                    percentageValue(totalFarmUserData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to{' '}
                                  {totalFarmUserData[0]?.PrevValue &&
                                    InsertCommas(totalFarmUserData[0]?.PrevValue)}{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Farm User Growth{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('FARM_USER_GROWTH')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#C75227' }}>
                                    {totalFarmUserGrowthData[0]?.CurrentValue
                                      ? totalFarmUserGrowthData[0]?.CurrentValue
                                      : 0}%
                                  </Typography>
                                  {totalFarmUserGrowthData &&
                                    percentageValue(totalFarmUserGrowthData[0]?.diffPercent)}
                                </Box>
                                <Typography component="span">
                                  Compared to {totalFarmUserGrowthData[0]?.PrevValue}%{' '}
                                  {dateOptionSelected}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Most Promoted Location{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('FARM_PROMOTED_LOCATION')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {toPascalCase(totalFarmPromotedLocationData[0]?.CurrentName)}
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                  {totalFarmPromotedLocationData[0]?.PrevName !== ''
                                    ? 'Previously ' +
                                    toPascalCase(totalFarmPromotedLocationData[0]?.PrevName)
                                    : ''}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Most Valuable Farm{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('MOST_VALUABLE_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {toPascalCase(totalMostValuableFarmData[0]?.CurrentName)}
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                  {totalMostValuableFarmData[0]?.PrevName !== ''
                                    ? 'Previously ' +
                                    toPascalCase(totalMostValuableFarmData[0]?.PrevName)
                                    : ''}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Most Engaged Farm{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('MOST_ENGAGED_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {toPascalCase(totalMostEngagedFarmData[0]?.CurrentName)}
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                  {totalMostEngagedFarmData[0]?.PrevName !== ''
                                    ? 'Previously ' +
                                    toPascalCase(totalMostEngagedFarmData[0]?.PrevName)
                                    : ''}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Top Referrer{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('TOP_REFERRER_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {totalTopRefererFarmData[0]?.CurrentName ? toPascalCase(totalTopRefererFarmData[0]?.CurrentName) : '-'}
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                Previously {totalTopRefererFarmData[0]?.PrevName !== ''
                                    ? toPascalCase(totalTopRefererFarmData[0]?.PrevName)
                                    : ' -'}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Most Active Farm{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('MOST_ACTIVE_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {toPascalCase(totalMostActiveFarmData[0]?.CurrentName)}
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                  {totalMostActiveFarmData[0]?.PrevName !== ''
                                    ? 'Previously ' +
                                    toPascalCase(totalMostActiveFarmData[0]?.PrevName)
                                    : ''}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" className="HDB-blocks">
                            {isFetching ? <CircularSpinner /> :
                              <Box>
                                <Typography variant="body2" className="HBD-subheadings">
                                  Largest Farm{' '}
                                  <i
                                    className="icon-Download"
                                    onClick={() => downloadTotalFarmCsv('LARGEST_FARM')}
                                  ></i>
                                </Typography>
                                <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                                  <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                    {toPascalCase(totalLargestFarmData[0]?.CurrentName)} (
                                    {totalLargestFarmData[0]?.CurrentValue})
                                  </Typography>
                                </Box>
                                <Typography component="span">
                                  {totalLargestFarmData[0]?.PrevName !== ''
                                    ? 'Previously ' + toPascalCase(totalLargestFarmData[0]?.PrevName)
                                    : ''}
                                </Typography>
                              </Box>}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                    {/* farm dashboard stats section */}
                  </Box>
                )
              ) : isFetchingAccessLevel && filterCounterhook.value < 5 ? (
                <Box className="Spinner-Wrp">
                  {/* spinner */} <Spinner />
                </Box>
              ) : filterCounterhook.value > 5 && farmModuleAccess.farm_list === false ? (
                <UnAuthorized />
              ) : !isFilterApplied ? (
                // no data component
                <NoDataComponent {...farmListProps} />
              ) : data?.isFetching ? (
                <Box className="Spinner-Wrp">
                  {/* spinner */} <Spinner />
                </Box>
              ) : farmListProps?.result?.length > 0 ? (
                <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                  <Scrollbar>
                    {/* table section */}
                    <TableContainer className="datalist" sx={{ minWidth: 800 }}>
                      <Table
                        sx={{
                          borderCollapse: 'separate',
                          borderSpacing: '0 4px',
                          background: '#FAF8F7',
                        }}
                      >
                        <EnhancedTableHead
                          numSelected={selected.length}
                          order={order}
                          orderBy={orderBy}
                          onRequestSort={handleRequestSort}
                          rowCount={farmList.length}
                        />
                        <TableBody>
                          {farmList.map((row: any, index: number) => (
                            <FarmListTableRow
                              key={row.farmId}
                              row={row}
                              selected={row.farmId}
                              onSelectRow={row.farmId}
                              onEditPopup={() => handleEditPopup()}
                              onSetRowId={() => setRowId(row.farmId)}
                              handleEditState={() => handleEditState()}
                              farmModuleAccess={farmModuleAccess}
                              setFarmModuleAccess={setFarmModuleAccess}
                              clickedPopover={clickedPopover}
                              setClickedPopover={setClickedPopover}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* table section ends */}
                  </Scrollbar>

                  {/* Pagination section */}
                  <Box className={`Pagination-wrapper ${filterStatus ? 'pagination-data' : ''}`}>
                    <PaginationSettings
                      data={farmListProps}
                      handleRequestPagination={handleRequestPagination}
                      limit={limit}
                      setLimit={setLimit}
                    />
                    <PaginationLimit
                      data={farmListProps}
                      handleRequestPaginationLimit={handleRequestPaginationLimit}
                      limit={limit}
                      setLimit={setLimit}
                    />
                  </Box>
                </Card>
              ) : (
                <NoDataComponent {...farmListProps} />
              )}
            </Container>
          </Box>
          {/* Farm New Edit Modal */}
          {isEdit && (
            <FarmNewEditModal
              open={open}
              rowId={rowId}
              isEdit={isEdit}
              handleEditPopup={handleEditPopup}
              handleCloseEditState={handleCloseEditState}
              apiStatus={true}
              setApiStatus={setApiStatus}
              apiStatusMsg={apiStatusMsg}
              setApiStatusMsg={setApiStatusMsg}
              valuesExist={valuesExist}
              setValuesExist={setValuesExist}
            />
          )}
          {/* Download Unauthorized Popover */}
          {clickedPopover && !farmModuleAccess.farm_dashboard_download && (
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
          )}
        </Page>
        {/* farm filter section ends */}
      </>
    </StyledEngineProvider>
  );
}
