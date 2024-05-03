import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  TableCell,
  MenuItem,
  StyledEngineProvider,
  Divider,
  Box,
  styled,
} from '@mui/material';
// @types
import { Messages } from '../../../../@types/messages';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { parseDateAsDotFormat, toPascalCase } from 'src/utils/customFunctions';
import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
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
  row: Messages;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  apiStatus: boolean;
  setApiStatus: any;
  apiStatusMsg: any;
  setApiStatusMsg: any;
  messageModuleAccess?: any;
  setMessageModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover: any;
  setClickedPopover: React.Dispatch<React.SetStateAction<any>>;
};

export default function MessagesListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  apiStatus, setApiStatus,
  apiStatusMsg, setApiStatusMsg,
  messageModuleAccess, setMessageModuleAccess, 
  clickedPopover, setClickedPopover
}: Props) {
  const theme = useTheme();

  // row data from props
  const {
    id,
    msgChannelId,
    createdOn,
    fromEmail,
    toEmail,
    subject,
    nominationStatus,
    messageStatus,
    farmName,
    unregisteredName,
  } = row;

  // react states
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  const [messageDeleteId, setMessageDeleteId] = useState('');
  const [deleteMessageWrapper, setDeleteMessageWrapper] = useState(false);
  const [userObj, setUserObj] = React.useState<any>({});

  // set user details from localStorage
  React.useEffect(() => {
    if (localStorage.getItem('user') !== null) {
      setUserObj(JSON.parse(localStorage.getItem('user') || '{}'));
    }
  }, []);

  // open menu for more details
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // close menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // close delete conversation modal
  const handleCloseDeleteMessageWrapper = () => {
    setDeleteMessageWrapper(false);
  };

  // handle open delete conversation modal
  const handleOpenDeleteMessageWrapper = () => {
    if (!messageModuleAccess?.message_delete_conversation) {
      setClickedPopover(true);
    } else {  
      setDeleteMessageWrapper(true);
      setMessageDeleteId(msgChannelId);
    }    
  };

  // logic for nomination status text
  let nominationStatusText = '';
  if (nominationStatus === 0) {
    nominationStatusText = '-';
  } else if (nominationStatus === 1) {
    nominationStatusText = 'Pending';
  } else if (nominationStatus === 2) {
    nominationStatusText = 'Countered';
  } else if (nominationStatus === 3) {
    nominationStatusText = 'Rejected';
  } else if (nominationStatus === 4) {
    nominationStatusText = 'Accepted';
  }

  // logic for message status text
  let messageStatusText = '';
  if (messageStatus === 1) {
    messageStatusText = 'Pending';
  } else if (messageStatus === 2) {
    messageStatusText = 'Deleted';
  } else if (messageStatus === 3) {
    messageStatusText = 'Read';
  } else if (messageStatus === 4) {
    messageStatusText = 'Unread';
  }

  return (
    <StyledEngineProvider injectFirst>
      {/* messages list table section */}
      <TableRow hover selected={selected}>
        <TableCell align="left">{parseDateAsDotFormat(createdOn)}</TableCell>

        <TableCell align="left">{fromEmail}</TableCell>
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>{toPascalCase(farmName)}</p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{toEmail}</i>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="left">{subject}</TableCell>
        <TableCell align="left">{nominationStatus}</TableCell>
        <TableCell align="left">{messageStatus}</TableCell>

        <TableCell align="right">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  View Conversation
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={handleOpenDeleteMessageWrapper}>Permanently Delete</MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>
      {/* messages list table section end */}

      {/* delete conversation wrapper dialog */}
      <DeleteConversationWrapperDialog
        title="Are you sure?"
        open={deleteMessageWrapper}
        close={handleCloseDeleteMessageWrapper}
        messageDeleteId={messageDeleteId}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
    </StyledEngineProvider>
  );
}
