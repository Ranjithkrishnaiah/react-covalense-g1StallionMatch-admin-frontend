import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, StyledEngineProvider, Button, InputLabel, Typography } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const FarmMergeWrapperDialog = (props: any) => {
  const { open, close } = props;
  return (
    <StyledEngineProvider injectFirst>
      {/* dialog popup */}
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

        {/* DialogContent */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className="farmmerge-modal" mt={4}>
            <InputLabel>Are you sure you want to merge Farm#2 Name into Farm#1?</InputLabel>
            <Typography component="p" pt={2}>
              <b>This process cannot be undone.</b> All data associated with Farm#2 will be migrated
              over to Farm#1. Please check with Super Admin if this process is unable to execute.
            </Typography>
            <Box className="remove-modal-bottom" pt={1}>
              <Button type="button" className="lr-btn">
                Merge
              </Button>
              <Button type="button" className="lr-btn lr-btn-outline" onClick={close}>
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {/* dialog popup ends */}
    </StyledEngineProvider>
  );
};
