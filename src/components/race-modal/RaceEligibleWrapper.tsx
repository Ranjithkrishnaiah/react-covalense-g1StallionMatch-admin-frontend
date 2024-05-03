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
import { useChangeEligibilityMutation } from 'src/redux/splitEndpoints/raceSplit';
import { async } from '@firebase/util';
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

export const RaceEligibleWrapperDialog = (props: any) => {
  const { open, close } = props;
  const [changeEligibility] = useChangeEligibilityMutation();

  const handleChangeEligibility = async () => {
    let res: any = await changeEligibility({ id: props.state.id, isEligible: props.state.isEligible })
    // console.log(res, 'RESPONSE')
    props.handleOnSuccess(res);
    props.setOnYesClick(true);
    close()
    if (res?.data?.statusCode) {
      if (res?.data?.statusCode === 200) {
      }
    }
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
          <Box className='farmmerge-modal' mt={5}>
            <InputLabel>Apply eligibility to all runners in this race?</InputLabel>
            <Typography component='p' pt={2.5}>All runners in this race will also have the same eligibility, <p>meaning an ineligible race will set ineligible for all runners.</p> <b>Proceed with caution. </b> </Typography>
            <Box className='remove-modal-bottom' pt={1}>
              <Button type='button' fullWidth className='lr-btn' onClick={handleChangeEligibility}>Yes</Button>
              <Button type='button' fullWidth className='lr-btn lr-btn-outline' onClick={close}>No</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
