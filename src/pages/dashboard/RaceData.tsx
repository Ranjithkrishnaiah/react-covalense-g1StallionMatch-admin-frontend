// mui
import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableSortLabel, TableBody } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils'
//react-csv-export
import CsvLink from 'react-csv-export';
// hooks and api 
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { useRacesQuery, useShareRaceListQuery } from 'src/redux/splitEndpoints/raceSplit';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { RaceListTableRow } from 'src/sections/@dashboard/race/list';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
// utils
import './dashboard.css'
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
// components
import { Spinner } from 'src/components/Spinner';
import Page from 'src/components/Page';
import Scrollbar from 'src/components/Scrollbar';
import DashboardHeader from 'src/layouts/dashboard/header';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import RaceFilterSidebar from 'src/sections/@dashboard/race/filter/RaceFilterSidebar';
import RaceNewEditModal from 'src/sections/@dashboard/race/RaceNewEditModal';
import DataAnalytics from 'src/sections/@dashboard/race/DataAnalytics';
import { useLocation, useParams } from 'react-router';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';

export default function RaceData() {
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

  React.useEffect(() => {
    if (valuesExist.hasOwnProperty('RACE_ADMIN_EXPORT_LIST')) {
      setUserModuleAccess(true);
    }
    setRaceAndRunnerModuleAccess({
      ...raceAndRunnerModuleAccess,
      raceAndRunner_list: !valuesExist?.hasOwnProperty('RACE_ADMIN_SEARCH_VIEW_READONLY') ? false : true,
      raceAndRunner_list_download: !valuesExist?.hasOwnProperty('RACE_ADMIN_EXPORT_LIST') ? false : true,
      raceAndRunner_dashboard: !valuesExist?.hasOwnProperty('RACE_ADMIN_DASHBOARD_VIEW_READONLY') ? false : true,
      raceAndRunner_dashboard_download: !valuesExist?.hasOwnProperty('RACE_ADMIN_DASHBOARD_EXPORT_FUNCTION')? false : true,
      raceAndRunner_edit: !valuesExist?.hasOwnProperty('RACE_ADMIN_EDIT_EXISTING_RACE_DETAILS')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const pageId = process.env.REACT_APP_RACE_PAGE_ID;
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const [getFilters, setGetFilters] = useState<any>({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [orderBy, setOrderBy] = useState('raceId');
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [clear, setClear] = useState<any>(false);
  const [selected, setSelected] = useState([]);
  const [isIncludedFeeActive, setIsIncludedFeeActive] = useState(false);
  const [order, setOrder] = useState('ASC');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('raceId');
  const filterRef = useRef<any>(null);

  const { pathname } = useLocation();
  const currentPage = pathname.split("/");
  const raceSubModule = currentPage[5];
  const searchedRaceName: any = (raceSubModule === 'filter') ? decodeURIComponent(currentPage[4]) : "";
  const [isKeywordSearch, setIsKeywordSearch] = useState((searchedRaceName === "") ? false : true);

  // Race list parameters
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  // Check the querystring and generate the filter payload
  useEffect(() => {
    if(isKeywordSearch) {
      handleFilter({
        displayName: searchedRaceName?.trim(),
        isDisplayNameExactSearch: true,
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
      });
      handleFilterApplied();
      setIsSearchClicked(true);
    } 
  }, [isKeywordSearch]);

  // Api calls
  const data = useRacesQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });
  const { data: countriesList } = useCountriesQuery();
  const downloadData: any = useShareRaceListQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });
  const [csvShareData, setCsvShareData] = useState<any>([]);
  const raceList = data?.data?.data ? data?.data?.data : [];
  const { data: raceSettings, isFetching: isRaceSettingFetching, isLoading: isRaceSettingLoading, isSuccess: isRaceSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  console.log(getFilters,'getFilters')
  // Check the horse page settings
  useEffect(() => {
    if (isRaceSettingSuccess) {
      setOrderBy(raceSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(raceSettings?.settingsResponse?.defaultDisplay);
    }
    if (isSearchClicked) {
      setGetFilters(
        {
          ...getFilters,
          ...(raceSettings?.settingsResponse?.defaultDisplay === 'raceDate' && { order: 'DESC' }),
          sortBy: raceSettings?.settingsResponse?.defaultDisplay
        }
      );
      if(raceSettings?.settingsResponse?.defaultDisplay === 'raceDate') {
        setOrder('DESC');
      }
    }
  }, [raceSettings]);

  // Save the Csv download list
  useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { raceDate } = item;
      tempArr.push({ ...item, raceDate: raceDate ? parseDateAsDotFormat(raceDate) : '--' });
    })
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // Clear filter
  const clearAll = () => {
    filterRef?.current?.handleClearFilter();
    setIsSearchClicked(false);
  }

  // race list props
  const raceListProps = {
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

  // Race title list
  const headCells = [
    {
      id: 'raceDate',
      numeric: false,
      disablePadding: true,
      label: 'Race Date',
      disabled: false
    },
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Race #',
      disabled: false
    },
    {
      id: 'venue',
      numeric: false,
      disablePadding: true,
      label: 'Venue',
      disabled: false
    },
    {
      id: 'country',
      numeric: false,
      disablePadding: true,
      label: 'Country',
      disabled: false
    },
    {
      id: 'displayName',
      numeric: false,
      disablePadding: true,
      label: 'Name',
      disabled: false,
    },
    {
      id: 'class',
      numeric: false,
      disablePadding: true,
      label: 'Class',
      disabled: false
    },
    {
      id: 'trackType',
      numeric: false,
      disablePadding: true,
      label: 'Track Type',
      disabled: false
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: true,
      label: 'Race Status',
      disabled: false
    },
    {
      id: 'runner',
      numeric: false,
      disablePadding: true,
      label: 'Runners',
      disabled: false
    },
    {
      id: 'eligible',
      numeric: false,
      disablePadding: true,
      label: 'Eligible',
      disabled: false
    },

  ]

  // Render race title with Ascending and dscending functionality
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
      <TableHead className='raceTableHead'>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              size="small"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ?  KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon }
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
          <TableCell align="left" className={`icon-share-wrapper ${downloadData?.isFetching ? 'disabled-icon' : ''}`}><CsvLink data={csvShareData} fileName={`Race_Data (${new Date()})`}><i className={'icon-Share'} /></CsvLink></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  // Get filter parameter from filter component
  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  // Check filter is applied or not
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  // Remove all filters
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  }

  // Open Edit race popup
  const handleEditPopup = () => {
    setOpen(!open);
  }

  // Handle edit state
  const handleEditState = () => {
    setEdit(true);
  }

  // Toggle edit state
  const handleCloseEditState = () => {
    setEdit(!isEdit);
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
      ...({ page: pageNum }),
      ...({ limit: limit }),
    }
    handleFilter(datafltr)
    data?.refetch();
  }

  // Hanle pagination limit
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...({ page: 1 }),
      ...({ limit: pageLimit }),
    }

    handleFilter(datafltr)
    data?.refetch();
  }

  return (
    <>
      {/* Dashboard header to show  search bar*/}
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} moduleListProps={raceListProps} isSearchClicked={isSearchClicked} />
      {/* Page contains Analytics, filter, race list and no data component */}
      <Page title="Race  Dashboard" sx={{ display: 'flex' }} className='RaceDataDashboard'>
        {/* Race filter sidebar */}
        <RaceFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          isFilterApplied={isFilterApplied}
          rowCount={(!isFilterApplied) ? 0 : data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          setIsSearchClicked={setIsSearchClicked}
          isSearchClicked={isSearchClicked}
          setPage={setPage}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          order={order}
          setOrder={setOrder}
          setIsIncludedFeeActive={setIsIncludedFeeActive}
          isIncludedFeeActive={isIncludedFeeActive}
          ref={filterRef}
          defaultPageOrderBy={defaultPageOrderBy}
          setDefaultPageOrderBy={setDefaultPageOrderBy}
        />
        <Box className='RaceDataDashboardRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {/* Show Toast message */}
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}

            {/* Show Analytics or Race list */}

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
                    <NoDataComponent {...raceListProps} />
                  ) : data?.isFetching ? (
                    <Box className="Spinner-Wrp">
                      {/* Load a spinner if any search is happened and api is still fetching*/}
                      <Spinner />
                    </Box>
                  ) : 
                  (data.isSuccess && raceListProps?.result?.length > 0) ?
                    <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                      <Scrollbar>
                        <TableContainer className='datalist raceTableWrapper' sx={{ minWidth: 800 }}>
                          <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                            <EnhancedTableHead
                              numSelected={selected.length}
                              order={order}
                              orderBy={orderBy}
                              onRequestSort={handleRequestSort}
                              rowCount={raceList.length}
                            />
                            <TableBody>
                              {raceList.map((row: any, index: number) => (
                                <RaceListTableRow
                                  key={row.raceUuid}
                                  row={row}
                                  selected={row.raceUuid}
                                  onSelectRow={row.raceUuid}
                                  onEditPopup={() => handleEditPopup()}
                                  onSetRowId={() => setRowId(row.raceUuid)}
                                  handleEditState={() => handleEditState()}
                                  countriesList={countriesList}
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
                        <PaginationSettings data={raceListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
                        <PaginationLimit data={raceListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
                      </Box>
                    </Card>
                    :
                    <NoDataComponent {...raceListProps} />
            }
            {/* End Show Analytics or Race list */}
          </Container>
        </Box>
        {/* Race Add/Edit Modal */}
        <RaceNewEditModal
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
