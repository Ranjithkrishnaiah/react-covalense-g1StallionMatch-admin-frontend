// @mu
import {
  Box,
  Container,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableSortLabel,
  styled,
} from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import Page from 'src/components/Page';
import './dashboard.css';
import HorseFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseFilterSidebar';
// redux
import { useDispatch } from 'react-redux';
import { useHorseQuery, useHorsesQuery } from 'src/redux/splitEndpoints/horseSplit';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// hooks
import useSettings from 'src/hooks/useSettings';
// @types
import { Horse } from 'src/@types/horse';
import Scrollbar from 'src/components/Scrollbar';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// sections
import { HorseListTableRow } from 'src/sections/@dashboard/horse/list';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DataAnalytics from 'src/sections/@dashboard/horse/DataAnalytics';
import HorseEditModal from 'src/sections/@dashboard/horse/HorseEditModal';
import HorseProgeny1 from 'src/sections/@dashboard/horse/HorseProgeny1';
import HorseProgenyFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseProgenyFilterSidebar';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import HorseCreate from './HorseCreate';
import HorseAdd from './HorseAdd';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------

// Tooltip style used in horse name column in horse list
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Horse table column names
const headCells = [
  {
    id: 'horseName',
    numeric: false,
    disablePadding: true,
    label: 'Horse',
  },
  {
    id: 'sex',
    numeric: false,
    disablePadding: true,
    label: 'Sex',
  },
  {
    id: 'yob',
    numeric: true,
    disablePadding: true,
    label: 'YOB',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'breeding',
    numeric: false,
    disablePadding: true,
    label: 'Breeding',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Created',
  },
  {
    id: 'runner',
    numeric: false,
    disablePadding: true,
    label: 'Runner',
  },
  {
    id: 'stakes',
    numeric: false,
    disablePadding: true,
    label: 'Stakes',
  },
  {
    id: 'isVerified',
    numeric: false,
    disablePadding: true,
    label: 'Verified',
  },
  {
    id: 'progeny',
    numeric: false,
    disablePadding: true,
    label: 'Progeny',
  },
];

