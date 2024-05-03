import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
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
import { useDispatch } from 'react-redux';
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { Notifications } from '../../@types/notifications';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { NotificationsListTableRow } from 'src/sections/@dashboard/system/notifications/list';

import { Spinner } from 'src/components/Spinner';
import NotificationsFilterSidebar from 'src/sections/@dashboard/system/notifications/filter/NotificationsFilterSidebar';
import UserManagementEditModal from 'src/sections/@dashboard/system/usermanagement/UserManagementEditModal';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import {
  useNotificationsQuery,
  useShareNotificationsQuery,
} from 'src/redux/splitEndpoints/notificationsSplit';
import { dateHypenConvert, parseDateTime } from 'src/utils/customFunctions';
import CsvLink from 'react-csv-export';
import { SettingsContext } from 'src/contexts/SettingsContext';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------

// table headCells
const headCells = [
  {
    id: 'dateCreated',
    numeric: false,
    disablePadding: true,
    label: 'Date',
  },
  {
    id: 'notificationTitle',
    numeric: false,
    disablePadding: true,
    label: 'Title',
  },
  {
    id: 'messageText',
    numeric: false,
    disablePadding: true,
    label: 'Message',
  },
  {
    id: 'linkName',
    numeric: false,
    disablePadding: true,
    label: 'Link',
  },
  {
    id: 'readNotification',
    numeric: false,
    disablePadding: true,
    label: 'Read',
  },
];

