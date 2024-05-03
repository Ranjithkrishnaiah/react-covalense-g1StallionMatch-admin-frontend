import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
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
import Page from 'src/components/Page';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import './dashboard.css';
import MembersFilterSidebar from 'src/sections/@dashboard/member/filter/MembersFilterSidebar';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useMembersQuery, useShareMemberQuery } from 'src/redux/splitEndpoints/memberSplit';
// hooks
import useSettings from 'src/hooks/useSettings';
// @types
import { Member } from 'src/@types/member';
import Scrollbar from 'src/components/Scrollbar';
// sections
import { MemberListTableRow } from 'src/sections/@dashboard/member/list';
import MembersEditModal from 'src/sections/@dashboard/member/MembersEditModal';
import { Spinner } from 'src/components/Spinner';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { visuallyHidden } from '@mui/utils';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DataAnalytics from 'src/sections/@dashboard/member/DataAnalytics';
import { dateHypenConvert, parseDateAsDotFormat } from 'src/utils/customFunctions';
import { useLocation, useParams } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import CsvLink from 'react-csv-export';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

// ----------------------------------------------------------------------

// Tooltip style used in member name column in member list
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Member table column names
const headCells = [
  {
    id: 'fullName',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'emailAddress',
    numeric: false,
    disablePadding: true,
    label: 'Email',
  },
  {
    id: 'countryCode',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'memberSince',
    numeric: false,
    disablePadding: true,
    label: 'Member Since',
  },
  {
    id: 'lastActive',
    numeric: false,
    disablePadding: true,
    label: 'Last Active',
  },
  {
    id: 'roleName',
    numeric: false,
    disablePadding: true,
    label: 'Access Level',
  },
  {
    id: 'isVerified',
    numeric: false,
    disablePadding: true,
    label: 'Verified',
  },
];

