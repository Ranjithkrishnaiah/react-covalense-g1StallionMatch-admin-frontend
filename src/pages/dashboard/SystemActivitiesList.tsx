import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  TableContainer,
  StyledEngineProvider,
} from '@mui/material';
// redux
import { useDispatch } from 'react-redux';
// routes
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { Member } from '../../@types/member';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import {
  SystemActivitiesListTableRow,
} from 'src/sections/@dashboard/system/systemactivities/list';

import { Spinner } from 'src/components/Spinner';
import SystemActivitiesFilterSidebar from 'src/sections/@dashboard/system/systemactivities/filter/SystemActivitiesFilterSidebar';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { useSystemActivitiesQuery } from 'src/redux/splitEndpoints/systemActivitySplit';
import { TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
export default function SystemActivitiesList() {
  const { themeStretch } = useSettings();
  const [tableData, setTableData] = useState<Member[]>([]);
  const filterRef = useRef<any>(null);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('createdOn');

  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  const clearAll = () => {
    filterRef?.current?.handleClearFilter();
  };
  //System activity data api call
  const data = useSystemActivitiesQuery(isFilterApplied ? getFilters : newState, {
    refetchOnMountOrArgChange: true,
  });

  

  const statusCode = data?.status;
  const SystemActivitiesList = data?.data?.data ? data?.data?.data : [];

  const SystemActivitiesListProps = {
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

  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { isCollapse } = useCollapseDrawer();
  //table header cell names
  const headCells = [
    {
      id: 'eventId',
      numeric: false,
      disablePadding: true,
      label: 'Event ID',
    },
    {
      id: 'createdOn',
      numeric: false,
      disablePadding: true,
      label: 'Date',
    },
    {
      id: 'userName',
      numeric: false,
      disablePadding: true,
      label: 'User',
    },
    {
      id: 'SourceIP',
      numeric: true,
      disablePadding: true,
      label: 'Source IP',
      disabled: true,
    },
    {
      id: 'Activity',
      numeric: true,
      disablePadding: true,
      label: 'Activity',
      disabled: true,
    },
    {
      id: 'Result',
      numeric: true,
      disablePadding: true,
      label: 'Result',
      disabled: true,
    },
  ];
  //gets system activites data based on pagination Limits
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: page },
      ...{ limit: pageLimit },
    };

    handleFilter(datafltr);
  };
  //gets system activites data based on pagination 
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: pageNum },
      ...{ limit: limit },
    };
    handleFilter(datafltr);
  };
  //sorts the table data according to the property
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    setPage(1);
  };
  // Table header component
  function EnhancedTableHead(props: any) {
    const {
      order,
      orderBy,
      onRequestSort,
    } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {/* sort the data  */}
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowDownIcon :KeyboardArrowUpIcon }
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
        </TableRow>
      </TableHead>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      {/* system activites header content */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      {/* Ends system activites header content */}

      <Page
        title="System Activities List"
        sx={{ display: 'flex' }}
        className="SystemActivitiesListTable"
      >
        {/* if there is no permission it showes unauthorized component else show System activity content */}
        {statusCode === 'rejected' ? (
          <UnAuthorized />
        ) : (
          <>
            {/* Sysytem activity filter side bar Component */}
            <SystemActivitiesFilterSidebar
              handleFilter={handleFilter}
              handleFilterApplied={handleFilterApplied}
              handleRemoveFilterApplied={handleRemoveFilterApplied}
              rowCount={data?.data?.meta?.itemCount}
              page={page}
              limit={limit}
              ref={filterRef}
            />
            {/* 
                System activity data table component
                if data is loading it loades spinner component
                if data is present the data table component loads
                if there is no data NoData component is loaded 
            */}
            <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
              {data?.isFetching ? (
                // Spinner component 
                <Box className="Spinner-Wrp">
                  {' '}
                  <Spinner />
                </Box>
              ) 
              : 
              SystemActivitiesListProps?.result?.length > 0 ? (
                <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                  <Scrollbar>
                    {/* system activites table component  */}
                    <TableContainer className="datalist" sx={{ minWidth: 800 }}>
                      <Table
                        sx={{
                          borderCollapse: 'separate',
                          borderSpacing: '0 4px',
                          background: '#FAF8F7',
                        }}
                      >
                        {/* Table header component  */}
                        <EnhancedTableHead
                          numSelected={selected.length}
                          order={order}
                          orderBy={orderBy}
                          onRequestSort={handleRequestSort}
                          rowCount={SystemActivitiesList.length}
                        />
                        <TableBody>
                          {SystemActivitiesList.map((row: any) => (
                            // table row component 
                            <SystemActivitiesListTableRow
                              key={row.eventId}
                              row={row}
                              selected={row.eventId}
                              onSelectRow={row.eventId}
                              onEditPopup={() => handleEditPopup()}
                              onSetRowId={() => setRowId(row.eventId)}
                              handleEditState={() => handleEditState()}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Ends system activites table component  */}
                  </Scrollbar>

                  {/* Pagination component  */}
                  <Box className="Pagination-wrapper">                    
                    <PaginationSettings
                      data={SystemActivitiesListProps}
                      handleRequestPagination={handleRequestPagination}
                      limit={limit}
                      setLimit={setLimit}
                    />
                    {/* shows Pagination limits  */}
                    <PaginationLimit
                      data={SystemActivitiesListProps}
                      handleRequestPaginationLimit={handleRequestPaginationLimit}
                      limit={limit}
                      setLimit={setLimit}
                    />
                  </Box>
                  {/*Ends Pagination component  */}
                </Card>
              ) : (
                // No data component 
                <NoDataComponent {...SystemActivitiesListProps} />
              )}
            </Container>
          </>
        )}
      </Page>
    </StyledEngineProvider>
  );
}
