import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  TableCell,
  Typography,
  MenuItem,
  StyledEngineProvider,
  Divider,
  Box,
  styled,
} from '@mui/material';
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Images } from 'src/assets/images';
import { Notifications } from 'src/@types/notifications';
import { useUpdateReadNotificationMutation } from 'src/redux/splitEndpoints/notificationsSplit';
import { DeleteConversationWrapperDialog } from 'src/components/notifications-modal/DeleteConversationWrapper';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { parseDateTime } from 'src/utils/customFunctions';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// props type
type Props = {
  row: Notifications;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  apiStatus: boolean;
  setApiStatus: any;
  apiStatusMsg: any;
  setApiStatusMsg: any;
  notificationModuleAccess: any;
  setNotificationModuleAccess: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover: any;
  setClickedPopover: React.Dispatch<React.SetStateAction<any>>;
};

export default function NotificationsListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  apiStatus,
  setApiStatus,
  apiStatusMsg,
  setApiStatusMsg,
  notificationModuleAccess, setNotificationModuleAccess,
  clickedPopover, setClickedPopover
}: Props) {
  const theme = useTheme();

  // row props
  const {
    isRead,
    linkAction,
    linkName,
    featureName,
    messageText,
    messageTitle,
    notificationId,
    senderName,
    timeStamp,
    copyLinkAdmin,
    messageTemplateId,
  } = row;

  const navigate = useNavigate();
  // API call to update notification
  const [updateNotification] = useUpdateReadNotificationMutation();

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const [notificationIdDelete, setNotificationIdDelete] = useState('');
  const [deleteNotificaionWrapper, setDeleteNotificaionWrapper] = useState(false);
  const [copied, setCopied] = useState(false);

  // close delete notification wrapper handler
  const handleCloseDeleteNotificaionWrapper = () => {
    setDeleteNotificaionWrapper(false);
  };

  // open delete notification wrapper handler
  const handleOpenDeleteNotificaionWrapper = () => {
    if (!notificationModuleAccess?.notification_manage_list) {
      setClickedPopover(true);
    } else {      
      setDeleteNotificaionWrapper(true);
      setNotificationIdDelete(notificationId);
    }
  };

  // open menu handler
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // close menu handler
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let ImportediconClass = isRead == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  // update notification status handler
  const updateNotificationHandler = async (id: any) => {
    try {
      const data = {
        isRead: isRead ? false : true,
        notificationId: id,
      };
      let res: any = await updateNotification(data);
      if (res?.error) {
        setApiStatusMsg({
          status: 422,
          message: '<b>There was a problem in updating notification!</b>',
        });
        setApiStatus(true);
      } else {
        setApiStatusMsg({ status: 201, message: '<b>Notification updated successfully!</b>' });
        setApiStatus(true);
      }
    } catch (error) {}
  };

  // view activity redirection
  const viewActivityHandler = () => {
    if(featureName !== 'Orders / Reports' && featureName !== 'Farm' && featureName !=='Stallion' && featureName !== 'Messaging'&& featureName !== 'Membership' ){
    window.open(PATH_DASHBOARD.systemActivity.notificationFilter(featureName));
    }

    if(featureName === 'Orders / Reports'){
      window.open(PATH_DASHBOARD.systemActivity.notificationFilter('Users'));
    }

    if(featureName === 'Farm'){
      window.open(PATH_DASHBOARD.systemActivity.notificationFilter('Farms'));
    }

    if(featureName === 'Stallion'){
      window.open(PATH_DASHBOARD.systemActivity.notificationFilter('Stallions'));
    }

    if(featureName === 'Messaging'){
      window.open(PATH_DASHBOARD.systemActivity.notificationFilter('Messages'));
    }

    if(featureName === 'Membership'){
      window.open(PATH_DASHBOARD.systemActivity.notificationFilter('Members'));
    }
    handleCloseMenu();
  };

  let notificationUrl = '';

  const url = window.location.host + PATH_DASHBOARD.messages.data;

  if (row.linkName === 'Resend Email') {
    notificationUrl = `${url}`;
  } else {
    notificationUrl = `${url}`;
  }

  // copy success handler
  const onSuccessfulCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // link name functionality handler
  const linkNameHandler = (notificationRow: any) => {
    if (notificationRow.linkName === 'Resend Email') {
    } else if (notificationRow.linkName === 'Boost Profiles') {
    } else if (notificationRow.linkName === 'View Report') {
    } else if (
      notificationRow.linkName === 'Accept Invitation' ||
      notificationRow.linkName === 'Multiple links within email' ||
      notificationRow.linkName === 'Renew Now' ||
      notificationRow.linkName === 'Renew Now Auto-Renew On' ||
      notificationRow.linkName === 'View Details' ||
      notificationRow.linkName === 'Stallion Roster' ||
      notificationRow.linkName === 'None - mailto: links only'
    ) {
    } else if (notificationRow.linkName === 'Go to Profile') {
      navigate(PATH_DASHBOARD.userprofile.data);
    } else if (notificationRow?.linkName?.toLowerCase()?.includes('verify now')) {
      if (notificationRow?.featureName === "Stallion") {
        // let stallionPath = notificationRow.linkAction.split('/')[4];
        // navigate(PATH_DASHBOARD.stallions.filterId(stallionPath));
        let stallionName = notificationRow.messageText.split('[')[0].trim();
        let stallionType = notificationRow.featureName;
        navigate(PATH_DASHBOARD.stallions.keywordfilter(stallionName, stallionType));
      } else if (notificationRow?.featureName === "Farm") {
        let farmPath = notificationRow.linkAction.split('/')[4];
        navigate(PATH_DASHBOARD.farms.filterId(farmPath));
      }
    } else if (notificationRow.messageTitle === 'Request for new horse') {
      navigate(notificationRow.linkAction);
    } else if (notificationRow.messageTitle === 'Request for new mare') {
      navigate(notificationRow.linkAction);
    } else {
      const myArray = notificationRow?.linkAction.split('/');
      const channelId = myArray[3];
      navigate(PATH_DASHBOARD.messages.filter(channelId));
    }
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* table section */}
      <TableRow hover selected={selected}>
        <TableCell align="left" className="notificationTimeStamp">
          {parseDateTime(timeStamp)}
        </TableCell>
        <TableCell align="left">{messageTitle}</TableCell>
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip message-tooltip notification-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p dangerouslySetInnerHTML={{ __html: messageText }}></p>
                </Box>
              </React.Fragment>
            }
          >
            <i
              className="emailNote notmeesage"
              dangerouslySetInnerHTML={{ __html: messageText }}
            ></i>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="center">
          <a className="btn-link" type="button" onClick={() => linkNameHandler(row)}>
            {messageTitle === 'Request for new horse' || messageTitle === 'Request for new mare' || featureName === 'Messaging' || linkName?.toLowerCase()?.includes('verify now')
              ? linkName
              : ''}
          </a>
        </TableCell>

        <TableCell align="center">
          <i className={ImportediconClass} />
        </TableCell>

        <TableCell align="center" sx={{ textAlign: 'center !important' }}>
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem onClick={() => updateNotificationHandler(notificationId)}>
                  {isRead ? 'Mark As Unread' : 'Mark As Read'}
                </MenuItem>
                {copyLinkAdmin !== null && messageTemplateId !== 20 && messageTemplateId !== 22 && (
                  <>
                    <Divider style={{ margin: '0' }} />
                    <MenuItem className="selectDropDownList">
                      <i className="icon-Link popoverLink">
                        <img src={Images.LinkGray} alt="" />
                      </i>
                      <CopyToClipboard
                        text={window.location.host + copyLinkAdmin}
                        onCopy={onSuccessfulCopy}
                      >
                        <Box className={'pointerOnHover'}> {!copied ? 'Copy Link' : 'Copied!'}</Box>
                      </CopyToClipboard>
                    </MenuItem>
                  </>
                )}
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={handleOpenDeleteNotificaionWrapper}>Delete</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={viewActivityHandler}>View Activity</MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>

      {/* Delete Conversation Wrapper Dialog */}
      <DeleteConversationWrapperDialog
        title="Are you sure?"
        open={deleteNotificaionWrapper}
        close={handleCloseDeleteNotificaionWrapper}
        notificationIdDelete={notificationIdDelete}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
    </StyledEngineProvider>
  );
}
