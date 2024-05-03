import { useState, useEffect } from 'react';
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
  TableSortLabel,
} from '@mui/material';
// redux
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { UserManagement } from '../../@types/usermanagement';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { UserManagementListTableRow } from 'src/sections/@dashboard/system/usermanagement/list';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Spinner } from 'src/components/Spinner';
import UserManagementEditModal from 'src/sections/@dashboard/system/usermanagement/UserManagementEditModal';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import {
  useGetUsersQuery,
  useDownloadUserListExcelFileQuery,
} from 'src/redux/splitEndpoints/usermanagementSplit';
import moment from 'moment';
import { currentDate } from 'src/utils/customFunctions';
import { visuallyHidden } from '@mui/utils';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
export default function UserManagementList() {
  const [valuesExist, setValuesExist] = useState({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  //APi for user Permission
  const {
    data: appPermissionListByUser,
    isFetching,
    refetch,
    isLoading,
    isSuccess,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });
  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccess && appPermissionListByUser) {
      setUserModuleAccess(true);
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccess, isFetching]);

  const { themeStretch } = useSettings();
  const [tableData, setTableData] = useState<UserManagement[]>([]);
  const [orderBy, setOrderBy] = useState('ID');
  const [order, setOrder] = useState('DESC');
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [csvShareData, setCsvShareData] = useState<any>([]);

  const headCells = [
    {
      id: 'ID',
      numeric: false,
      disablePadding: true,
      label: 'User ID',
      disabled: false,
    },
    {
      id: 'FULLNAME',
      numeric: false,
      disablePadding: true,
      label: 'Full Name',
      disabled: false,
    },
    {
      id: 'EMAILADDRESS',
      numeric: false,
      disablePadding: true,
      label: 'Email Address',
      disabled: false,
    },
    {
      id: 'COUNTRY',
      numeric: false,
      disablePadding: true,
      label: 'Location',
      disabled: false,
    },
    {
      id: 'MEMBERSINCE',
      numeric: false,
      disablePadding: true,
      label: 'Joined',
      disabled: false,
    },
    {
      id: 'ROLENAME',
      numeric: false,
      disablePadding: true,
      label: 'Permission Role',
      disabled: false,
    },
    {
      id: 'ACTIVE',
      numeric: false,
      disablePadding: true,
      label: 'Active',
      disabled: false,
    },
  ];
  //custome Table Head component
  function EnhancedTableHead(props: any) {
    const {
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props;

    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead className="raceTableHead">
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
          {/* share icon component cell  */}
          <TableCell
            align="left"
            className={`icon-share-wrapper ${data?.isFetching ? 'disabled-icon' : ''}`}
          >
            <i
              style={{ cursor: 'pointer' }}
              className={'icon-Share'}
              onClick={() => downloadIndivisualKPI('user_list')}
            />
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  const handleFilter = (value: any) => {
    setGetFilters(value);
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

  const data = useGetUsersQuery(isFilterApplied ? getFilters : newState);
  const UserManagementList = data?.data?.data ? data?.data?.data : [];

  const UserManagementListProps = {
    page: page == 0 ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
  };

  useEffect(() => {
    setTableData(data?.data || tableData);
  }, [data]);

  //Sorts the Data
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'DESC';
    setOrder(isAsc ? 'ASC' : 'DESC');
    setOrderBy(property);
    const datafltr = {
      ...getFilters,
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: isAsc ? 'ASC' : 'DESC' },
      ...{ sortBy: property },
    };
    handleFilter(datafltr);
    data?.refetch();
  };
  //Gets the data based on pagination count 
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: pageNum },
      ...{ limit: limit },
    };
    handleFilter(datafltr);
  };
  //Gets the data based on pagination Limit 
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: page },
      ...{ limit: pageLimit },
    };
    handleFilter(datafltr);
  };

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});
  //Api for Download User List
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
  } = useDownloadUserListExcelFileQuery(
    { setupId: excelPayload, name: 'user' },
    { skip: !isCsvDownloadDownload }
  );

  // Downloads the user list present in the page
  const downloadIndivisualKPI = (kpiType: any) => {
    setExcelPayload({
      kpiTitle: kpiType,
      fromDate: currentDate(),
    });
    setIsCsvDownloadDownload(true);
  };

  useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);

  useEffect(() => {
    let tempArr: any = [];
    UserManagementList?.forEach((item: any) => {
      let { lastActive, memberSince } = item;
      tempArr.push({
        ...item,
        lastActive: lastActive ? moment(lastActive).format('LL') : '--',
        memberSince: memberSince ? moment(memberSince).format('LL') : '--',
      });
    });
    setCsvShareData(tempArr);
  }, [data?.data]);

  //Edit Popup opens
  const handleEditPopup = () => {
    setOpen(!open);
  };
  // updates the value of edit 
  const handleEditState = () => {
    setEdit(true);
  };
  
//close the edit MOdel
  const handleCloseEditState = () => {
    setEdit(!isEdit);
  };

  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();

  return (
    <StyledEngineProvider injectFirst>
      <>
      {/* User header content */}
        <DashboardHeader
          isCollapse={isCollapse}
          onOpenSidebar={() => setOpenHeader(true)}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
        {/* End User header content */}
        <Page
          title="User Management List"
          sx={{ display: 'flex' }}
          className="userManagementListWrapper"
        >
          {!userModuleAccess ? (
            <Box className="Spinner-Wrp">
              {' '}
              <Spinner />
            </Box>
            //  if there is no permission it showes unauthorized component else show UserList content 
          ) : !valuesExist.hasOwnProperty('ADMIN_USER_MANAGEMENT_VIEW_READONLY') ? (
            <UnAuthorized />
          ) : (
            <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
              {apiStatus && (
                <CustomToasterMessage
                  apiStatus={true}
                  setApiStatus={setApiStatus}
                  apiStatusMsg={apiStatusMsg}
                  setApiStatusMsg={setApiStatusMsg}
                />
              )}
              {/* Users List Component  */}
              {data?.isLoading ? (
                <Box className="Spinner-Wrp">
                  {' '}
                  <Spinner />
                </Box>
              ) : UserManagementListProps?.result?.length > 0 ? (
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
                        {/* Table head component  */}
                        <EnhancedTableHead
                          numSelected={selected.length}
                          order={order}
                          orderBy={orderBy}
                          onRequestSort={handleRequestSort}
                          rowCount={UserManagementList.length}
                        />
                        {/* End Table head component  */}
                        {/* Table body component  */}
                        <TableBody>
                          {UserManagementList.map((row: any, index: number) => (
                            <UserManagementListTableRow
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
                              valuesExist={valuesExist}
                            />
                          ))}
                        </TableBody>
                         {/* End Table body component  */}
                      </Table>
                    </TableContainer>
                  </Scrollbar>
                  {/* Pagination component  */}
                  <Box className="Pagination-wrapper">
                    <PaginationSettings
                      data={UserManagementListProps}
                      handleRequestPagination={handleRequestPagination}
                      limit={limit}
                      setLimit={setLimit}
                    />
                    <PaginationLimit
                      data={UserManagementListProps}
                      handleRequestPaginationLimit={handleRequestPaginationLimit}
                      limit={limit}
                      setLimit={setLimit}
                    />
                  </Box>
                  {/* Pagination component  */}
                </Card>
              ) : (
                <NoDataComponent hideText={true} />
              )}
            </Container>
          )}
          {/* Edit User / New User Component  */}
          <UserManagementEditModal
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
        </Page>
      </>
    </StyledEngineProvider>
  );
}
