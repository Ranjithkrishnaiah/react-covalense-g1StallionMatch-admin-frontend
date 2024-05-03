import React, { useEffect, useRef, useState } from 'react';
// @mui
import { Box, Container, Stack, TableBody } from '@mui/material';
import { TableHead } from '@mui/material';
import { TableRow } from '@mui/material';
import { TableCell } from '@mui/material';
import { TableSortLabel } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils';
import Page from 'src/components/Page';
import { TableContainer } from '@mui/material';
import { Card } from '@mui/material';
import { Table } from '@mui/material';

import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import './dashboard.css';
import 'src/sections/@dashboard/sales/sales.css'
import SalesFilterSidebar from 'src/sections/@dashboard/sales/filter/SalesFilterSidebar';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { useSalesQuery } from 'src/redux/splitEndpoints/salesSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import { Spinner } from 'src/components/Spinner';
import Scrollbar from 'src/components/Scrollbar';
import { SalesListTableRow } from 'src/sections/@dashboard/sales/list';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import SalesNewEditModal from 'src/sections/@dashboard/sales/NewSalesViewDetailsModal';
import CalendarSchedularNew from 'src/components/calendarScheduler/CalendarSchedularNew';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';

dayjs.extend(isBetweenPlugin);

export default function SalesCalenderData() {

  const filterCounterhook = useCounter(0);
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();

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
  const [getFilters, setGetFilters] = useState<any>({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const filterRef = useRef<any>(null);
  const { salesSort, setSalesSort } = useSettings();
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [salesModuleAccess, setSalesModuleAccess] = useState({
    sales_calendar: false,
    sales_list: false,
    sales_add_new_sales: false,
    sales_edit_existing_sale: false,
    sales_export_list: false,
  });
  const [valuesExist, setValuesExist] = useState<any>({});

  // console.log(salesModuleAccess, filterCounterhooks.value, 'salesModuleAccess')
  // Check permission to access the member module
  const pageId = process.env.REACT_APP_SALES_PAGE_ID;
  const { data: salesSettings, isFetching: isSalesSettingFetching, isLoading: isSalesSettingLoading, isSuccess: isSalesSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

// Check the sales page settings
useEffect(() => {
  if (isSalesSettingSuccess) {      
    setOrderBy(salesSettings?.settingsResponse?.defaultDisplay);
    //setDefaultPageOrderBy(salesSettings?.settingsResponse?.defaultDisplay);
  } 
  if(isSearchClicked) {
    setGetFilters(
      {
        ...getFilters,
        sortBy: salesSettings?.settingsResponse?.defaultDisplay
      }
    );
  }
}, [salesSettings]);

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
    if (valuesExist.hasOwnProperty('SALES_SEARCH_VIEW_READONLY')) {
      setUserModuleAccess(true);
    }
    setSalesModuleAccess({
      ...salesModuleAccess,
      sales_calendar: !valuesExist?.hasOwnProperty('SALES_CALENDAR') ? false : true,
      sales_list: !valuesExist?.hasOwnProperty('SALES_SEARCH_VIEW_READONLY') ? false : true,
      sales_add_new_sales: !valuesExist?.hasOwnProperty('SALES_ADD_NEW_SALE') ? false : true,
      sales_edit_existing_sale: !valuesExist?.hasOwnProperty('SALES_EDIT_EXISTING_SALE') ? false : true,
      sales_export_list: !valuesExist?.hasOwnProperty('SALES_EXPORT_LIST') ? false : true,
      // raceAndRunner_list_download: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_EXPORT_LISTS') ? false : true,
      // raceAndRunner_dashboard: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_VIEW_RACE_RUNNER_DASHBOARDS') ? false : true,
      // raceAndRunner_dashboard_download: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_EXPORT_LISTS')? false : true,
      // raceAndRunner_edit: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_EDIT_INFORMATION_EXCLUDING_BULK_ELIGIBILITY_UPDATE')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);



  // api parameter
  let newState = {
    page: page,
    limit: limit,
  };

  // Api call
  const data = useSalesQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });
  const SalesList = data?.data?.data ? data?.data?.data : [];

  // Clear filter
  const clearAll = () => {
    filterRef?.current?.handleClearFilter();
    setIsSearchClicked(false);
  }

  // Sales props
  const SalesListProps = {
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

  // handle filter
  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  // Apply filter param
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  // Remove filter
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  }

  // handle sorting
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

  // handle pagination
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      ...({ page: pageNum }),
      ...({ limit: limit }),
    }
    handleFilter(datafltr)
    data?.refetch();
  }

  // handle pagination limit
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...({ page: page }),
      ...({ limit: pageLimit }),
    }

    handleFilter(datafltr)
    data?.refetch();
  }

  // Sales title list
  const headCells = [
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Sale ID',
      disabled: false//true
    },
    {
      id: 'salesName',
      numeric: false,
      disablePadding: true,
      label: 'Sale Name',
      disabled: false
    },
    {
      id: 'salesCompanyId',
      numeric: false,
      disablePadding: true,
      label: 'Company',
      disabled: false
    },
    {
      id: 'countryId',
      numeric: true,
      disablePadding: true,
      label: 'Country',
      disabled: false
    },
    {
      id: 'Lots',
      numeric: false,
      disablePadding: true,
      label: 'Lots',
      disabled: false//true
    },
    {
      id: 'StartDate',
      numeric: false,
      disablePadding: true,
      label: 'Start Date',
      disabled: false//true,
    },
    {
      id: 'Verified',
      numeric: false,
      disablePadding: true,
      label: 'Verified',
      disabled: false
    },
    {
      id: 'Status',
      numeric: false,
      disablePadding: true,
      label: 'Status',
      disabled: false
    },
  ]

  // // Render Sales title with Ascending and dscending functionality
  function EnhancedTableHead(props: any) {
    const {
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props
    localStorage.removeItem("salesSort")
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
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowUpRoundedIcon : KeyboardArrowDownRoundedIcon}
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
                {headCell.label === 'Name' ?
                  <Box className='tooltipPopoverbox'>

                  </Box>

                  : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  // Toggle edit popup
  const handleEditPopup = () => {
    setOpen(!open);
  }

  // Open edit popup
  const handleEditState = () => {
    setEdit(true);
  }

  // Close edit popup
  const handleCloseEditState = () => {
    setEdit(!isEdit);
    setRowId('');
  }

  return (
    <>
      {/* Dashboard header to show search bar and add new sales*/}
      <DashboardHeader
        isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true} setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg}
        moduleListProps={SalesListProps} isSearchClicked={isSearchClicked}
      />
      {/* Page contains Calendar, filter, sales list and no data component */}
      <Page title="Sales Calender" sx={{ display: 'flex' }} className='SalesData'>
        {/* sales filter sidebar */}
        <SalesFilterSidebar
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
          setIsIncludedFeeActive={setIsIncludedFeeActive}
          isIncludedFeeActive={isIncludedFeeActive}
          convertedCreatedRangeValue={convertedCreatedRangeValue}
          setConvertedCreatedRangeValue={setConvertedCreatedRangeValue}
          convertedCreatedDateValue={convertedCreatedDateValue}
          setConvertedCreatedDateValue={setConvertedCreatedDateValue}
          ref={filterRef}
          salesModuleAccess={salesModuleAccess}
        />
        <Box className='SalesDataRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {/* Show Toast message */}
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}

            {/* Show Analytics or sales list */}
            {!isSearchClicked ?
              <Box mt={1} className='SalesDataBody '>
                <Stack className='sales-calender-box'>
                  <Stack className='CalendarScheduler'>
                    {isFetchingAccessLevel && filterCounterhook.value < 2 ?
                      <Box className="Spinner-Wrp">
                        {/* spinner */}
                        <Spinner />
                      </Box> :
                      filterCounterhook.value >= 2 && salesModuleAccess.sales_calendar === false ? <UnAuthorized /> : <CalendarSchedularNew />
                    }
                  </Stack>
                </Stack>
              </Box>
              :
              (!isFilterApplied) ?
                <NoDataComponent {...SalesListProps} />
                :
                (data?.isLoading) ?
                  <Box className='Spinner-Wrp'>  <Spinner /></Box> :
                  (SalesListProps?.result?.length > 0) ?
                    <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                      <Scrollbar>
                        <TableContainer className='datalist raceTableWrapper' sx={{ minWidth: 800 }}>
                          <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                            <EnhancedTableHead
                              numSelected={selected.length}
                              order={order}
                              orderBy={localStorage.getItem("salesSort") ? salesSort : orderBy}
                              //onSelectAllClick={handleSelectAllClick}
                              onRequestSort={handleRequestSort}
                              rowCount={SalesList.length}
                            />
                            <TableBody>
                              {SalesList.map((row: any, index: number) => (
                                <SalesListTableRow
                                  key={row.id}
                                  row={row}
                                  selected={row.id}
                                  onSelectRow={row.id}
                                  onEditPopup={() => handleEditPopup()}
                                  onSetRowId={() => setRowId(row.id)}
                                  handleEditState={() => handleEditState()}
                                  salesModuleAccess={salesModuleAccess}
                                  setApiStatus={setApiStatus}
                                  apiStatusMsg={apiStatusMsg}
                                  setApiStatusMsg={setApiStatusMsg}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Scrollbar>

                      <Box className='Pagination-wrapper'>
                        <PaginationSettings data={SalesListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
                        <PaginationLimit data={SalesListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
                      </Box>
                    </Card>
                    :
                    <NoDataComponent {...SalesListProps} />
            }
            {/* End Show Analytics or sales list */}
          </Container>
        </Box>
        {/* Sales Add/Edit Modal */}
        <SalesNewEditModal
          open={open}
          rowId={rowId}
          isEdit={isEdit}
          handleEditPopup={handleEditPopup}
          handleCloseEditState={handleCloseEditState}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
      </Page>
    </>
  );
}