export default function NotificationsList() {
  // react states
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [notificationModuleAccess, setNotificationModuleAccess] = useState({
    notification_list: false,
    notification_list_download: false,
    notification_manage_list: false,
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
    if (valuesExist.hasOwnProperty('NOTIFICATIONS_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setNotificationModuleAccess({
      ...notificationModuleAccess,
      notification_list: !valuesExist?.hasOwnProperty('NOTIFICATIONS_ADMIN_READ_ONLY') ? false : true,
      notification_list_download: !valuesExist?.hasOwnProperty('NOTIFICATIONS_ADMIN_EXPORT_LISTS') ? false : true,
      notification_manage_list: !valuesExist?.hasOwnProperty('NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const handleExportUnaccessModal = () => {
    setClickedPopover(true);
  }

  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('dateCreated');
  const { notificationSort, SetNotificatioSort } = useContext(SettingsContext);

  // API call to get notifications page settings
  const pageId = process.env.REACT_APP_NOTIFICATION_PAGE_ID;
  const {
    data: notificationsSettings,
    isFetching: isNotificationsSettingFetching,
    isLoading: isNotificationsSettingLoading,
    isSuccess: isNotificationsSettingSuccess,
  } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('dateCreated');
  // onSuccess page settings API
  useEffect(() => {
    if (isNotificationsSettingSuccess) {
      setOrderBy(notificationsSettings?.settingsResponse?.defaultDisplay);
      setDefaultPageOrderBy(notificationsSettings?.settingsResponse?.defaultDisplay);
    }
    setGetFilters({
      ...getFilters,
      sortBy: notificationsSettings?.settingsResponse?.defaultDisplay,
    });
  }, [notificationsSettings]);

  // method for table head
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };
    localStorage.removeItem('notificationSort');

    return (
      // table section
      <TableHead className="notificationTableHead">
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
                  order === 'ASC' ? KeyboardArrowUpRoundedIcon : KeyboardArrowDownRoundedIcon
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
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className="icon-share-wrapper">
            {filterCounterhook.value >= 2 && notificationModuleAccess.notification_list_download === false ? (
              <i className={'icon-Share'} onClick={handleExportUnaccessModal} />
            ) :
              <CsvLink data={csvShareData} fileName={`Notifications_Data (${new Date()})`}>
                <i className={'icon-Share'} />
              </CsvLink>
            }
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  const { pathname } = useLocation();
  const { unread = '' } = useParams(); 
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Notifications[]>([]);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [isShowAll, setIsShowAll] = useState(true);
  // initial states
  const [state, setStateValue] = React.useState({
    userName: '',
    emailAddress: '',
    messageKey: '',
    countryId: null,
    countryName: { countryName: '' },
    titlesLists: null,
    linkType: null,
    notificationStatus: 'none',
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  });

  
  React.useEffect(() => {
    let isFilter = false;
    if (unread) {
      isFilter = pathname.includes('notificationfilter');
    }
    if (isFilter) {
      setGetFilters({
        page:1,
        status:'Unread',
        limit:limit,
        order:order,
        sortBy:orderBy
      });
      setStateValue({
        ...state,
        notificationStatus:'Unread'
      })
      setTimeout(() => {
        handleFilterApplied();
      }, 500);
    }
  }, []);

  // filter handler
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  // filter applied handler
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  // remove filter applied handler
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };
  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  // new state data
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  // date range picker states
  const [convertedSentDateRangeValue, setConvertedSentDateRangeValue] = React.useState('');
  const [convertedSentDateDateValue, setConvertedSentDateDateValue] = React.useState([null, null]);




  // clear all handler
  const clearAll = () => {
    setStateValue({
      userName: '',
      emailAddress: '',
      messageKey: '',
      countryId: null,
      countryName: { countryName: '' },
      titlesLists: null,
      linkType: null,
      notificationStatus: 'none',
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
    });
    handleRemoveFilterApplied();
    setConvertedSentDateRangeValue('');
    setConvertedSentDateDateValue([null, null]);
  };

  // API call for notifications data
  const data = useNotificationsQuery(isFilterApplied ? getFilters : newState);

  const NotificationsListInitial = data?.data?.data ? data?.data?.data : [];
  const NotificationsListUpdated = NotificationsListInitial?.slice(0, 10);

  // API call to download notifications data
  const downloadData: any = useShareNotificationsQuery(isFilterApplied ? getFilters : newState);
  const [csvShareData, setCsvShareData] = useState<any>([]);
  React.useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { Date, Title, Message, ReadStatus } = item;
      const dateCreated: any = parseDateTime(Date);
      tempArr.push({
        dateCreated,
        Title,
        Message,
        ReadStatus,
      });
    });
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // show all handler
  const showAllHandler = () => {
    setIsShowAll(false);
  };

  // Notifications List Props
  const NotificationsListProps = {
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

  // handle edit popup
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

  // date conversion handler
  function parseDate(dateToParse: any) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')} `;
    return formattedDate;
  }

  // pagination limit handler
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...{ page: page },
      ...{ limit: pageLimit },
      ...{ order: order },
      ...{ sortBy: orderBy },
      ...(state?.userName !== '' && { name: state?.userName }),
      ...(state?.emailAddress !== '' && { email: state?.emailAddress }),
      ...(state?.messageKey !== '' && { messageKey: state?.messageKey }),
      ...(state?.notificationStatus !== 'none' && { status: state?.notificationStatus }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state?.titlesLists !== '' && { title: state?.titlesLists }),
      ...(state?.linkType !== null && { linkType: state?.linkType }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
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
      ...(state?.userName !== '' && { name: state?.userName }),
      ...(state?.emailAddress !== '' && { email: state?.emailAddress }),
      ...(state?.messageKey !== '' && { messageKey: state?.messageKey }),
      ...(state?.notificationStatus !== 'none' && { status: state?.notificationStatus }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state?.titlesLists !== null && { title: state?.titlesLists }),
      ...(state?.linkType !== null && { linkType: state?.linkType }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
    };
    handleFilter(datafltr);
  };

  // table sort handler
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: isAsc ? 'DESC' : 'ASC' },
      ...{ sortBy: orderBy },
      ...(state?.userName !== '' && { name: state?.userName }),
      ...(state?.emailAddress !== '' && { email: state?.emailAddress }),
      ...(state?.messageKey !== '' && { messageKey: state?.messageKey }),
      ...(state?.notificationStatus !== 'none' && { status: state?.notificationStatus }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(state?.titlesLists !== null && { title: state?.titlesLists }),
      ...(state?.linkType !== null && { linkType: state?.linkType }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
    };
    handleFilter(datafltr);
  };

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  return (
    <StyledEngineProvider injectFirst>
      <>
        {/* notifications header section */}
        <DashboardHeader
          isCollapse={isCollapse}
          onOpenSidebar={() => setOpenHeader(true)}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
        <Page title="Notification List" sx={{ display: 'flex' }}>
          {/* notifications filter section */}
          <NotificationsFilterSidebar
            handleFilter={handleFilter}
            handleFilterApplied={handleFilterApplied}
            handleRemoveFilterApplied={handleRemoveFilterApplied}
            rowCount={isShowAll ? NotificationsListUpdated.length : data?.data?.meta?.itemCount}
            page={page}
            limit={limit}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            order={order}
            setOrder={setOrder}
            setPage={setPage}
            convertedSentDateRangeValue={convertedSentDateRangeValue}
            setConvertedSentDateRangeValue={setConvertedSentDateRangeValue}
            convertedSentDateDateValue={convertedSentDateDateValue}
            setConvertedSentDateDateValue={setConvertedSentDateDateValue}
            state={state}
            setStateValue={setStateValue}
            setIsShowAll={setIsShowAll}
          />
          <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
            {/* toast message section */}
            {apiStatus && (
              <CustomToasterMessage
                apiStatus={true}
                setApiStatus={setApiStatus}
                apiStatusMsg={apiStatusMsg}
                setApiStatusMsg={setApiStatusMsg}
              />
            )}

            {/* spinner  */}
            {isFetchingAccessLevel && filterCounterhook.value < 2 ? (
              <Box className="Spinner-Wrp">
                {/* spinner */} <Spinner />
              </Box>
            ) :
              filterCounterhook.value >= 2 && notificationModuleAccess.notification_list === false ? (
                <UnAuthorized />
              ) : data?.isFetching ? (
                <Box className="Spinner-Wrp">
                  <Spinner />
                </Box>
              ) : NotificationsListProps?.result?.length > 0 ? (
                <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                  <Scrollbar>
                    {/* notifications table section */}
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
                          orderBy={
                            localStorage.getItem('notificationSort') ? notificationSort : orderBy
                          }
                          onRequestSort={handleRequestSort}
                          rowCount={
                            isShowAll
                              ? NotificationsListUpdated.length
                              : NotificationsListInitial.length
                          }
                        />
                        {isShowAll ? (
                          <TableBody className="notificationTableBody">
                            {/* notifications list section */}
                            {NotificationsListUpdated.map((row: any, index: number) => (
                              <NotificationsListTableRow
                                key={row.notificationId}
                                row={row}
                                selected={row.notificationId}
                                onSelectRow={row.notificationId}
                                onEditPopup={() => handleEditPopup()}
                                onSetRowId={() => setRowId(row.notificationId)}
                                handleEditState={() => handleEditState()}
                                apiStatus={true}
                                setApiStatus={setApiStatus}
                                apiStatusMsg={apiStatusMsg}
                                setApiStatusMsg={setApiStatusMsg}
                                notificationModuleAccess={notificationModuleAccess}
                                setNotificationModuleAccess={setNotificationModuleAccess}
                                clickedPopover={clickedPopover}
                                setClickedPopover={setClickedPopover}
                              />
                            ))}
                          </TableBody>
                        ) : (
                          <TableBody className="notificationTableBody">
                            {NotificationsListInitial.map((row: any, index: number) => (
                              <NotificationsListTableRow
                                key={row.notificationId}
                                row={row}
                                selected={row.notificationId}
                                onSelectRow={row.notificationId}
                                onEditPopup={() => handleEditPopup()}
                                onSetRowId={() => setRowId(row.notificationId)}
                                handleEditState={() => handleEditState()}
                                apiStatus={true}
                                setApiStatus={setApiStatus}
                                apiStatusMsg={apiStatusMsg}
                                setApiStatusMsg={setApiStatusMsg}
                                notificationModuleAccess={notificationModuleAccess}
                                setNotificationModuleAccess={setNotificationModuleAccess}
                                clickedPopover={clickedPopover}
                                setClickedPopover={setClickedPopover}
                              />
                            ))}
                          </TableBody>
                        )}
                      </Table>
                    </TableContainer>
                    {/* notifications table section end */}
                  </Scrollbar>

                  {/* pagination section */}
                  {isShowAll ? (
                    <Box className="showMore-wrapper">
                      <Button
                        type="button"
                        fullWidth
                        className="show-all-btn"
                        onClick={showAllHandler}
                      >
                        Show All
                      </Button>
                    </Box>
                  ) : (
                    <Box className="Pagination-wrapper">
                      <PaginationSettings
                        data={NotificationsListProps}
                        handleRequestPagination={handleRequestPagination}
                        limit={limit}
                        setLimit={setLimit}
                      />
                      <PaginationLimit
                        data={NotificationsListProps}
                        handleRequestPaginationLimit={handleRequestPaginationLimit}
                        limit={limit}
                        setLimit={setLimit}
                      />
                    </Box>
                  )}
                  {/* pagination section end  */}
                </Card>
              ) : (
                <NoDataComponent {...NotificationsListProps} />
              )}
          </Container>

          {/* UserManagement Edit Modal */}
          <UserManagementEditModal
            open={open}
            rowId={rowId}
            isEdit={isEdit}
            handleEditPopup={handleEditPopup}
            handleCloseEditState={handleCloseEditState}
          />
          {clickedPopover &&
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
          }
        </Page>
      </>
    </StyledEngineProvider>
  );
}
