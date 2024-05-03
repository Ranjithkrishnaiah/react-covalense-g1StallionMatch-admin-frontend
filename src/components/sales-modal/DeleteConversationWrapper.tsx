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
import { useDeleteSaleMutation } from 'src/redux/splitEndpoints/salesSplit';
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

export const DeleteConversationWrapperDialog = (props: any) => {

  const { open, close, row ,handleDeleteResponse} = props;
  const [deleteSale] = useDeleteSaleMutation();

  const onDeleteSale = async () => {
    // console.log(row,'RORRR')
    let res: any = await deleteSale(row.id);
    close();
    handleDeleteResponse(res);
    // console.log(res, 'RES');
  }

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
          <Box className='farmmerge-modal' mt={4}>
            {/* <InputLabel>Are you sure you want to cancel and refund Order [OrderID] to [ClientName] [ClientEmail]?</InputLabel> */}
            <Typography component='p' pt={2} sx={{ fontSize: '16px !important', lineHeight: '24px !important' }}>Deleting this sale will permanently remove it from the database. <b>Proceed with caution as this cannot be undone.</b> </Typography>
            <Box className='remove-modal-bottom full-width' pt={2} pb={2}>
              <Button type='button' fullWidth className='lr-btn' onClick={onDeleteSale}>Delete Conversation</Button>
              {/* <Button type='button' className='lr-btn lr-btn-outline'>Cancel Only</Button> */}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