export default function HorseData() {
  const filterCounterhook = useCounter(0);
  const [clickedPopover, setClickedPopover] = useState(false);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [horseModuleAccess, setHorseModuleAccess] = useState({
    horse_list: false,
    horse_dashboard: false,
    horse_dashboard_download: false,
    horse_list_download: false,
    horse_filter_duplicate: false,
    horse_edit_pedigree: false,
  });

  // Check permission to access the horse module
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
    if (valuesExist.hasOwnProperty('HORSE_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setHorseModuleAccess({
      ...horseModuleAccess,
      horse_list: !valuesExist?.hasOwnProperty('HORSE_ADMIN_READ_ONLY') ? false : true,
      horse_list_download: !valuesExist?.hasOwnProperty('HORSE_ADMIN_EXPORT_LISTS') ? false : true,
      horse_dashboard: !valuesExist?.hasOwnProperty('HORSE_ADMIN_VIEW_HORSE_DETAILS_DASHBOARD')
        ? false
        : true,
      horse_dashboard_download: !valuesExist?.hasOwnProperty('HORSE_ADMIN_DASHBOARD_EXPORT_FUNCTION')
        ? false
        : true,
      horse_filter_duplicate: !valuesExist?.hasOwnProperty('HORSE_ADMIN_ACCESS_TO_FIND_DUPLLICATES_FUNCTION')
        ? false
        : true,
      horse_edit_pedigree: !valuesExist?.hasOwnProperty('HORSE_ADMIN_EDIT_PEDIGREE_OF_EXISTING_HORSE')
        ? false
        : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);
  // console.log(horseModuleAccess, 'valuesExisthorse')

  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('horseName');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('horseName');
  const [showAddModal, setShowAddModal] = useState(false);

  const { pathname } = useLocation();
  const isNewOrEdit = pathname.includes('/edit') || pathname.includes('/new');
  const isNewStallionRequest = pathname.includes('/addnewforstallion');
  const isNewMareRequest = pathname.includes('/addnewformare');
  const isNewSalesHorseRequest = pathname.includes('/add');
  const isNewHorseRequest = (isNewStallionRequest) ? isNewStallionRequest : (isNewMareRequest) ? isNewMareRequest : isNewSalesHorseRequest ? isNewSalesHorseRequest : false;

  const currentPage = pathname.split('/');
  const horseSubModule = currentPage[5];
  const horseID: any = horseSubModule === 'progeny' ? currentPage[4] : '';
  const { id = '', horsename = '' } = useParams();
  const [progenyTotal, setProgenyTotal] = useState(0);
  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);

  // Check the querystring and generate the filter payload
  useEffect(() => {
    if (horsename && horseSubModule === 'horsefilter') {
      handleFilter({
        horseName: horsename,
        isHorseNameExactSearch: false,
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
  }, [horsename]);

  const toggleAddModal = (value: boolean) => {
    setShowAddModal(value);
  };

  // Method to display table header with sorting
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead className="horseTableHead">
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
                {headCell.label === 'Horse' ? (
                  <Box className="tooltipPopoverbox">
                    <HtmlTooltip
                      className="tableTooltip"
                      title={
                        <React.Fragment>
                          <Box className="tooltipPopoverBody HorseDetailsPopover">
                            <p>
                              <i className="popover-circle yellow"></i> Unverified Horse
                            </p>
                            <p>
                              <i className="popover-circle red"></i> Missing Information
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
            {!horseModuleAccess.horse_list_download && (
              <i
                className={'icon-Share'}
                onClick={() => setClickedPopover(true)}
                style={{ cursor: 'pointer' }}
              />
            )}
            {horseModuleAccess.horse_list_download && (
              <i className={'icon-Share'} style={{ cursor: 'pointer' }} />
            )}
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<Horse[]>([]);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [dateValue, setDateValue] = React.useState(null);

  // Set the member payload if filter is choosen
  const handleFilter = (value: any) => {
    setGetFilters(value);
    setPage(value.page);
  };

  // upadte the IsFilterApplied state if filter is choosen
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  // Update isFilterApplied state variable
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
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

  // Create state variable to record all filter data
  const [state, setStateValue] = React.useState({
    horseName: horsename && horseSubModule === 'horsefilter' ? horsename : '' || '',
    isHorseNameExactSearch: horsename && horseSubModule === 'horsefilter' ? false : true,
    sireName: '',
    isSireNameExactSearch: true,
    damName: '',
    isDamNameExactSearch: true,
    sireId: '',
    countryId: null,
    countryName: { countryName: '' },
    stateId: 'none',
    eligibility: 'none',
    horseBreed: null,
    horseTypeName: { horseTypeName: '' },
    stakesStatus: 'none',
    runnerStatus: 'none',
    accuracyProfile: 'none',
    sireStatus: 'none',
    damStatus: 'none',
    createdBy: null,
    missingYob: false,
    missingCob: false,
    unVerified: false,
    isMissingYobClicked: false,
    isMissingCobClicked: false,
    isUnverifiedClicked: false,
    YobDate: '',
    yobDateValue: [null, null],
    createDate: '',
    createDateValue: [null, null],
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
    isSortByClicked: false,
  });

  // Clear all filter, reset it to default
  const clearAll = () => {
    setStateValue({
      horseName: '',
      isHorseNameExactSearch: true,
      sireName: '',
      isSireNameExactSearch: true,
      damName: '',
      isDamNameExactSearch: true,
      sireId: '',
      countryId: null,
      countryName: { countryName: '' },
      stateId: 'none',
      eligibility: 'none',
      horseBreed: null,
      horseTypeName: { horseTypeName: '' },
      stakesStatus: 'none',
      runnerStatus: 'none',
      accuracyProfile: 'none',
      sireStatus: 'none',
      damStatus: 'none',
      createdBy: null,
      missingYob: false,
      missingCob: false,
      unVerified: false,
      isMissingYobClicked: false,
      isMissingCobClicked: false,
      isUnverifiedClicked: false,
      YobDate: '',
      yobDateValue: [null, null],
      createDate: '',
      createDateValue: [null, null],
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
      isSortByClicked: false,
    });
    setIsSearchClicked(false);
    handleRemoveFilterApplied();
  };

  const selectedFarmSettings = {
    defaultDisplay: 'horseName',
    defaultGeneration: 6,
    source: [],
    verifyStatus: '',
    breed: '',
    startDate: '',
  };

  // Horse settings api call
  const pageId = process.env.REACT_APP_HORSE_PAGE_ID;
  const {
    data: horseSettings,
    isFetching: isHorseSettingFetching,
    isLoading: isHorseSettingLoading,
    isSuccess: isHorseSettingSuccess,
  } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [loadingData, setLoadingData] = useState<any>(false);

  useEffect(() => {
    window.onbeforeunload = function () {
      window.localStorage.setItem('comingFromEditScreen', JSON.stringify(false));

      return null;
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  // Check the horse page settings
  useEffect(() => {
    if (isHorseSettingSuccess) {
      setOrderBy(horseSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value);
      setDefaultPageOrderBy(horseSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value);
    }
    if (isSearchClicked) {
      setGetFilters({
        ...getFilters,
        sortBy: horseSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value,
      });
    }
  }, [horseSettings]);

  useEffect(() => {
    let comingFromEditScreen: any = window.localStorage.getItem('comingFromEditScreen');
    let comingFromEditScreenFilter: any = window.localStorage.getItem('comingFromEditScreenFilter');
    // console.log(JSON.parse(comingFromEditScreen),comingFromEditScreenFilter,'comingFromEditScreenFilter')
    if (JSON.parse(comingFromEditScreen) === true) {
      setIsFilterApplied(true);
      setIsSearchClicked(true);
      setGetFilters(JSON.parse(comingFromEditScreenFilter));
      setTimeout(() => {
        window.localStorage.setItem('comingFromEditScreen', JSON.stringify(false));
      }, 1000);
    }
  }, []);

  // Get all horse list by some filter as payload
  const data: any = useHorsesQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
    refetchOnMountOrArgChange: true,
  });
  let horseList = data?.data?.data ? data?.data?.data : [];

  const horseListProps = {
    page: page,
    setPage,
    result: horseList,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
    clearAll,
  };

  useEffect(() => {
    if (selectedFarmSettings?.breed || selectedFarmSettings?.verifyStatus === 'unverified') {
      setStateValue({
        ...state,
        // horseBreed: selectedFarmSettings?.breed || 'none',
        unVerified: selectedFarmSettings?.verifyStatus === 'unverified',
      });
    }
  }, [selectedFarmSettings]);

  useEffect(() => {
    setTableData(data?.data || tableData);
    if (data?.status !== 'pending') {
      setLoadingData(false);
    }
  }, [data]);

  // routing to horse edit page
  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.horsedetails.edit(id));
    window.localStorage.setItem('comingFromEditScreen', JSON.stringify(true));
    window.localStorage.setItem('comingFromEditScreenFilter', JSON.stringify(getFilters));
  };

  // routing to race page
  const gotoRace = () => {
    navigate(PATH_DASHBOARD.race.data);
  };

  // routing to horse dashboard page
  const gotoDashboard = () => {
    clearAll();
    navigate(PATH_DASHBOARD.horsedetails.data);
  };

  // If user change the limit, reload the horse list api with filter payload
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...{ page: 1 },
      ...{ limit: pageLimit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state.YobDate !== '' && { yob: state?.YobDate }),
      ...(state.createDate !== '' && { createdDate: state?.createDate }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== null && { horseType: state?.horseBreed }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy !== null && { createdBy: state?.createdBy }),
      ...(state?.isMissingYobClicked && { missingYob: state?.missingYob }),
      ...(state?.isMissingCobClicked && { missingCob: state?.missingCob }),
      ...(state?.isUnverifiedClicked && { unVerified: state?.unVerified }),
    };
    handleFilter(datafltr);
    setLoadingData(true);
  };

  // If user change the page number, reload the horse list api with filter payload
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...{ page: pageNum },
      ...{ limit: limit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state.YobDate !== '' && { yob: state?.YobDate }),
      ...(state.createDate !== '' && { createdDate: state?.createDate }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== null && {
        horseType: state?.horseBreed,
      }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy !== null && { createdBy: state?.createdBy }),
      ...(state?.isMissingYobClicked && { missingYob: state?.missingYob }),
      ...(state?.isMissingCobClicked && { missingCob: state?.missingCob }),
      ...(state?.isUnverifiedClicked && { unVerified: state?.unVerified }),
    };
    handleFilter(datafltr);
    setLoadingData(true);
  };

  // If user change the sort, reload the horse list api with filter payload
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    setStateValue({
      ...state,
      isSortByClicked: true,
    });
    const datafltr = {
      ...{ page: 1 },
      ...{ limit: limit },
      ...{ order: isAsc ? 'DESC' : 'ASC' },
      ...{ sortBy: property },
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state.YobDate !== '' && { yob: state?.YobDate }),
      ...(state.createDate !== '' && { createdDate: state?.createDate }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== null && { horseType: state?.horseBreed }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy !== null && { createdBy: state?.createdBy }),
      ...(state?.isMissingYobClicked && { missingYob: state?.missingYob }),
      ...(state?.isMissingCobClicked && { missingCob: state?.missingCob }),
      ...(state?.isUnverifiedClicked && { unVerified: state?.unVerified }),
    };
    handleFilter(datafltr);
    setLoadingData(true);
  };
  const [selected, setSelected] = useState([]);
  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = horseList.map((n: any) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const [apiStatus, setApiStatus] = useState(false);
  const { themeLayout } = useSettings();

  const isEdit = pathname.includes('edit');
  const horseResponse = useHorseQuery(id, { skip: !isEdit });
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [openHeader, setOpenHeader] = useState(false);
  const [filterStatus, setFilterStatus] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };

  return (
    <>
      {(isNewOrEdit === true && isNewHorseRequest === false) && <HorseCreate />}
      {(isNewHorseRequest === true && isNewOrEdit === false) && <HorseAdd />}
      {/* Header component */}
      {(isNewOrEdit === false && isNewHorseRequest === false) && (
        <>
          <DashboardHeader
            handleShowAddHorse={toggleAddModal}
            isCollapse={isCollapse}
            onOpenSidebar={() => setOpenHeader(true)}
            apiStatus={true}
            setApiStatus={setApiStatus}
            apiStatusMsg={apiStatusMsg}
            setApiStatusMsg={setApiStatusMsg}
            moduleListProps={horseListProps}
            isSearchClicked={isSearchClicked}
          />
          <Page title="Horse List" sx={{ display: 'flex' }} className="HorseDataDashboard">
            {/* Based on condition, it render edit page or Horse Filter or Prgeny filter component */}
            {showAddModal ? (
              <HorseEditModal
                horseId={id}
                currentHorse={horseResponse?.data}
                isEdit={isEdit}
                genId={0}
                progenyId={0}
                apiStatus={true}
                setApiStatus={setApiStatus}
                apiStatusMsg={apiStatusMsg}
                setApiStatusMsg={setApiStatusMsg}
                toggleAddModal={toggleAddModal}
                showAddModal={showAddModal}
              />
            ) : horseSubModule === 'progeny' ? (
              <HorseProgenyFilterSidebar
                state={state}
                setStateValue={setStateValue}
                progenyTotal={progenyTotal}
                setProgenyTotal={setProgenyTotal}
              />
            ) : (
              <HorseFilterSidebar
                handleFilter={handleFilter}
                handleFilterApplied={handleFilterApplied}
                handleRemoveFilterApplied={handleRemoveFilterApplied}
                isFilterApplied={isFilterApplied}
                rowCount={!isFilterApplied ? 0 : data?.data?.meta?.itemCount}
                horseModuleAccess={horseModuleAccess}
                page={page}
                limit={limit}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                order={order}
                setOrder={setOrder}
                isSearchClicked={isSearchClicked}
                setIsSearchClicked={setIsSearchClicked}
                state={state}
                setStateValue={setStateValue}
                defaultPageOrderBy={defaultPageOrderBy}
                setDefaultPageOrderBy={setDefaultPageOrderBy}
                handleOpenFilterParam={handleOpenFilterParam}
              />
            )}

            {/* 
            Horse data table component
            if no filter is applied or no extra query string is available in URL, render Dashboard compoenent
            if data is loading it loads spinner component
            if data is present the data table component loads
            if there is no data NoData component is loaded 
          */}
            <Box className="HorseDataDashboardRight" px={2}>
              <Container>
                {/* Display the toaster message on post or patch request */}
                {apiStatus && (
                  <CustomToasterMessage
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                  />
                )}
                {horseSubModule === 'progeny' ? (
                  <HorseProgeny1
                    state={state}
                    setStateValue={setStateValue}
                    progenyTotal={progenyTotal}
                    setProgenyTotal={setProgenyTotal}
                  />
                ) : !isSearchClicked ? (
                  isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                    <Box className="Spinner-Wrp">
                      {/* spinner */} <Spinner />
                    </Box>
                  ) :
                    filterCounterhook.value >= 2 && horseModuleAccess.horse_dashboard === false ? (
                      <UnAuthorized />
                    ) : (
                      <Box>
                        <DataAnalytics
                          horseModuleAccess={horseModuleAccess}
                          setHorseModuleAccess={setHorseModuleAccess}
                          clickedPopover={clickedPopover}
                          setClickedPopover={setClickedPopover}
                        />
                      </Box>
                    )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                      <Box className="Spinner-Wrp">
                        {/* spinner */} <Spinner />
                      </Box>
                    ) : filterCounterhook.value >= 2 && horseModuleAccess.horse_list === false ? (
                      <UnAuthorized />
                    ) : !isFilterApplied ? (
                      <NoDataComponent {...horseListProps} />
                    ) : data?.isFetching ? (
                      <Box className="Spinner-Wrp">
                        {' '}
                        <Spinner />{' '}
                      </Box>
                    ) : horseList?.length > 0 ? (
                      <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                        {loadingData ? (
                          <Box className="Spinner-Wrp" sx={{ minHeight: 350 }}>
                            {' '}
                            <Spinner />{' '}
                          </Box>
                        ) : (
                          <Scrollbar>
                            <TableContainer className="datalist" sx={{ minWidth: 800 }}>
                              <Table
                                sx={{
                                  borderCollapse: 'separate',
                                  borderSpacing: '0 4px',
                                  background: '#FAF8F7',
                                }}
                              >
                                {/* Render sortby table header */}
                                <EnhancedTableHead
                                  numSelected={selected.length}
                                  order={order}
                                  orderBy={orderBy}
                                  onRequestSort={handleRequestSort}
                                  rowCount={horseList.length}
                                />
                                {/* End Render sortby table header */}
                                <TableBody>
                                  {/* Render horseList data from MemberListTableRow component */}
                                  {horseList.map((row: any, index: number) => (
                                    <HorseListTableRow
                                      key={row.horseId}
                                      row={row}
                                      selected={row.horseId}
                                      onEditRow={() => handleEditRow(row.horseId)}
                                      gotoRace={gotoRace}
                                      gotoDashboard={gotoDashboard}
                                      isProgenyPage={false}
                                    />
                                  ))}
                                  {/* End Render horseList data from MemberListTableRow component */}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Scrollbar>
                        )}
                        {/* Render Pagination and limit component */}
                        <Box className={`Pagination-wrapper ${filterStatus ? 'pagination-data' : ''}`}>
                          <PaginationSettings
                            data={horseListProps}
                            handleRequestPagination={handleRequestPagination}
                            limit={limit}
                            setLimit={setLimit}
                          />
                          <PaginationLimit
                            data={horseListProps}
                            handleRequestPaginationLimit={handleRequestPaginationLimit}
                            limit={limit}
                            setLimit={setLimit}
                          />
                        </Box>
                        {/* End Render Pagination and limit component */}
                      </Card>
                    ) : (
                  <NoDataComponent {...horseListProps} />
                )}
              </Container>
            </Box>
            {/* Download Unauthorized Popover */}
            {clickedPopover && !horseModuleAccess.horse_dashboard_download && (
              <DownloadUnauthorizedPopover
                clickedPopover={clickedPopover}
                setClickedPopover={setClickedPopover}
              />
            )}
          </Page>
        </>
      )}
    </>
  );
}