export default function MemberData() {
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [memberModuleAccess, setMemberModuleAccess] = useState({
    member_list: false,
    member_dashboard: false,
    member_dashboard_download: false,
    member_list_download: false,
    member_edit: false,
    member_reset: false,
    member_resend: false,
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
    if (valuesExist.hasOwnProperty('MEMBER_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setMemberModuleAccess({
      ...memberModuleAccess,
      member_list: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_READ_ONLY') ? false : true,
      member_list_download: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_EXPORT_LISTS') ? false : true,
      member_dashboard: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD') ? false : true,
      member_dashboard_download: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_DASHBOARD_EXPORT_FUNCTION')? false : true,
      member_edit: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_EDIT_MEMBER_DETAILS')? false : true,
      member_reset: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_RESET_PASSWORD')? false : true,
      member_resend: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_RESEND_VERIFICATION_EMAIL')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  // Member settings api call
  const pageId = process.env.REACT_APP_MEMBER_PAGE_ID;
  const {
    data: memberSettings,
    isFetching: isMemberSettingFetching,
    isLoading: isMemberSettingLoading,
    isSuccess: isMemberSettingSuccess,
  } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('memberSince');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('memberSince');

  // Method to display table header with sorting
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead className="memberTableHead">
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
                              <i className="popover-circle yellow"></i> Suspended
                            </p>
                            <p>
                              <i className="popover-circle red"></i> Closed
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
            <CsvLink data={csvShareData} fileName={`Member_Data (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }
  const { name: memberName = '', horseId, favourite } = useParams();
  const { pathname } = useLocation();
  const currentPage = pathname.split('/');
  const memberSubModule = currentPage[5];
  const farmID: any = memberSubModule === 'filter' ? currentPage[4] : '';
  const searchedMemberName: any =
    memberSubModule === 'userFilter' ? decodeURIComponent(currentPage[4]) : '';
  const [isKeywordSearch, setIsKeywordSearch] = useState(searchedMemberName === '' ? false : true);

  const [isFarmId, setIsFarmId] = useState(farmID === '' ? false : true);
  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);

  // Check the querystring and generate the filter payload
  useEffect(() => {
    if (isKeywordSearch) {
      handleFilter({
        name: searchedMemberName?.trim(),
        isNameExactSearch: true,
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
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
      } else if (memberName) {
        handleFilter({
          name: memberName?.trim(),
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
      } else if (horseId && favourite) {
        handleFilter({
          horseId: horseId,
          favourite: favourite,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        setStateValue({
          ...state,
          horseId: horseId,
          favourite: favourite,
        });
        handleFilterApplied();
        setIsSearchClicked(true);
        setIsUrlFilter(true);
      } else {
        setIsSearchClicked(false);
      }
    }
  }, [farmID, isKeywordSearch]);

  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Member[]>([]);

  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [filterStatus, setFilterStatus] = useState(false);
  const [dateValue, setDateValue] = React.useState(null);

  // Set the member payload if filter is choosen
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  // upadte the IsFilterApplied state if filter is choosen
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);

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
      name: '',
      isNameExactSearch: true,
      emailAddress: '',
      isEmailExactSearch: true,
      countryId: null,
      countryName: { countryName: '' },
      verified: 'none',
      socialAccounts: 'none',
      paymentMethods: 'none',
      previousOrders: null,
      farmUser: 'none',
      accessLevel: 'none',
      status: 'none',
      myHorseTracking: 'none',
      searchActivity: 'none',
      searchShare: 'none',
      createDateValue: [null, null],
      createDate: '',
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
      isSortByClicked: false,
      favourite: '',
      horseId: '',
    });
    setConvertedCreatedRangeValue('');
    setConvertedCreatedDateValue([null, null]);
    handleRemoveFilterApplied();
    setIsSearchClicked(false);
    navigate(PATH_DASHBOARD.members.data);
  };

  // Check the member page settings
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  useEffect(() => {
    if (isMemberSettingSuccess) {
      setOrderBy(memberSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(memberSettings?.settingsResponse?.defaultDisplay);
    }
    if (isSearchClicked) {
      setGetFilters({
        ...getFilters,
        sortBy: memberSettings?.settingsResponse?.defaultDisplay,
      });
    }
  }, [memberSettings]);

  // Get all member list by some filter as payload
  const data = useMembersQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
    refetchOnMountOrArgChange: true,
  });
  const memberList = data?.data?.data ? data?.data?.data : [];

  const memberListProps = {
    page: page == 0 ? 1 : page,
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

  const handleEditPopup = () => {
    setOpen(!open);
  };

  const handleEditState = () => {
    setEdit(true);
  };

  const handleCloseEditState = () => {
    setEdit(!isEdit);
  };
  const [selected, setSelected] = useState([]);

  // Create state variable to record all filter data
  const [state, setStateValue] = React.useState({
    farmId: farmID,
    name: '',
    isNameExactSearch: true,
    emailAddress: '',
    isEmailExactSearch: true,
    countryId: null,
    countryName: { countryName: '' },
    verified: 'none',
    socialAccounts: 'none',
    paymentMethods: 'none',
    previousOrders: null,
    farmUser: 'none',
    accessLevel: 'none',
    status: 'none',
    myHorseTracking: 'none',
    searchActivity: 'none',
    searchShare: 'none',
    createDateValue: [null, null],
    createDate: '',
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
    isSortByClicked: false,
    favourite: '',
    horseId: '',
  });

  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState(
    state.createDate
  );
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState(
    state.createDateValue
  );

  // If user change the limit, reload the member list api with filter payload
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...{ page: 1 },
      ...{ limit: pageLimit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.name !== '' && { name: state?.name }),
      ...(state?.name !== '' && { isNameExactSearch: state?.name }),
      ...(state?.favourite !== '' && { favourite: state?.favourite }),
      ...(state?.horseId !== '' && { horseId: state?.horseId }),
      ...(state?.emailAddress !== '' && { emailAddress: state?.emailAddress }),
      ...(state?.emailAddress !== '' && { isEmailExactSearch: state?.isEmailExactSearch }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(state?.verified !== 'none' && { verified: state?.verified }),
      ...(state?.socialAccounts !== 'none' && { socialAccounts: state?.socialAccounts }),
      ...(state?.paymentMethods !== 'none' && { paymentMethods: state?.paymentMethods }),
      ...(state?.previousOrders !== null && { previousOrders: state?.previousOrders }),
      ...(state?.farmUser !== 'none' && { farmUser: state?.farmUser }),
      ...(state?.accessLevel !== 'none' && { accessLevel: state?.accessLevel }),
      ...(state?.status !== 'none' && { statusId: state?.status }),
      ...(state?.myHorseTracking !== 'none' && { myHorseTracking: state?.myHorseTracking }),
      ...(state?.searchActivity !== 'none' && { activity: state?.searchActivity }),
      ...(state?.searchShare !== 'none' && { socialShare: state?.searchShare }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
    };
    handleFilter(datafltr);
  };

  // If user change the page number, reload the member list api with filter payload
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...{ page: pageNum },
      ...{ limit: limit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.name !== '' && { name: state?.name }),
      ...(state?.name !== '' && { isNameExactSearch: state?.name }),
      ...(state?.favourite !== '' && { favourite: state?.favourite }),
      ...(state?.horseId !== '' && { horseId: state?.horseId }),
      ...(state?.emailAddress !== '' && { emailAddress: state?.emailAddress }),
      ...(state?.emailAddress !== '' && { isEmailExactSearch: state?.isEmailExactSearch }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(state?.verified !== 'none' && { verified: state?.verified }),
      ...(state?.socialAccounts !== 'none' && { socialAccounts: state?.socialAccounts }),
      ...(state?.paymentMethods !== 'none' && { paymentMethods: state?.paymentMethods }),
      ...(state?.previousOrders !== null && { previousOrders: state?.previousOrders }),
      ...(state?.farmUser !== 'none' && { farmUser: state?.farmUser }),
      ...(state?.accessLevel !== 'none' && { accessLevel: state?.accessLevel }),
      ...(state?.status !== 'none' && { statusId: state?.status }),
      ...(state?.myHorseTracking !== 'none' && { myHorseTracking: state?.myHorseTracking }),
      ...(state?.searchActivity !== 'none' && { activity: state?.searchActivity }),
      ...(state?.searchShare !== 'none' && { socialShare: state?.searchShare }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
    };
    handleFilter(datafltr);
  };

  // If user change the sort, reload the member list api with filter payload
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
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.name !== '' && { name: state?.name }),
      ...(state?.name !== '' && { isNameExactSearch: state?.name }),
      ...(state?.favourite !== '' && { favourite: state?.favourite }),
      ...(state?.horseId !== '' && { horseId: state?.horseId }),
      ...(state?.emailAddress !== '' && { emailAddress: state?.emailAddress }),
      ...(state?.emailAddress !== '' && { isEmailExactSearch: state?.isEmailExactSearch }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(state?.verified !== 'none' && { verified: state?.verified }),
      ...(state?.socialAccounts !== 'none' && { socialAccounts: state?.socialAccounts }),
      ...(state?.paymentMethods !== 'none' && { paymentMethods: state?.paymentMethods }),
      ...(state?.previousOrders !== '' && { previousOrders: state?.previousOrders }),
      ...(state?.farmUser !== 'none' && { farmUser: state?.farmUser }),
      ...(state?.accessLevel !== 'none' && { accessLevel: state?.accessLevel }),
      ...(state?.status !== 'none' && { statusId: state?.status }),
      ...(state?.myHorseTracking !== 'none' && { myHorseTracking: state?.myHorseTracking }),
      ...(state?.searchActivity !== 'none' && { activity: state?.searchActivity }),
      ...(state?.searchShare !== 'none' && { socialShare: state?.searchShare }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
    };
    handleFilter(datafltr);
  };

  // Update isFilterApplied state variable
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };

  // Get all stallion list for download by some filter as payload
  const downloadData: any = useShareMemberQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
  });
  const [csvShareData, setCsvShareData] = useState<any>([]);

  // Generate data in csv format
  React.useEffect(() => {
    let permission = '';
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let {
        fullName,
        emailAddress,
        countryCode,
        memberSince,
        lastActive,
        isVerified,
        accessLevel,
      } = item;
      switch (accessLevel) {
        case 1:
          permission = 'Full Access';
          break;
        case 2:
          permission = 'View Only';
          break;
        case 3:
          permission = 'Third Party';
          break;
      }
      const lastActiveOn: any = parseDateAsDotFormat(lastActive);
      const memberSinceOn: any = parseDateAsDotFormat(memberSince);
      tempArr.push({
        fullName,
        emailAddress,
        countryCode,
        memberSinceOn,
        lastActiveOn,
        permission,
        isVerified,
      });
    });
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  
  return (
    <>
      {/* Header component */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
        moduleListProps={memberListProps}
        isSearchClicked={isSearchClicked}
      />
      <Page title="Member Dashboard" sx={{ display: 'flex' }} className="MemberDataDashboard">
        {/* Member Filter component */}
        <MembersFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
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
          state={state}
          setStateValue={setStateValue}
          convertedCreatedRangeValue={convertedCreatedRangeValue}
          setConvertedCreatedRangeValue={setConvertedCreatedRangeValue}
          convertedCreatedDateValue={convertedCreatedDateValue}
          setConvertedCreatedDateValue={setConvertedCreatedDateValue}
          handleOpenFilterParam={handleOpenFilterParam}
          defaultPageOrderBy={defaultPageOrderBy}
          setDefaultPageOrderBy={setDefaultPageOrderBy}
        />
        {/* 
            Member data table component
            if no filter is applied or no extra query string is available in URL, render Dashboard compoenent
            if data is loading it loads spinner component
            if data is present the data table component loads
            if there is no data NoData component is loaded 
          */}
        <Box className="MemberDataDashboardRight" sx={{ width: '100%' }} px={2}>
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
            {!isSearchClicked ? (
               isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                <Box className="Spinner-Wrp">
                  {/* spinner */} <Spinner />
                </Box>
              ) : 
              filterCounterhook.value >= 2 && memberModuleAccess.member_dashboard === false ? (
                <UnAuthorized />
              ) : (
              <Box>
                {/* By default display the stallion dashboard data if any search is happened */}
                <DataAnalytics 
                  filterStatus={filterStatus} 
                  memberModuleAccess={memberModuleAccess}
                  setMemberModuleAccess={setMemberModuleAccess}
                  clickedPopover={clickedPopover}
                  setClickedPopover={setClickedPopover}
                />
              </Box>
            )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
              <Box className="Spinner-Wrp">
                {/* spinner */} <Spinner />
              </Box>
            ) : filterCounterhook.value >= 2 && memberModuleAccess.member_list === false ? (
              <UnAuthorized />
            ) : !isFilterApplied ? (
              <NoDataComponent {...memberListProps} />
            ) : data?.isFetching ? (
              <Box className="Spinner-Wrp">
                {/* Load a spinner if any search is happened and api is still fetching*/}
                <Spinner />
              </Box>
            ) : memberListProps?.result?.length > 0 ? (
              <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
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
                        rowCount={memberList.length}
                      />
                      {/* End Render sortby table header */}
                      <TableBody>
                        {/* Render memberList data from MemberListTableRow component */}
                        {memberList.map((row: any, index: number) => (
                          <MemberListTableRow
                            key={row.memberUuid}
                            row={row}
                            selected={row.memberUuid}
                            onSelectRow={row.memberUuid}
                            onEditPopup={() => handleEditPopup()}
                            onSetRowId={() => setRowId(row.memberUuid)}
                            handleEditState={() => handleEditState()}
                            apiStatus={true}
                            setApiStatus={setApiStatus}
                            apiStatusMsg={apiStatusMsg}
                            setApiStatusMsg={setApiStatusMsg}
                            memberModuleAccess={memberModuleAccess}
                            setMemberModuleAccess={setMemberModuleAccess}
                            clickedPopover={clickedPopover}
                            setClickedPopover={setClickedPopover}
                          />
                        ))}
                        {/* End Render memberList data from MemberListTableRow component */}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
                {/* Render Pagination and limit component */}
                <Box className="Pagination-wrapper">
                  <PaginationSettings
                    data={memberListProps}
                    handleRequestPagination={handleRequestPagination}
                    limit={limit}
                    setLimit={setLimit}
                  />
                  <PaginationLimit
                    data={memberListProps}
                    handleRequestPaginationLimit={handleRequestPaginationLimit}
                    limit={limit}
                    setLimit={setLimit}
                  />
                </Box>
                {/* End Render Pagination and limit component */}
              </Card>
            ) : (
              <NoDataComponent {...memberListProps} />
            )}
          </Container>
        </Box>
        <MembersEditModal
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
        {/* Download Unauthorized Popover */}
        {clickedPopover && !memberModuleAccess.member_dashboard_download && (
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
        )}
      </Page>
    </>
  );
}
