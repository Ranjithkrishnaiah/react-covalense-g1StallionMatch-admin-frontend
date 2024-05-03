import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Modal,
  StyledEngineProvider,
  Card,
  Stack,
  Button,
  InputLabel,
  Typography,
} from '@mui/material';
import { Images } from "src/assets/images";
import 'src/components/wrapper/wrapper.css';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

interface InviteModal {
  name: string;
  email: string;
}

const drawerWidth = 240;
type FormValuesProps = InviteModal;

export const CancelRefundWrapperDialog = (props: any) => {
  const { open, close, data = {}, canelOrder } = props;

  const { clientName,  email, orderId, } = data


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
        <Box className='' mt={4}  sx={{ width: '424px !important' }}>
            <InputLabel>Are you sure you want to cancel order  #{orderId || ''} <br></br> to {clientName || ''} ({email || ''})?</InputLabel>
           <Typography component='p' pt={2}><b>This process cannot be undone. </b>This report will no longer be processed. Please ensure {clientName} is notified and accounts processes any necessary refund.</Typography>
           <Box className='remove-modal-bottom' pt={1}>
             <Button type='button' onClick={() => canelOrder()} className='lr-btn'>Yes, Cancel</Button>
             <Button type='button' onClick={() => close()} className='lr-btn lr-btn-outline'>Do Not Cancel</Button>
           </Box>
        </Box>         
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
