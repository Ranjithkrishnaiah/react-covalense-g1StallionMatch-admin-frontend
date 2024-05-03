import { Box, Container, TableBody, TableHead } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Page from 'src/components/Page';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// redux
import { useDispatch } from 'react-redux';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import React, { useEffect, useState } from 'react';
// ----------------------------------------------------------------------
import './dashboard.css';
import MessagesFilterSidebar from 'src/sections/@dashboard/messages/filter/MessagesFilterSidebar';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import { Spinner } from 'src/components/Spinner';
import Scrollbar from 'src/components/Scrollbar';
import { TableContainer } from '@mui/material';
import { Table } from '@mui/material';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { MessagesListTableRow } from 'src/sections/@dashboard/messages/list';
import { TableRow } from '@mui/material';
import { TableCell } from '@mui/material';
import { TableSortLabel } from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils';
import { Messages } from 'src/@types/messages';
import { Card } from '@mui/material';
import { useMessagesQuery, useShareMessagesQuery } from 'src/redux/splitEndpoints/messagesSplit';
import ViewConversationModal from 'src/sections/@dashboard/messages/ViewConversationModal';
import format from 'date-fns/format';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import {
  currentDate,
  dateConvert,
  dateHypenConvert,
  getLastFromDate,
  parseDateAsDotFormat,
} from 'src/utils/customFunctions';
import DataAnalytics from 'src/sections/@dashboard/messages/DataAnalytics';
import CsvLink from 'react-csv-export';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

// table head cells
const headCells = [
  {
    id: 'Date',
    numeric: false,
    disablePadding: true,
    label: 'Date',
  },
  {
    id: 'From',
    numeric: false,
    disablePadding: true,
    label: 'From',
  },
  {
    id: 'To',
    numeric: false,
    disablePadding: true,
    label: 'To',
  },
  {
    id: 'Subject',
    numeric: false,
    disablePadding: true,
    label: 'Subject',
  },
  {
    id: 'Nom Status',
    numeric: false,
    disablePadding: true,
    label: 'Nom Status',
  },
  {
    id: 'Status',
    numeric: false,
    disablePadding: true,
    label: 'Status',
  },
];

