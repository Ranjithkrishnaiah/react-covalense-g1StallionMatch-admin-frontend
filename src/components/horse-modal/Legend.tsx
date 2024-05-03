import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import './horsewrapper.css';
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

export const LegendWrapperDialog = (props: any) => {
  const { open, close } = props;
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
        <Box className='legent-modal-pop-box' mt={4}>
           

           <Box mt={3}>
              <Stack className='legend-modal-list'>
                 <Box className='color-legend' sx={{ background: "#FF9F22" }} />
                 <Typography component="p">Orange indicates the horse is not verified</Typography>
              </Stack>

              <Stack className='legend-modal-list'>
                 <Box className='color-legend' sx={{ background: "#D80027" }} />
                 <Typography component="p">Red indicates the horse is missing key information</Typography>
              </Stack>

              <Stack className='legend-modal-list'>
                 <Box className='color-legend' sx={{ background: "#FF00E5" }} />
                 <Typography component="p">Sire is more than 30 years old than progeny, or <br />
                 Dam is more than 26 years older than progeny</Typography>
              </Stack>

              <Stack className='legend-modal-list'>
                 <Box className='color-legend' sx={{ background: "#3139DA" }} />
                 <Typography component="p">Horse sex doesn't match position</Typography>
              </Stack>

              <Stack className='legend-modal-list'>
                 <Box className='color-legend' sx={{ background: "#00DE8E" }} />
                 <Typography component="p">Gelding in parent position</Typography>
              </Stack>

              <Stack className='legend-modal-list'>
                 <Box className='color-legend'>
                  <img src={Images.Lockfill} alt="" />
                  </Box>
                 <Typography component="p">Indicates horse is locked and cannot be edited.</Typography>
              </Stack>
              
           </Box>
          
           
        </Box>         
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
