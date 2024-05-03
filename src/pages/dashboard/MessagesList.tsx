import { useState, useEffect } from 'react';
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
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { Messages } from '../../@types/messages';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { MessagesListTableRow } from 'src/sections/@dashboard/messages/list';
import { Spinner } from 'src/components/Spinner';
import MessagesFilterSidebar from 'src/sections/@dashboard/messages/filter/MessagesFilterSidebar';
import ViewConversationModal from 'src/sections/@dashboard/messages/ViewConversationModal';
import { useMessagesJsonQuery } from 'src/redux/splitEndpoints/messagesSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------
export default function MessagesList() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // states
  const [tableData, setTableData] = useState<Messages[]>([]);
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  // filter handler
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  // filter applied handler
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  const [clear, setClear] = useState<any>(false);
  // get messages data from JSON
  const data = useMessagesJsonQuery();
  const MessagesList = data?.data?.data ? data?.data?.data : [];

  // Messages List Props
  const MessagesListProps = {
    page: page == 0 ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: [],
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
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
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

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
      message_dashboard: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_VIEW_MESSAGE_DASHBOARD') ? false : true,
      message_dashboard_download: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_EXPORT_LISTS')? false : true,
      message_delete_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_DELETE_A_CONVERSATION')? false : true,
      message_forward_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_FORWARD_A_CONVERSATION')? false : true,
      message_send_within_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_MESSAGES_WITHIN_A_CONVERSATION')? false : true,
      message_send_new_boost: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_BOOST')? false : true,
      message_send_new_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_MESSAGE')? false : true,
      message_send_tos_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_TOS_WARNING_MESSAGE')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);
  return (
    <StyledEngineProvider injectFirst>
      <Page title="Messages  List" sx={{ display: 'flex' }}>
        {/* messages filter section */}
        <MessagesFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          rowCount={data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
        />
        <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
          {data?.isLoading ? (
            <Box className="Spinner-Wrp">
              <Spinner />
            </Box>
          ) : MessagesListProps?.result?.length > 1 ? (
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
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Date</TableCell>
                        <TableCell align="left">From</TableCell>
                        <TableCell align="left">To</TableCell>
                        <TableCell align="left">Subject</TableCell>
                        <TableCell align="left">Nom Status</TableCell>
                        <TableCell align="left">Status</TableCell>
                        <TableCell align="left" className="icon-share-wrapper">
                          <i className={'icon-Share'} />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {MessagesList.map((row: any, index: number) => (
                        <MessagesListTableRow
                          key={row.farmId}
                          row={row}
                          selected={row.farmId}
                          onSelectRow={row.farmId}
                          onEditPopup={() => handleEditPopup()}
                          onSetRowId={() => setRowId(row.farmId)}
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
                <PaginationSettings data={MessagesListProps} />
                <PaginationLimit data={MessagesListProps} />
              </Box>
            </Card>
          ) : (
            <NoDataComponent />
          )}
        </Container>
        {/* view conversation modal section */}
        <ViewConversationModal
          open={open}
          rowId={rowId}
          isEdit={isEdit}
          handleEditPopup={handleEditPopup}
          handleCloseEditState={handleCloseEditState}
        />
      </Page>
    </StyledEngineProvider>
  );
}