export default function MessagesData() {
  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('Date');
  // table head handler
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      // messages list table
      <TableHead className="messagesTableHead">
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
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className="icon-share-wrapper">
            <CsvLink data={csvShareData} fileName={`Messages_Data (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [messageModuleAccess, setMessageModuleAccess] = useState({
    message_list: false,
    message_dashboard: false,
    message_dashboard_download: false,
    message_list_download: false,
    message_delete_conversation: false,
    message_forward_conversation: false,
    message_send_within_conversation: false,
    message_send_new_boost: false,
    message_send_new_message: false,
    message_send_tos_message: false,
    message_view_edit: false,
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
    if (valuesExist.hasOwnProperty('MESSAGING_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setMessageModuleAccess({
      ...messageModuleAccess,
      message_list: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_READ_ONLY') ? false : true,
      message_list_download: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_EXPORT_LISTS') ? false : true,
      message_dashboard: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY') ? false : true,
      message_dashboard_download: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_DASHBOARD_EXPORT_FUNCTION') ? false : true,
      message_delete_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_DELETE_A_CONVERSATION') ? false : true,
      message_forward_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_FORWARD_A_CONVERSATION') ? false : true,
      message_send_within_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_MESSAGES_WITHIN_A_CONVERSATION') ? false : true,
      message_send_new_boost: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_BOOST') ? false : true,
      message_send_new_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_MESSAGE') ? false : true,
      message_send_tos_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_TOS_WARNING_MESSAGE') ? false : true,
      message_view_edit: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_VIEW_EDIT_CONVERSATIONS') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Messages[]>([]);
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [getFilters, setGetFilters] = useState<any>({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [rowData, setRowData] = useState();

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

  const [clear, setClear] = useState<any>(false);
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  // API call to get all messages
  const data = useMessagesQuery(isFilterApplied ? getFilters : newState);
  const messagesList = data?.data?.data ? data?.data?.data : [];

  const [convertedSentDateRangeValue, setConvertedSentDateRangeValue] = React.useState('');
  const [convertedSentDateDateValue, setConvertedSentDateDateValue] = React.useState([null, null]);

  // filter based on channelId
  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);
  const { pathname } = useLocation();
  const getChannelId = pathname.split('/')[4];
  const rowDataVar = messagesList?.[0];
  // console.log(getChannelId, 'getChannelId');
  useEffect(() => {
    if (getChannelId) {
      if (pathname?.split('/')[5] === 'farmfilter') {
        handleFilter({
          farmId: getChannelId,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
      } else if (pathname?.split('/')[5] === 'filter') {
        handleFilter({
          channelId: getChannelId,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
        });
        handleEditPopup();
        handleEditState();
        setOpen(true);
        setRowId(getChannelId);
      } else if (pathname?.split('/')[5] === 'isRedirectFarmFilter') {
        handleFilter({
          farmId: getChannelId,
          page: page,
          limit: limit,
          order: order,
          sortBy: orderBy,
          isRedirect: true
        });
      }
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else {
      setIsSearchClicked(false);
    }
  }, [getChannelId]);

  useEffect(() => {
    if (getChannelId) {
      if (pathname?.split('/')[5] === 'filter') {
        setRowData(rowDataVar);
      }
    }
  }, [getChannelId, rowDataVar]);

  // states
  const [state, setStateValue] = React.useState({
    fromToName: '',
    fromEmail: '',
    toEmail: '',
    stallionId: '',
    farmId: '',
    mareName: '',
    sentDateValue: null,
    messageStatus: 'none',
    nominationStatus: 'none',
    originStatus: 'none',
    isFlagged: false,
    isFlaggedClicked: false,
    nominationRange: [0, 100],
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  });

  // clear all handler
  const clearAll = () => {
    setStateValue({
      fromToName: '',
      fromEmail: '',
      toEmail: '',
      stallionId: '',
      farmId: '',
      mareName: '',
      sentDateValue: null,
      messageStatus: 'none',
      nominationStatus: 'none',
      originStatus: 'none',
      isFlagged: false,
      isFlaggedClicked: false,
      nominationRange: [0, 100],
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
    });
    handleRemoveFilterApplied();
    setConvertedSentDateRangeValue('');
    setConvertedSentDateDateValue([null, null]);
    setIsSearchClicked(false);
    navigate(PATH_DASHBOARD.messages.data);
  };

  // set user data from localStorage
  const [userObj, setUserObj] = React.useState<any>({});
  React.useEffect(() => {
    if (localStorage.getItem('user') !== null) {
      setUserObj(JSON.parse(localStorage.getItem('user') || '{}'));
    }
  }, []);

  // API call to download messages data
  const downloadData: any = useShareMessagesQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
  });
  const [csvShareData, setCsvShareData] = useState<any>([]);
  React.useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { createdOn, fromEmail, subject, farmName, nominationStatus, messageStatus } = item;
      const dateCreated: any = parseDateAsDotFormat(createdOn);
      const toEmail = userObj?.email;
      tempArr.push({
        dateCreated,
        fromEmail,
        toEmail,
        subject,
        farmName,
        nominationStatus,
        messageStatus,
      });
    });
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // messages List Props
  const messagesListProps = {
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
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  // method to convert data format
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
      ...(state?.fromToName !== '' && { fromOrToName: state?.fromToName }),
      ...(state?.fromEmail !== '' && { fromEmail: state?.fromEmail }),
      ...(state?.toEmail !== '' && { toEmail: state?.toEmail }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.mareName !== '' && { mareName: state?.mareName }),
      ...(state?.sentDateValue !== null && {
        sentDate: format(new Date(state?.sentDateValue), 'yyyy-MM-dd'),
      }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
      ...(state?.messageStatus !== 'none' && { messageStatus: state?.messageStatus }),
      ...(state?.nominationStatus !== 'none' && { nominationStatus: state?.nominationStatus }),
      ...(state?.originStatus !== 'none' && { origin: state?.originStatus }),
      ...(state?.isFlaggedClicked && { isFlagged: state?.isFlagged }),
      ...(state?.nominationRange.join('-') !== '0-100' && {
        nominationRange: state?.nominationRange.join('-'),
      }),
      ...(getFilters?.farmId !== '' && { farmId: getFilters?.farmId }),
      ...(pathname?.split('/')[5] === 'isRedirectFarmFilter' && { isRedirect: true }),
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
      ...(state?.fromToName !== '' && { fromOrToName: state?.fromToName }),
      ...(state?.fromEmail !== '' && { fromEmail: state?.fromEmail }),
      ...(state?.toEmail !== '' && { toEmail: state?.toEmail }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.mareName !== '' && { mareName: state?.mareName }),
      ...(state?.sentDateValue !== null && {
        sentDate: format(new Date(state?.sentDateValue), 'yyyy-MM-dd'),
      }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
      ...(state?.messageStatus !== 'none' && { messageStatus: state?.messageStatus }),
      ...(state?.nominationStatus !== 'none' && { nominationStatus: state?.nominationStatus }),
      ...(state?.originStatus !== 'none' && { origin: state?.originStatus }),
      ...(state?.isFlaggedClicked && { isFlagged: state?.isFlagged }),
      ...(state?.nominationRange.join('-') !== '0-100' && {
        nominationRange: state?.nominationRange.join('-'),
      }),
      ...(getFilters?.farmId !== '' && { farmId: getFilters?.farmId }),
      ...(pathname?.split('/')[5] === 'isRedirectFarmFilter' && { isRedirect: true }),
      
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
      ...{ sortBy: property },
      ...(state?.fromToName !== '' && { fromOrToName: state?.fromToName }),
      ...(state?.fromEmail !== '' && { fromEmail: state?.fromEmail }),
      ...(state?.toEmail !== '' && { toEmail: state?.toEmail }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.mareName !== '' && { mareName: state?.mareName }),
      ...(state?.sentDateValue !== null && {
        sentDate: format(new Date(state?.sentDateValue), 'yyyy-MM-dd'),
      }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
      ...(state?.messageStatus !== 'none' && { messageStatus: state?.messageStatus }),
      ...(state?.nominationStatus !== 'none' && { nominationStatus: state?.nominationStatus }),
      ...(state?.originStatus !== 'none' && { origin: state?.originStatus }),
      ...(state?.isFlaggedClicked && { isFlagged: state?.isFlagged }),
      ...(state?.nominationRange.join('-') !== '0-100' && {
        nominationRange: state?.nominationRange.join('-'),
      }),
      ...(getFilters?.farmId !== '' && { farmId: getFilters?.farmId }),
      ...(pathname?.split('/')[5] === 'isRedirectFarmFilter' && { isRedirect: true }),
    };
    handleFilter(datafltr);
  };

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const [filterStatus, setFilterStatus] = useState(false);
  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('lastweek');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const fromDateConverted =
    dateDefaultSelected === 'custom'
      ? dateConvert(convertedCreatedDateValue[0])
      : dateConvert(dateFrom);
  const toDateConverted =
    dateDefaultSelected === 'custom' ? dateConvert(convertedCreatedDateValue[1]) : currentDate();
  const isDashboardAPI = fromDateConverted > 0 && toDateConverted > 0 ? true : false;

  // sidebar filter handler
  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };

  return (
    <>
      {/* messages header section */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
        moduleListProps={messagesListProps}
        isSearchClicked={isSearchClicked}
      />
      {/* messages filter section */}
      <Page title="Message Dashboard" sx={{ display: 'flex' }} className="MessageeDataDashboard">
        <MessagesFilterSidebar
          handleFilter={handleFilter}
          handleOpenFilterParam={handleOpenFilterParam}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          isFilterApplied={isFilterApplied}
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
          convertedSentDateRangeValue={convertedSentDateRangeValue}
          setConvertedSentDateRangeValue={setConvertedSentDateRangeValue}
          convertedSentDateDateValue={convertedSentDateDateValue}
          setConvertedSentDateDateValue={setConvertedSentDateDateValue}
          state={state}
          setStateValue={setStateValue}
        />
        <Box className="MessageDataDashboardRight" sx={{ width: '100%' }} px={2}>
          <Container>
            {/* toast message section */}
            {apiStatus && (
              <CustomToasterMessage
                apiStatus={true}
                setApiStatus={setApiStatus}
                apiStatusMsg={apiStatusMsg}
                setApiStatusMsg={setApiStatusMsg}
              />
            )}
            {/* messages dashboard section */}
            {!isSearchClicked && !isUrlFilter ? (
              isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                <Box className="Spinner-Wrp">
                  {/* spinner */} <Spinner />
                </Box>
              ) :
                filterCounterhook.value >= 2 && messageModuleAccess.message_dashboard === false ? (
                  <UnAuthorized />
                ) : (
                  <Box>
                    {/* By default display the stallion dashboard data if any search is happened */}
                    <DataAnalytics
                      apiStatus={true}
                      setApiStatus={setApiStatus}
                      apiStatusMsg={apiStatusMsg}
                      setApiStatusMsg={setApiStatusMsg}
                      filterStatus={filterStatus}
                      messageModuleAccess={messageModuleAccess}
                      setMessageModuleAccess={setMessageModuleAccess}
                      clickedPopover={clickedPopover}
                      setClickedPopover={setClickedPopover}
                    />
                  </Box>
                )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                  <Box className="Spinner-Wrp">
                    {/* spinner */} <Spinner />
                  </Box>
                ) : filterCounterhook.value >= 2 && messageModuleAccess.message_list === false ? (
                  <UnAuthorized />
                ) : !isFilterApplied ? (
                  <NoDataComponent {...messagesListProps} />
                ) : data?.isFetching ? (
                  <Box className="Spinner-Wrp">
                    {/* Load a spinner if any search is happened and api is still fetching*/}
                    <Spinner />
                  </Box>
                ) : messagesListProps?.result?.length > 0 ? (
                  <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                    <Scrollbar>
                      {/* table section */}
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
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={messagesList.length}
                          />
                          <TableBody>
                            {messagesList.map((row: any, index: number) => (
                              <MessagesListTableRow
                                key={row.msgChannelId}
                                row={row}
                                selected={row.msgChannelId}
                                onSelectRow={row.msgChannelId}
                                onEditPopup={() => handleEditPopup()}
                                onSetRowId={() => {
                                  setRowId(row.msgChannelId);
                                  setRowData(row);
                                }}
                                handleEditState={() => handleEditState()}
                                apiStatus={true}
                                setApiStatus={setApiStatus}
                                apiStatusMsg={apiStatusMsg}
                                setApiStatusMsg={setApiStatusMsg}
                                messageModuleAccess={messageModuleAccess}
                                setMessageModuleAccess={setMessageModuleAccess}
                                clickedPopover={clickedPopover}
                                setClickedPopover={setClickedPopover}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Scrollbar>

                    {/* pagination section */}
                    <Box className="Pagination-wrapper">
                      <PaginationSettings
                        data={messagesListProps}
                        handleRequestPagination={handleRequestPagination}
                        limit={limit}
                        setLimit={setLimit}
                      />
                      <PaginationLimit
                        data={messagesListProps}
                        handleRequestPaginationLimit={handleRequestPaginationLimit}
                        limit={limit}
                        setLimit={setLimit}
                      />
                    </Box>
                  </Card>
                ) : (
              <NoDataComponent {...messagesListProps} />
            )}
          </Container>

          {/* view conversation modal section */}
          <ViewConversationModal
            open={open}
            rowId={rowId}
            rowData={rowData}
            isEdit={isEdit}
            handleEditPopup={handleEditPopup}
            handleCloseEditState={handleCloseEditState}
            apiStatus={true}
            setApiStatus={setApiStatus}
            apiStatusMsg={apiStatusMsg}
            setApiStatusMsg={setApiStatusMsg}
            messageModuleAccess={messageModuleAccess}
            setMessageModuleAccess={setMessageModuleAccess}
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
          {clickedPopover &&
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
          }
        </Box>
      </Page>
    </>
  );
}
