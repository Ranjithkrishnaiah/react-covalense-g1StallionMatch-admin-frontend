import { paramCase } from 'change-case';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
  Switch,
  Tooltip,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  StyledEngineProvider,
  Fade,
  Popper,
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useMembersQuery } from 'src/redux/splitEndpoints/memberSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
import { Member } from '../../@types/member';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils'

// sections
import {
  SalesListTableRow,
} from 'src/sections/@dashboard/sales/list';

import { reset } from 'numeral';
import { Spinner } from 'src/components/Spinner';
import SalesFilterSidebar from 'src/sections/@dashboard/sales/filter/SalesFilterSidebar';
import ViewDetailsModal from 'src/sections/@dashboard/reports/ViewDetailsModal';
import { useFarmsQuery } from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import SalesViewDetailsModal from 'src/sections/@dashboard/sales/NewSalesViewDetailsModal';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { useSalesQuery } from 'src/redux/splitEndpoints/salesSplit';
import { TableSortLabel } from '@mui/material';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
// ----------------------------------------------------------------------
export default function SalesList() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Member[]>([]);
  const filterCounterhook = useCounter(0);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('salesName');
  const [salesModuleAccess, setSalesModuleAccess] = useState({
    sales_calendar: false,
    sales_list: false,
    sales_add_new_sales: false,
    sales_edit_existing_sale: false,
    sales_export_list: false,
  });
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);

  // console.log(salesModuleAccess, filterCounterhook.value, 'salesModuleAccess')
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

  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  let newState = {
    page: page,
    limit: limit,
  };

  const data = useSalesQuery(isFilterApplied ? getFilters : newState);
  const SalesList = data?.data?.data ? data?.data?.data : [];

  const SalesListProps = {
    page: (page == 0) ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit
  };

  useEffect(() => {
    setTableData(data?.data || tableData)
  }, [data])

  const [editId, setEditId] = useState('');
  const [openAddEditForm, setOpenAddEditForm] = useState(false);
  const handleDrawerOpenRow = (stallionId: string) => {
    setOpenAddEditForm(true);
  };

  const handleDrawerCloseRow = () => {
    setOpenAddEditForm(false);
  };

  const handleEditPopup = () => {
    setOpen(!open);
  }

  const handleEditState = () => {
    setEdit(true);
  }

  const handleCloseEditState = () => {
    setEdit(!isEdit);
  }
  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setOpenPopper((previousOpen) => !previousOpen);
  };

  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const hidePopover = () => {
    setOpenPopper(false);
  }

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

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

  const headCells = [
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Sale ID',
      disabled: true
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
      disabled: true
    },
    {
      id: 'StartDate',
      numeric: false,
      disablePadding: true,
      label: 'Start Date',
      disabled: true,
    },
    {
      id: 'Verified',
      numeric: false,
      disablePadding: true,
      label: 'Verified',
      disabled: true
    },
    {
      id: 'Status',
      numeric: false,
      disablePadding: true,
      label: 'Status',
      disabled: true
    },
  ]

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
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
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
          <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <StyledEngineProvider injectFirst>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title="Sales List" sx={{ display: 'flex' }} className='SalesListTable'>
        <SalesFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} rowCount={data?.data?.meta?.itemCount} page={page} limit={limit} />
        <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
          {data?.isLoading ?
            <Box className='Spinner-Wrp'>  <Spinner /></Box> :
            (SalesListProps?.result?.length > 1) ?
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
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <Box className='Pagination-wrapper'>
                  <PaginationSettings data={SalesListProps} />
                  <PaginationLimit data={SalesListProps} />
                </Box>
              </Card>
              :
              <NoDataComponent />
          }
        </Container>
        <SalesViewDetailsModal
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
    </StyledEngineProvider>
  );
}