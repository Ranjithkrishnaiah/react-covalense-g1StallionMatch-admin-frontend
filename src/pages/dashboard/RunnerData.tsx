import { useEffect, useRef, useState } from 'react';
//react-csv-export
import CsvLink from 'react-csv-export';
// @mui
import { Box, Typography, Container, Grid, Stack, Divider, MenuItem, Button, Card, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import Page from 'src/components/Page';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
// Components
import DashboardHeader from 'src/layouts/dashboard/header';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import './dashboard.css'
import RunnerFilterSidebar from 'src/sections/@dashboard/runner/filter/RunnerFilterSidebar';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import { Spinner } from 'src/components/Spinner';
import Scrollbar from 'src/components/Scrollbar';
import { useRunnersQuery, useShareRunnersQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import { RunnerListTableRow } from 'src/sections/@dashboard/runner/list';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import RunnerNewEditModal from 'src/sections/@dashboard/runner/RunnerNewEditModal';
import DataAnalytics from 'src/sections/@dashboard/runner/DataAnalytics';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { useLocation, useParams } from 'react-router';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

export default function RunnerData() {
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [raceAndRunnerModuleAccess, setRaceAndRunnerModuleAccess] = useState({
    raceAndRunner_list: false,
    raceAndRunner_dashboard: false,
    raceAndRunner_dashboard_download: false,
    raceAndRunner_list_download: false,
    raceAndRunner_edit: false,
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

  useEffect(() => {
    if (valuesExist.hasOwnProperty('RACE_RUNNER_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setRaceAndRunnerModuleAccess({
      ...raceAndRunnerModuleAccess,
      raceAndRunner_list: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_SEARCH_VIEW_READONLY') ? false : true,
      raceAndRunner_list_download: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_EXPORT_LIST') ? false : true,
      raceAndRunner_dashboard: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_DASHBOARD_VIEW_READONLY') ? false : true,
      raceAndRunner_dashboard_download: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_DASHBOARD_EXPORT_FUNCTION')? false : true,
      raceAndRunner_edit: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const pageId = process.env.REACT_APP_RUNNER_PAGE_ID;
  const filterRef = useRef<any>(null);
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [getFilters, setGetFilters] = useState({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [clear, setClear] = useState<any>(false);
  const [openHeader, setOpenHeader] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [orderBy, setOrderBy] = useState('raceId');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('raceId');
  const [order, setOrder] = useState('ASC');
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const [isIncludedFeeActive, setIsIncludedFeeActive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [state, setStateValue] = useState({
    page: page,
    limit: limit,
    sortBy: orderBy,
    order: order,
  });

  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };
  const [csvShareData, setCsvShareData] = useState<any>([]);

  const { pathname } = useLocation();
  const currentPage = pathname.split("/");
  const runnerSubModule = currentPage[5];
  const searchedRunnerName: any = (runnerSubModule === 'runnerfilter') ? decodeURIComponent(currentPage[4]) : "";
  const [isKeywordSearch, setIsKeywordSearch] = useState((searchedRunnerName === "") ? false : true);

  // Check the querystring and generate the filter payload
  useEffect(() => {
    if(isKeywordSearch) {
      handleFilter({
        name: searchedRunnerName?.trim(),
        isNameExactSearch: true,
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
      });
      handleFilterApplied();
      setIsSearchClicked(true);
    } 
  }, [isKeywordSearch]);

  // Aapi call
  const data = useRunnersQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });
  const runnerList = data?.data?.data ? data?.data?.data : [];
  const downloadData: any = useShareRunnersQuery(isFilterApplied ? getFilters : newState, { skip: (!isShareClicked) });

  const { data: runnersSettings, isFetching: isRunnersSettingFetching, isLoading: isRunnersSettingLoading, isSuccess: isRunnersSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  // Check the horse page settings
  useEffect(() => {
    if (isRunnersSettingSuccess) {
      setOrderBy(runnersSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(runnersSettings?.settingsResponse?.defaultDisplay);
    }
    if (isSearchClicked) {
      setGetFilters(
        {
          ...getFilters,
          sortBy: runnersSettings?.settingsResponse?.defaultDisplay
        }
      );
    }
  }, [runnersSettings]);

  // Save CSV download data
  useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      tempArr.push(item);
    })
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // Clear all filters
  const clearAll = () => {
    filterRef?.current?.handleClearFilter();
    setIsSearchClicked(false);
  }

  // Runners props
  const runnerListProps = {
    page: (page == 0) ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
    clearAll
  };

  // reset id on closing
  useEffect(() => {
    if (open === false) {
      setRowId('');
    }
  }, [open])

  // Toggle Edit modal
  const handleEditPopup = () => {
    setOpen(!open);
  }

  // Close Edit modal
  const handleEditState = () => {
    setEdit(true);
  }

  // Open Edit modal
  const handleEditUndoState = () => {
    setEdit(false);
  }

  // Get filter data from filter component
  const handleFilter = (value: any) => {
    setGetFilters(value);
    setPage(value.page);
  }

  // Apply the filter
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  // Remove filter
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  }

  // Handle sorting
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...getFilters,
      ...({ page: page }),
      ...({ limit: limit }),
      ...({ order: isAsc ? 'DESC' : 'ASC' }),
      ...({ sortBy: property }),
    }
    handleFilter(datafltr)
    data?.refetch();
  };

  // Handle pagination
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      page: pageNum,
      limit: limit
    }
    handleFilter(datafltr)
    data?.refetch();
  }

  // Handle pagination limit
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      limit: pageLimit,
      page: 1,
    }
    handleFilter(datafltr)
    data?.refetch();
  }

  // Runner title list
  const headCells = [
    {
      id: 'raceDate',
      numeric: false,
      disablePadding: true,
      label: 'Date',
      disabled: false
    },
    {
      id: 'name',
      numeric: false,
      disablePadding: true,
      label: 'Name',
      disabled: false
    },
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Race #',
      disabled: true
    },
    {
      id: 'class',
      numeric: false,
      disablePadding: true,
      label: 'Class',
      disabled: false
    },
    {
      id: 'horseName',
      numeric: false,
      disablePadding: true,
      label: 'Horse',
      disabled: false
    },
    {
      id: 'sireName',
      numeric: false,
      disablePadding: true,
      label: 'Sire',
      disabled: false
    },
    {
      id: 'damName',
      numeric: false,
      disablePadding: true,
      label: 'Dam',
      disabled: false
    },
    {
      id: 'position',
      numeric: false,
      disablePadding: true,
      label: 'Position',
      disabled: false
    },
    {
      id: 'accuracy',
      numeric: false,
      disablePadding: true,
      label: 'Accuracy',
      disabled: true
    },

  ]

  // Render runners title with Ascending and dscending functionality
  function EnhancedTableHead(props: any) {
    const {
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
      <TableHead className='runnerTableHead'>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              className={`${headCell.id === 'accuracy' ? 'addpaddingForAccuracy' : ''}`}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon }
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'ASC'}
                onClick={createSortHandler(headCell.id)}
                disabled={headCell.disabled}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'DESC' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className={`icon-share-wrapper ${downloadData?.isFetching ? 'disabled-icon' : ''}`}><CsvLink data={csvShareData} fileName={`Runners_Data (${new Date()})`}><i className={'icon-Share'} onClick={() => setIsShareClicked(true)} /></CsvLink></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <>
      {/* Dashboard header to show  search bar*/}
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} moduleListProps={runnerListProps} isSearchClicked={isSearchClicked} />
      {/* Page contains Analytics, filter, race list and no data component */}
      <Page title="Runner  Dashboard" sx={{ display: 'flex' }} className='RunnerDataDashboard'>
        <RunnerFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          rowCount={(!isFilterApplied) ? 0 : data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          setIsIncludedFeeActive={setIsIncludedFeeActive}
          isIncludedFeeActive={isIncludedFeeActive}
          isSearchClicked={isSearchClicked}
          setIsSearchClicked={setIsSearchClicked}
          state={state}
          setStateValue={setStateValue}
          order={order}
          orderBy={orderBy}
          ref={filterRef}
          defaultPageOrderBy={defaultPageOrderBy}
          setDefaultPageOrderBy={setDefaultPageOrderBy}
        />
        <Box className='RunnerDataDashboardRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {/* Show Toast message */}
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
            {/* Show Analytics or Runners list */}
            {!isSearchClicked ? (
               isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                <Box className="Spinner-Wrp">
                  {/* spinner */} <Spinner />
                </Box>
              ) : 
              filterCounterhook.value >= 2 && raceAndRunnerModuleAccess.raceAndRunner_dashboard === false ? (
                <UnAuthorized />
              ) : (
              <Box>
                {/* By default display the stallion dashboard data if any search is happened */}
                <DataAnalytics 
                  apiStatus={true} setApiStatus={setApiStatus} 
                  apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg}
                  raceAndRunnerModuleAccess={raceAndRunnerModuleAccess}
                  setRaceAndRunnerModuleAccess={setRaceAndRunnerModuleAccess}
                  clickedPopover={clickedPopover}
                  setClickedPopover={setClickedPopover}
                />
              </Box>
                  )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                    <Box className="Spinner-Wrp">
                      {/* spinner */} <Spinner />
                    </Box>
                  ) : filterCounterhook.value >= 2 && raceAndRunnerModuleAccess.raceAndRunner_list === false ? (
                    <UnAuthorized />
                  ) : !isFilterApplied ? (
                    <NoDataComponent {...runnerListProps} />
                  ) : data?.isFetching ? (
                    <Box className="Spinner-Wrp">
                      {/* Load a spinner if any search is happened and api is still fetching*/}
                      <Spinner />
                    </Box>
                  ) : 
                  (data.isSuccess && runnerListProps?.result?.length > 0) ?
                    <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                      <Scrollbar>
                        <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                          <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                            <EnhancedTableHead
                              numSelected={selected.length}
                              order={order}
                              orderBy={orderBy}
                              //onSelectAllClick={handleSelectAllClick}
                              onRequestSort={handleRequestSort}
                              rowCount={runnerList.length}
                            />
                            <TableBody>
                              {runnerList.map((row: any, index: number) => (
                                <RunnerListTableRow
                                  key={row.runnerUuid}
                                  row={row}
                                  selected={row.runnerUuid}
                                  onSelectRow={row.runnerUuid}
                                  onEditPopup={() => handleEditPopup()}
                                  onSetRowId={() => setRowId(row.runnerUuid)}
                                  handleEditState={() => handleEditState()}
                                  raceAndRunnerModuleAccess={raceAndRunnerModuleAccess}
                                  setRaceAndRunnerModuleAccess={setRaceAndRunnerModuleAccess}
                                  clickedPopover={clickedPopover}
                                  setClickedPopover={setClickedPopover}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Scrollbar>
                      <Box className='Pagination-wrapper'>
                        <PaginationSettings data={runnerListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
                        <PaginationLimit data={runnerListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
                      </Box>
                    </Card>
                    :
                    <NoDataComponent {...runnerListProps} />
            }
            {/* End Show Analytics or Runners list */}
          </Container>
        </Box>
        {/* Runners Add/Edit Modal */}
        <RunnerNewEditModal
          open={open}
          rowId={rowId}
          isEdit={isEdit}
          apiStatus={true}
          handleEditPopup={handleEditPopup}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          handleEditUndoState={handleEditUndoState}
          valuesExist={valuesExist}
          setValuesExist={setValuesExist}
          clickedPopover={clickedPopover}
          setClickedPopover={setClickedPopover}
        />
        {/* Download Unauthorized Popover */}
        {clickedPopover && !raceAndRunnerModuleAccess.raceAndRunner_dashboard_download && (
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
        )}
      </Page>
      {/* End Page contains Analytics, filter, race list and no data component */}
    </>
  );
}
