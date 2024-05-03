import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, StyledEngineProvider, Button, Typography } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import { useDeleteNotificationMutation } from 'src/redux/splitEndpoints/notificationsSplit';
/////////////////////////////////////////////////////////////////////
// CustomDialogTitle method
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const DeleteConversationWrapperDialog = (props: any) => {
  // react props
  const {
    open,
    close,
    notificationIdDelete,
    apiStatus,
    setApiStatus,
    apiStatusMsg,
    setApiStatusMsg,
  } = props;

  // API call to delete notification
  const [deleteNotification] = useDeleteNotificationMutation();

  // delete notification handler
  const deleteNotificationHandler = async () => {
    try {
      const data = {
        notificationId: notificationIdDelete,
      };
      let res: any = await deleteNotification(data);
      if (res?.error) {
        setApiStatusMsg({
          status: 422,
          message: '<b>There was a problem in removing notification!</b>',
        });
        setApiStatus(true);
        close();
      } else {
        setApiStatusMsg({ status: 201, message: '<b>Notification deleted successfully!</b>' });
        setApiStatus(true);
        close();
      }
    } catch (error) {}
  };

  return (
    <StyledEngineProvider injectFirst>
      <Dialog
        open={props.open}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={close}
            sx={{
              position: 'absolute',
              right: 12,
              width: 36,
              height: 36,
              top: 18,
              color: (theme) => '#1D472E',
            }}
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>

        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className="farmmerge-modal delete-conversation" mt={4}>
            <Typography component="p" pt={1}>
              Deleting this conversation will permanently remove it from the database.{' '}
              <b>Proceed with caution as this</b> <b>cannot be undone.</b>
            </Typography>

            <Box className="update-modal-bottom" pt={5} pb={2}>
              <Button
                type="button"
                fullWidth
                className="lr-btn"
                onClick={deleteNotificationHandler}
              >
                Delete Conversation
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
