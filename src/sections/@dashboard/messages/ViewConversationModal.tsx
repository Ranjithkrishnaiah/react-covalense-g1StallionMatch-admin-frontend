import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider } from 'src/components/hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useDispatch } from 'react-redux';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
import { MenuProps } from 'src/constants/MenuProps';
import './messages.css';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import {
  useGetConversationsQuery,
  useUpdateConversationStatusMutation,
  useUpdateMessageStatusMutation,
} from 'src/redux/splitEndpoints/messagesSplit';
import MessageTemplate from './MessageTemplate';
import SendMessage from './SendMessage';
import { Spinner } from 'src/components/Spinner';
import { toPascalCase } from 'src/utils/customFunctions';
import CsvLink from 'react-csv-export';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
const drawerWidth = 654;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Stallion;
// props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function ViewConversationModal(props: any) {
  // props
  const {
    open,
    handleEditPopup,
    rowId,
    rowData,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus, setApiStatus,
    apiStatusMsg, setApiStatusMsg,
    messageModuleAccess, setMessageModuleAccess,
    clickedPopover, setClickedPopover
  } = props;
  const navigate = useNavigate();

  // drawer close handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const theme = useTheme();
  const dispatch = useDispatch();

  // NewFarm Schema
  const NewFarmSchema = Yup.object().shape({
    farmName: Yup.string().required('Farm Name is required'),
    countryId: Yup.number().required('country is required'),
    stateId: Yup.number().required('State is required'),
    website: Yup.string().required('Website is required'),
  });

  // methods for form
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);
  const [loaderInProgress, setLoaderInProgress] = useState(false);
  const [isFileUpload, setIsFileUpload] = useState(false);

  // DeleteConversation close handler
  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
    handleDrawerClose();
    handleCloseEditState();
  };

  // DeleteConversation open handler
  const handleOpenDeleteConversationWrapper = () => {
    if (!messageModuleAccess?.message_delete_conversation) {
      setClickedPopover(true);
    } else {
      setOpenDeleteConversationWrapper(true);
    }
  };

  // file related handler
  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails,
  };

  // get user details from localStorage
  const [userObj, setUserObj] = React.useState<any>({});
  React.useEffect(() => {
    if (localStorage.getItem('user') !== null) {
      setUserObj(JSON.parse(localStorage.getItem('user') || '{}'));
    }
  }, []);

  // logic for nomination Status Text
  let nominationStatusText = '';
  if (rowData?.nominationStatus === 0) {
    nominationStatusText = '-';
  } else if (rowData?.nominationStatus === 1) {
    nominationStatusText = 'Pending';
  } else if (rowData?.nominationStatus === 2) {
    nominationStatusText = 'Countered';
  } else if (rowData?.nominationStatus === 3) {
    nominationStatusText = 'Rejected';
  } else if (rowData?.nominationStatus === 4) {
    nominationStatusText = 'Accepted';
  }

  const [messageStatusValue, setMessageStatusValue] = React.useState<any>(null);
  // mutation for upload status
  const [updateMessageStatus] = useUpdateMessageStatusMutation();

  // Cancel Modal handler
  const handleCancelModal = async (id: any) => {
    handleDrawerClose();
    handleCloseEditState();
    if (messageStatusValue !== null) {
      try {
        const data = {
          channelId: rowData?.msgChannelId,
          status: parseInt(messageStatusValue),
        };
        let res: any = await updateMessageStatus(data);
        if (res?.error) {
          setApiStatusMsg({
            status: 422,
            message: '<b>There was a problem in updating message status!</b>',
          });
          setApiStatus(true);
          setMessageStatusValue(null);
        } else {
          setApiStatusMsg({ status: 201, message: '<b>Message status updated successfully!</b>' });
          setApiStatus(true);
          setMessageStatusValue(null);
        }
      } catch (error) { }
    }
  };

  // onChange field handler
  const handleChangeField = (type: any, targetValue: any) => {
    setMessageStatusValue(targetValue);
  };

  // send TOS warning handler
  const sendTosHandler = async () => {
    if (!messageModuleAccess?.message_send_tos_message) {
      setClickedPopover(true);
    } else {
      try {
        const data = {
          channelId: rowData?.msgChannelId,
          status: 3,
        };
        let res: any = await updateMessageStatus(data);
        if (res?.error) {
          setApiStatusMsg({
            status: 422,
            message: 'There was a problem in sending TOS Warning!',
          });
          setApiStatus(true);
        } else {
          setApiStatusMsg({ status: 201, message: 'TOS Warning sent successfully!' });
          setApiStatus(true);
        }
      } catch (error) { }
    }
  };

  // API call to get conversation Data
  const {
    data: conversationData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useGetConversationsQuery(rowId, { skip: !isEdit });
  const updatedMessagesList = conversationData?.filter((message: any) => message?.message !== ' ');
  let prevMessage;

  // API call to update Conversation Status
  const [updateConversationStatus] = useUpdateConversationStatusMutation();

  React.useEffect(() => {
    if (isFetching) {
      if (!isFileUpload) {
        setLoaderInProgress(false);
      }
      const data = {
        channelId: rowData?.msgChannelId,
      };
      if (!rowData?.isRead) {
        updateConversationStatus(data);
      }
    }
  }, [isFetching]);

  const messagesEndRef = React.useRef<any>(null);

  // scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }, 250);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom();
    }
  }, [updatedMessagesList]);

  // csv download handler
  const [csvShareData, setCsvShareData] = useState<any>([]);
  React.useEffect(() => {
    let tempArr: any = [];
    updatedMessagesList?.forEach((item: any) => {
      let {
        timestamp,
        farmName,
        fromMemberName,
        farmImage,
        horseName,
        message,
        recipientName,
        senderImage,
        senderName,
        isAccepted,
        isCounterOffer,
        counterOfferPrice,
        isDeclined,
        isRead,
        mediaUrl,
        offerPrice,
        subject,
      } = item;
      const dateCreated: any = parseDateAsDotFormat(timestamp);
      tempArr.push({
        dateCreated,
        farmName,
        fromMemberName,
        farmImage,
        horseName,
        message,
        recipientName,
        senderImage,
        senderName,
        isAccepted,
        isCounterOffer,
        counterOfferPrice,
        isDeclined,
        isRead,
        mediaUrl,
        offerPrice,
        subject,
      });
    });
    setCsvShareData(tempArr);
  }, [conversationData]);

  // setting offer price and Currency Symbol
  const [offerPriceRes, setOfferPriceRes] = useState();
  const [currencySymbolRes, setCurrencySymbolRes] = useState();
  useEffect(() => {
    const sortRes = updatedMessagesList?.sort(function (a: any, b: any) {
      return b?.nominationRequestId - a?.nominationRequestId;
    });
    setOfferPriceRes(sortRes?.[0]?.offerPrice?.toLocaleString());
    setCurrencySymbolRes(sortRes?.[0]?.currencySymbol);
  }, [updatedMessagesList]);

  const ITEM_HEIGHT = 35;
    const ITEM_PADDING_TOP = 8;
    const MenuPropss: any = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                marginTop: '-1px',
                boxShadow: 'none',
                border: 'solid 1px #161716',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                boxSizing: 'border-box',
            },
        },
    }

  return (
    // drawer
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root': {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className="DrawerRightModal RaceEditModal"
    >
      <Scrollbar
        className="DrawerModalScroll"
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: '100vh',
            background: '#E2E7E1',
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader
          className="DrawerHeader"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          {/* share download */}
          <IconButton
            className="closeBtn"
            onClick={isEdit ? handleCancelModal : handleDrawerCloseRow}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>

          {messageModuleAccess?.message_view_edit && <Button type="button" className="ShareBtn">
            <CsvLink data={csvShareData} fileName={`Conversation_Report_Details (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
          </Button>}
        </DrawerHeader>

        {!messageModuleAccess?.message_view_edit ? <UnAuthorized /> :
          <>
            <Box px={4} className="edit-section" sx={{ paddingTop: '0px !important' }}>
              {/* form section */}
              <FormProvider methods={methods}>
                <Box px={0}>
                  <Grid
                    container
                    spacing={3}
                    mt={0}
                    pt={0}
                    className="RaceListModalBox ViewConversationModal"
                  >
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup RawDataGroup">
                      <Typography
                        variant="h4"
                        className="ImportedHeader"
                        sx={{ paddingLeft: '0px !important' }}
                      >
                      Report Details
                      </Typography>

                      <Box className="FormGroup">
                        <List className="RawDataList">
                          <ListItem>
                            <ListItemText primary="From:" secondary={toPascalCase(rowData?.fromName)} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="To:" secondary={rowData?.toName && toPascalCase(rowData?.toName)} />
                          </ListItem>
                        </List>

                        <Box className="FormGroup status-conversation">
                          <Box className="edit-field">
                            {/* conversation status */}
                            <Select
                              MenuProps={{
                                className: 'common-scroll-lock',
                                disableScrollLock: true,
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "right"
                                },
                                ...MenuPropss
                            }}
                              IconComponent={KeyboardArrowDownRoundedIcon}
                              className="filter-slct"
                              defaultValue="none"
                              value={
                                messageStatusValue !== null
                                  ? messageStatusValue
                                  : rowData?.messageStatus === 'Deleted'
                                    ? '2'
                                    : '1'
                              }
                              onChange={(e: any) => handleChangeField('messageStatus', e.target.value)}
                              name="messageStatus"
                            >
                              <MenuItem className="selectDropDownList" value="none" disabled>
                                Status
                              </MenuItem>
                              <MenuItem className="selectDropDownList" value="1">
                                Active
                              </MenuItem>
                              <MenuItem className="selectDropDownList" value="2">
                                Deleted
                              </MenuItem>
                            </Select>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup RawDataGroup">
                      <Typography variant="h4" className="ImportedHeader"></Typography>

                      <Box className="FormGroup">
                        <List className="RawDataList">
                          <ListItem>
                            <ListItemText
                              primary="Started:"
                              secondary={parseDateAsDotFormat(rowData?.createdOn)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Origin:"
                              secondary={toPascalCase(rowData?.subject)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Stallion:"
                              secondary={
                                toPascalCase(rowData?.stallionName)
                                  ? toPascalCase(rowData?.stallionName)
                                  : toPascalCase(rowData?.stallionNameFromEnquiry)
                              }
                            />
                          </ListItem>
                          {offerPriceRes && (
                            <ListItem>
                              <ListItemText
                                primary="Nomination:"
                                secondary={`${currencySymbolRes}${offerPriceRes} ${rowData?.nominationStatus != '-'
                                    ? `(${rowData?.nominationStatus})`
                                    : ''
                                  }`}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Grid>

                    {/* conversation chat history section */}
                    <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                      <Typography
                        variant="h4"
                        className="ImportedHeader"
                        sx={{ paddingLeft: '17px !important' }}
                      >
                        Conversation
                      </Typography>

                      <Box className="messages">
                        <Grid container className="messages-grid" ref={messagesEndRef}>
                          <Grid item lg={12} sm={12} xs={12} sx={{ margin: 'auto' }}>
                            {updatedMessagesList?.length > 0 ? (
                              updatedMessagesList?.map((message: any, index: number) => {
                                if (index === 0) {
                                  prevMessage = {
                                    index: index,
                                    item: updatedMessagesList[index],
                                  };
                                } else {
                                  prevMessage = {
                                    index: index,
                                    item: updatedMessagesList[index - 1],
                                  };
                                }

                                // Message Template component
                                return (
                                  <MessageTemplate
                                    key={message?.messageId}
                                    rowData={rowData}
                                    message={message}
                                    prevMessage={prevMessage}
                                  />
                                );
                              })
                            ) : (
                              <span className="NoconversationText">No conversation found</span>
                            )}
                          </Grid>

                          {/* loader */}
                          {loaderInProgress ? (
                            <Box className="message-loader">
                              <Spinner />
                            </Box>
                          ) : (
                            ''
                          )}
                        </Grid>
                      </Box>

                      <Box className="Type-msg">
                        <Grid container>
                          {/* send message component */}
                          <Grid item lg={12} sm={12} xs={12} px={2} sx={{ margin: 'auto' }}>
                            <SendMessage
                              rowData={rowData}
                              setLoaderInProgress={setLoaderInProgress}
                              isFileUpload={isFileUpload}
                              setIsFileUpload={setIsFileUpload}
                              messageModuleAccess={messageModuleAccess}
                              setMessageModuleAccess={setMessageModuleAccess}
                              clickedPopover={clickedPopover}
                              setClickedPopover={setClickedPopover}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    {/* conversation chat history section end */}

                    <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                      <Stack sx={{ mt: 2 }} className="DrawerBtnWrapper">
                        <Grid container spacing={1} px={2} className="DrawerBtnBottom">
                          {/* Send TOS Warning button */}
                          <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                            <LoadingButton
                              fullWidth
                              className="search-btn"
                              variant="contained"
                              onClick={sendTosHandler}
                            >
                              Send TOS Warning
                            </LoadingButton>
                          </Grid>

                          {/* delete and cancel buttons  */}
                          <Grid item xs={6} md={6} sx={{ paddingTop: '9px !important' }}></Grid>
                          <Grid item xs={6} md={6} sx={{ paddingTop: '9px !important' }}>
                            <LoadingButton
                              fullWidth
                              className="search-btn"
                              type="button"
                              variant="contained"
                              onClick={handleOpenDeleteConversationWrapper}
                            >
                              {!isEdit ? 'Permanently Delete' : 'Permanently Delete'}
                            </LoadingButton>
                          </Grid>
                          <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                            <Button
                              fullWidth
                              type="button"
                              className="add-btn"
                              onClick={handleCancelModal}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </FormProvider>
            </Box>
          </>
        }


        {/* Delete Conversation WrapperDialog */}
        <DeleteConversationWrapperDialog
          title="Are you sure?"
          open={openDeleteConversationWrapper}
          setOpenDeleteConversationWrapper={setOpenDeleteConversationWrapper}
          close={handleCloseDeleteConversationWrapper}
          messageDeleteId={rowId}
          handleEditPopup={handleEditPopup}
          handleCloseEditState={handleCloseEditState}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
      </Scrollbar>
    </Drawer>
  );
}
