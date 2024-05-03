// @mui
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  StyledEngineProvider,
  TableSortLabel,
  styled,
  Card
} from '@mui/material';
import StallionFilterSidebar from 'src/sections/@dashboard/stallion/filters/StallionFilterSidebar';
import StallionNewEditModal from 'src/sections/@dashboard/stallion/StallionNewEditModal';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import Page from 'src/components/Page';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @types
import { Stallion } from '../../@types/stallion';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Spinner } from 'src/components/Spinner';
import { visuallyHidden } from '@mui/utils';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
// hooks
import useSettings from 'src/hooks/useSettings';
import { useDispatch } from 'react-redux';
import { useStallionsQuery, useShareStallionsQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import Scrollbar from 'src/components/Scrollbar';
// sections
import { StallionListTableRow } from 'src/sections/@dashboard/stallion/list';
import './dashboard.css';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import format from 'date-fns/format';
import DataAnalytics from 'src/sections/@dashboard/stallion/DataAnalytics';
import { useLocation, useParams } from 'react-router';
import StallionViewFeeHistory from 'src/sections/@dashboard/stallion/StallionViewFeeHistory';
import StallionViewAnalytics from 'src/sections/@dashboard/stallion/StallionViewAnalytics';
import CsvLink from 'react-csv-export';
import { parseDateAsDotFormat, toPascalCase, dateHypenConvert } from 'src/utils/customFunctions';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------

// Tooltip style for list table column "Promoted"
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Stallion table column names
const headCells = [
  {
    id: 'horseName',
    numeric: false,
    disablePadding: true,
    label: 'Stallion',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'farmName',
    numeric: false,
    disablePadding: true,
    label: 'Farm',
  },
  {
    id: 'fee',
    numeric: true,
    disablePadding: true,
    label: 'Stud Fee',
  },
  {
    id: 'last_updated',
    numeric: true,
    disablePadding: true,
    label: 'Last Updated',
  },
  {
    id: 'isPromoted',
    numeric: true,
    disablePadding: true,
    label: 'Promoted',
  },
  {
    id: 'isActive',
    numeric: false,
    disablePadding: true,
    label: 'Active',
  },
]


export default function StallionData() {
  // Stallion settings api call
  const pageId = process.env.REACT_APP_STALLION_PAGE_ID;
  const { data: stallionSettings, isFetching: isStallionSettingFetching, isLoading: isStallionSettingLoading, isSuccess: isStallionSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });  
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('horseName');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('horseName'); 
  
  // Method to display table header with sorting
  function EnhancedTableHead(props: any) {
    const {
      //onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property)
    }

    return (
      <TableHead className='stallionTableHead'>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon }
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
                {headCell.label === 'Promoted' ?
                  <Box className='tooltipPopoverbox'>
                    <HtmlTooltip
                      className="tableTooltip"
                      title={
                        <React.Fragment>
                          <Box className='tooltipPopoverBody'>
                            <p><i className='icon-Confirmed-24px'></i> Valid Promotion</p>
                            <p><i className='icon-Incorrect'></i> Recently Expired</p>
                            <p><i className='icon-NonPromoted'></i> Not Promoted</p>
                          </Box>
                        </React.Fragment>
                      }
                    >
                      <i className="icon-Info-circle tooltip-table" />
                    </HtmlTooltip>
                  </Box>

                  : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className='icon-share-wrapper'><CsvLink data={csvShareData} fileName={`Stallion_Data (${new Date()})`}><i className={'icon-Share'} /></CsvLink></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [stallionModuleAccess, setStallionModuleAccess] = useState({
    stallion_list: false,
    stallion_dashboard: false,
    stallion_dashboard_download: false,
    stallion_list_download: false,
    stallion_edit: false,
    stallion_edit_promoted_page: false,
    stallion_feehistory: false,
    // horse_list: false,
  });

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

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
    if (valuesExist.hasOwnProperty('STALLION_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setStallionModuleAccess({
      ...stallionModuleAccess,
      stallion_list: !valuesExist?.hasOwnProperty('STALLION_ADMIN_RUN_A_SEARCH_FOR_STALLIONS') ? false : true,
      stallion_list_download: !valuesExist?.hasOwnProperty('STALLION_ADMIN_EXPORT_LISTS') ? false : true,
      stallion_dashboard: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_STALLIONS_DASHBOARD') ? false : true,
      stallion_dashboard_download: !valuesExist?.hasOwnProperty('STALLION_ADMIN_DASHBOARD_EXPORT_FUNCTION')? false : true,
      stallion_edit: !valuesExist?.hasOwnProperty('STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION')? false : true,
      stallion_edit_promoted_page: !valuesExist?.hasOwnProperty('STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE')? false : true,
      stallion_feehistory: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY')? false : true,
      // horse_list: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Stallion[]>([]);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [dateValue, setDateValue] = React.useState(null);
  
  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
    setOpen(false);
  }

  const { pathname } = useLocation();
  const currentPage = pathname.split("/");
  const { stallionname = '' } = useParams();

  const stallionSubModule = currentPage[5];
  const marketingSubModule = currentPage[6];
  const farmID: any = (stallionSubModule === 'filter' || stallionSubModule === 'promotedfilter' || marketingSubModule === 'marketingfilter') ? currentPage[4] : "";
  const stallionID: any = (stallionSubModule === 'edit' || stallionSubModule === 'feehistory' || stallionSubModule === 'analytics') ? currentPage[4] : (marketingSubModule === 'marketingfilter') ? currentPage[5] : "";
  const searchedStallionName: any = (currentPage[6] === 'keywordfilter' && currentPage[5] === 'Stallion') ? decodeURIComponent(currentPage[4]) : "";
  const searchedFarmName: any = (currentPage[6] === 'keywordfilter' && currentPage[5] === 'Farm') ? decodeURIComponent(currentPage[4]) : "";
  const [isStallionKeywordSearch, setIsStallionKeywordSearch] = useState((searchedStallionName === "") ? false : true);
  const [isFarmKeywordSearch, setIsFarmKeywordSearch] = useState((searchedFarmName === "") ? false : true);
  const [isKeywordSearch, setIsKeywordSearch] = useState((isStallionKeywordSearch || isFarmKeywordSearch));
  const [isFarmId, setIsFarmId] = useState((farmID === "") ? false : true);
  const isStallionPromoted = (stallionSubModule === 'promotedfilter') ? true : false;
  const [isStallionID, setIsStallionID] = useState((stallionID === "") ? false : true);
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);

  const getStallionId = pathname.search('edit') > 0 ? pathname.split('/')[4] : '';
  // Check the querystring and generate the filter payload
  useEffect(() => {
    if(isKeywordSearch) {
      if(searchedFarmName) {
        handleFilter({
          farmName: searchedFarmName?.trim(),
          isFarmNameExactSearch: true,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
      } else {
        handleFilter({
          stallionName: searchedStallionName?.trim(),
          isStallionNameExactSearch: true,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
      }
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else {
    if(isFarmId && isStallionID) {
      handleFilter({
          farmId: farmID,
          stallionId: stallionID,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else {
      if (isFarmId) {
        handleFilter({
          farmId: farmID,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        if (isFarmId && isStallionPromoted) {
          handleFilter({
            farmId: farmID,
            promoted: "Promoted",
            page: page,
            limit: limit,
            order: order,
            sortBy: orderBy,
          });
        }
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
      } else if(stallionID && pathname.search('edit') > 0) {
        handleFilter({
          stallionId: stallionID,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
        handleEditPopup();
        setRowId(stallionID);
        handleEditState();
      }else if (stallionname && stallionSubModule === 'stallionfilter') {
        handleFilter({
          stallionName:stallionname?.trim(),
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
      } else {
        setIsSearchClicked(false);
      }
    }
    }
  }, [farmID, stallionname, isKeywordSearch]);
  
  // Create state variable to record all filter data
  const [state, setStateValue] = React.useState({
    farmId: farmID,
    stallionId: stallionID,
    stallionName: (stallionname && stallionSubModule === 'stallionfilter') ? stallionname : "" || "",
    isStallionNameExactSearch: true,
    farmName: "",
    isFarmNameExactSearch: true,
    promotedStatus: isStallionPromoted ? "Promoted" : "none",
    feeUpdatedBy: "none",
    promotedStartDate: "",
    countryId: "none",
    stateId: "none",
    currency: "none",
    feeStatus: "none",
    feeYear: "none",
    sireId: "",
    grandSireName: "",
    keyAncestor: "",
    isKeyAncestorExactSearch: true,
    isIncludedFeeActive: false,
    includedFee: false,
    dateValue: null,
    createDateValue: [null, null],
    createDate: "",
    price: [0, 1000000],
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
    isPrivateTouched: false,
    isSortByClicked: false,
  })
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState(state.createDate);
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState(state.createDateValue);
  const [isDashboardData, setIsDashboardData] = useState<any>(true);
  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const [test, setTest] = useState(true);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  // Clear all filter, reset it to default
  const clearAll = () => {
    setStateValue({
      farmId: farmID,
      stallionId: stallionID,
      stallionName: "",
      isStallionNameExactSearch: true,
      farmName: "",
      isFarmNameExactSearch: true,
      promotedStatus: isStallionPromoted ? "Promoted" : "none",
      feeUpdatedBy: "none",
      promotedStartDate: "",
      countryId: "none",
      stateId: "none",
      currency: "none",
      feeStatus: "none",      
      sireId: "",
      grandSireName: "",
      keyAncestor: "",
      feeYear: "none",
      isKeyAncestorExactSearch: true,
      isIncludedFeeActive: false,
      includedFee: false,
      dateValue: null,
      createDateValue: [null, null],
      createDate: "",
      price: [0, 1000000],
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
      isPrivateTouched: false,
      isSortByClicked: false,
    });
    setConvertedCreatedRangeValue("");
    setConvertedCreatedDateValue([null, null]);
    handleRemoveFilterApplied();
    setIsSearchClicked(false);
  }

  // Check the stallion page settings
  useEffect(() => {
    if (isStallionSettingSuccess) {      
      setOrderBy(stallionSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(stallionSettings?.settingsResponse?.defaultDisplay);
    } 
    if(isSearchClicked) {
      setGetFilters(
        {
          ...getFilters,
          sortBy: stallionSettings?.settingsResponse?.defaultDisplay
        }
      );
    }
  }, [stallionSettings]);

  // Get all stallion list by some filter as payload
  const data: any = useStallionsQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked), refetchOnMountOrArgChange: true });
  
  // Get all stallion list for download by some filter as payload
  const downloadData: any = useShareStallionsQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });
  const [csvShareData, setCsvShareData] = useState<any>([]);
  
  // Generate data in csv format
  React.useEffect(() => {    
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { horseName, countryName, farmName, currencyCode, fee, last_updated, isPromoted, isActive } = item;
      const lastActiveOn: any = parseDateAsDotFormat(last_updated);
      const horseNameValue: any = toPascalCase(horseName);
      const farmNameValue: any = toPascalCase(farmName);
      tempArr.push({ horseNameValue, countryName, farmNameValue, fee: currencyCode?.substring(0, 2) + ' ' + fee, lastActiveOn, isPromoted, isActive });
    })
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  const stallionList = data?.data?.data ? data?.data?.data : [];

  // Generate stallionlist for sorting and pagination
  const stallionListProps = {
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
    setTableData(data?.data || tableData)
  }, [data])

  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");

  // Open stallion edit drawer
  const handleEditPopup = () => {
    setOpen(true);
  }

  // Close stallion edit drawer
  const handleEditPopupClose = () => {
    setOpen(false);
  }

  // Update the stallion isEdit state
  const handleEditState = () => {
    setEdit(true);
  }

  // Update the stallion isEdit state on close of drawer
  const handleCloseEditState = () => {
    setEdit(!isEdit);
  }
  const [selected, setSelected] = useState([]);
  
  // Update isFilterApplied state variable
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  // If user change the limit, reload the stallion list api with filter payload
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...({ page: 1 }),
      ...({ limit: pageLimit }),
      ...({ order: order }),
      ...({ sortBy: orderBy }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmName !== '' && { farmName: state?.farmName }),
      ...(state?.farmName !== '' && { isFarmNameExactSearch: state?.isFarmNameExactSearch }),
      ...(state?.stallionName !== '' && { stallionName: state?.stallionName }),
      ...(state?.stallionName !== '' && { isStallionNameExactSearch: state?.isStallionNameExactSearch }),
      ...(state?.promotedStatus !== 'none' && { promoted: (state?.promotedStatus) }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.currency !== 'none' && { currency: state?.currency }),
      ...(state?.feeStatus !== 'none' && { feeStatus: state?.feeStatus }),
      ...(state?.feeUpdatedBy !== 'none' && { feeUpdatedBy: state?.feeUpdatedBy }),
      ...(state?.feeYear !== 'none' && { feeYear: state?.feeYear }),
      ...(state?.sireId !== '' && { sireName: state?.sireId }),
      ...(state?.grandSireName !== '' && { GrandSireName: state?.grandSireName }),
      ...(state?.keyAncestor !== '' && { keyAncestor: state?.keyAncestor }),
      ...(state?.isIncludedFeeActive && { includePrivateFee: state?.includedFee }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && { startDate: dateHypenConvert(convertedCreatedDateValue[0])+"/"+dateHypenConvert(convertedCreatedDateValue[1]) }),
      ...(state?.dateValue !== null && { startDate: format(new Date(state?.dateValue), 'yyyy-MM-dd') }),
      ...(state?.price.join('-') !== '0-1000000' && { priceRange: state?.price[0]+"-"+state?.price[1] }),
    }
    handleFilter(datafltr)
  }

  // If user change the page number, reload the stallion list api with filter payload
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...({ page: pageNum }),
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ sortBy: orderBy }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmName !== '' && { farmName: state?.farmName }),
      ...(state?.farmName !== '' && { isFarmNameExactSearch: state?.isFarmNameExactSearch }),
      ...(state?.stallionName !== '' && { stallionName: state?.stallionName }),
      ...(state?.stallionName !== '' && { isStallionNameExactSearch: state?.isStallionNameExactSearch }),
      ...(state?.promotedStatus !== 'none' && { promoted: (state?.promotedStatus ) }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.currency !== 'none' && { currency: state?.currency }),
      ...(state?.feeStatus !== 'none' && { feeStatus: state?.feeStatus }),
      ...(state?.feeUpdatedBy !== 'none' && { feeUpdatedBy: state?.feeUpdatedBy }),
      ...(state?.feeYear !== 'none' && { feeYear: state?.feeYear }),
      ...(state?.sireId !== '' && { sireName: state?.sireId }),
      ...(state?.grandSireName !== '' && { GrandSireName: state?.grandSireName }),
      ...(state?.keyAncestor !== '' && { keyAncestor: state?.keyAncestor }),
      ...(state?.isIncludedFeeActive && { includePrivateFee: state?.includedFee }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && { startDate: dateHypenConvert(convertedCreatedDateValue[0])+"/"+dateHypenConvert(convertedCreatedDateValue[1]) }),
      ...(state?.dateValue !== null && { startDate: format(new Date(state?.dateValue), 'yyyy-MM-dd') }),
      ...(state?.price.join('-') !== '0-1000000' && { priceRange: state?.price[0]+"-"+state?.price[1] }),
    }
    handleFilter(datafltr);
  }

  // If user change the sort, reload the stallion list api with filter payload
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    setStateValue({
      ...state,
      isSortByClicked: true,
    });
    const datafltr = {
      ...({ page: page }),
      ...({ limit: limit }),
      ...({ order: isAsc ? 'DESC' : 'ASC' }),
      ...({ sortBy: property }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmName !== '' && { farmName: state?.farmName }),
      ...(state?.farmName !== '' && { isFarmNameExactSearch: state?.isFarmNameExactSearch }),
      ...(state?.stallionName !== '' && { stallionName: state?.stallionName }),
      ...(state?.stallionName !== '' && { isStallionNameExactSearch: state?.isStallionNameExactSearch }),
      ...(state?.promotedStatus !== 'none' && { promoted: (state?.promotedStatus) }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.currency !== 'none' && { currency: state?.currency }),
      ...(state?.feeStatus !== 'none' && { feeStatus: state?.feeStatus }),
      ...(state?.feeUpdatedBy !== 'none' && { feeUpdatedBy: state?.feeUpdatedBy }),
      ...(state?.feeYear !== 'none' && { feeYear: state?.feeYear }),
      ...(state?.sireId !== '' && { sireName: state?.sireId }),
      ...(state?.grandSireName !== '' && { GrandSireName: state?.grandSireName }),
      ...(state?.keyAncestor !== '' && { keyAncestor: state?.keyAncestor }),
      ...(state?.isIncludedFeeActive && { includePrivateFee: state?.includedFee }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && { startDate: dateHypenConvert(convertedCreatedDateValue[0])+"/"+dateHypenConvert(convertedCreatedDateValue[1]) }),
      ...(state?.dateValue !== null && { startDate: format(new Date(state?.dateValue), 'yyyy-MM-dd') }),
      ...(state?.price.join('-') !== '0-1000000' && { priceRange: state?.price[0]+"-"+state?.price[1] }),
    }
    handleFilter(datafltr);
  }  

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const [filterStatus, setFilterStatus] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };
  
  return (
    <StyledEngineProvider injectFirst>
      <>
        {/* Header component */}
        <DashboardHeader 
          isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} 
          apiStatus={true} setApiStatus={setApiStatus} 
          apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} 
          moduleListProps={stallionListProps}
          isSearchClicked={isSearchClicked}
        />
        <Page title="Stallions Dashboard" sx={{ display: 'flex' }} className='StallionDataDashboard'>
          {/* Stallion Filter component */}
          <StallionFilterSidebar
            handleFilter={handleFilter}
            handleFilterApplied={handleFilterApplied}
            handleRemoveFilterApplied={handleRemoveFilterApplied}
            isFilterApplied={isFilterApplied}
            rowCount={(!isFilterApplied) ? 0 : data?.data?.meta?.itemCount}
            page={page}
            limit={limit}
            isSearchClicked={isSearchClicked}
            setIsSearchClicked={setIsSearchClicked}
            state={state}
            setStateValue={setStateValue}
            convertedCreatedRangeValue={convertedCreatedRangeValue}
            setConvertedCreatedRangeValue={setConvertedCreatedRangeValue}
            convertedCreatedDateValue={convertedCreatedDateValue}
            setConvertedCreatedDateValue={setConvertedCreatedDateValue}
            isFarmId={isFarmId}
            setIsFarmId={setIsFarmId}
            handleOpenFilterParam={handleOpenFilterParam}
            defaultPageOrderBy = {defaultPageOrderBy} 
            setDefaultPageOrderBy = {setDefaultPageOrderBy}
            orderBy = {orderBy}
            setOrderBy = {setOrderBy}
            test={test}
          />
          {/* 
            Stallion data table component
            if no filter is applied or no extra query string is available in URL, render Dashboard compoenent
            if data is loading it loads spinner component
            if data is present the data table component loads
            if there is no data NoData component is loaded 
          */}
          <Box className='StallionDataDashboardRight' sx={{ width: '100%' }} px={2}>
            <Container>
              {/* Display the toaster message on post or patch request */}
              {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
              {/* Display the Stallion View Fee History  or Stallion View Analytics based on user selection */}
              {stallionSubModule === 'feehistory' || stallionSubModule === 'analytics' ?
                (stallionSubModule === 'feehistory') ? <StallionViewFeeHistory /> : <StallionViewAnalytics />
                :
                  !isSearchClicked && !isUrlFilter ? (
                  isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                   <Box className="Spinner-Wrp">
                     {/* spinner */} <Spinner />
                   </Box>
                 ) : 
                 filterCounterhook.value >= 2 && stallionModuleAccess.stallion_dashboard === false ? (
                   <UnAuthorized />
                 ) : (
                 <Box>
                   {/* By default display the stallion dashboard data if any search is happened */}
                   <DataAnalytics
                     stallionModuleAccess={stallionModuleAccess}
                     setStallionModuleAccess={setStallionModuleAccess}
                     clickedPopover={clickedPopover}
                     setClickedPopover={setClickedPopover}
                   />
                 </Box>
               )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                 <Box className="Spinner-Wrp">
                   {/* spinner */} <Spinner />
                 </Box>
               ) : filterCounterhook.value >= 2 && stallionModuleAccess.stallion_list === false ? (
                 <UnAuthorized />
               ) : !isFilterApplied ? (
                 <NoDataComponent {...stallionListProps} />
               ) : data?.isFetching ? (
                 <Box className="Spinner-Wrp">
                   {/* Load a spinner if any search is happened and api is still fetching*/}
                   <Spinner />
                 </Box>
               ) : (data.isSuccess && stallionListProps?.result?.length > 0) ?
                        <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                          <Scrollbar>
                            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                              <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                                {/* Render sortby table header */}
                                <EnhancedTableHead
                                  numSelected={selected.length}
                                  order={order}
                                  orderBy={orderBy}
                                  onRequestSort={handleRequestSort}
                                  rowCount={stallionList.length}
                                />
                                <TableBody>
                                  {/* Render stallionList data from StallionListTableRow component */}
                                  {stallionList.map((row: any, index: number) => (
                                    <StallionListTableRow
                                      key={row.stallionId}
                                      row={row}
                                      selected={row.stallionId}
                                      onSelectRow={row.stallionId}
                                      onEditPopup={() => handleEditPopup()}
                                      onSetRowId={() => setRowId(row.stallionId)}
                                      handleEditState={() => handleEditState()}
                                      open={open}
                                      stallionModuleAccess={stallionModuleAccess}
                                      setStallionModuleAccess={setStallionModuleAccess}
                                      clickedPopover={clickedPopover}
                                      setClickedPopover={setClickedPopover}
                                    />
                                  ))}
                                  {/* End Render stallionList data from StallionListTableRow component */}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Scrollbar>
                          {/* Render Pagination and limit component */}
                          <Box className={`Pagination-wrapper ${filterStatus ? 'pagination-data' : ''}`}>
                            <PaginationSettings data={stallionListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
                            <PaginationLimit data={stallionListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
                          </Box>
                          {/* End Render Pagination and limit component */}
                        </Card>
                        :
                        <NoDataComponent {...stallionListProps} />
              }
            </Container>
          </Box>
          {/* StallionNewEditModal drawer component */}
          {isEdit &&
            <StallionNewEditModal
              openAddEditForm={open}
              rowId={rowId}
              isEdit={isEdit}
              handleEditPopup={handleEditPopupClose}
              handleCloseEditState={handleCloseEditState}
              apiStatus={true}
              setApiStatus={setApiStatus}
              apiStatusMsg={apiStatusMsg}
              setApiStatusMsg={setApiStatusMsg}
              valuesExist={valuesExist}
              setValuesExist={setValuesExist}
            />
          }
          {/* Download Unauthorized Popover */}
          {clickedPopover && !stallionModuleAccess.stallion_dashboard_download && (
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
          )}
        </Page>
      </>
    </StyledEngineProvider>
  );
}