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
  TextField,
  Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import DatePicker from 'src/components/DatePicker';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { dateHypenConvert } from 'src/utils/customFunctions';
import CustomDatePicker from '../customDatePicker/CustomDatePicker';
/////////////////////////////////////////////////////////////////////




const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));


export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

interface InviteModal {
  name: string;
  email: string;
}

const drawerWidth = 240;
type FormValuesProps = InviteModal;

export const PromoteStallionWrapperDialog = (props: any) => {
  const { open, close, setStartDate, startDate, isPromoted, setIsPromoted, isPromotedDateTouched, setIsPromotedDateTouched } = props;
  const handlePromotedDate = (date: any) => {
    props.setStartDate(date);
    // props.setIsPromotedDateTouched(true);
  };
  const handleClose = () => {
    close();
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
            <InputLabel>Promote Stallion Settings</InputLabel>
           <Typography component='p' pt={1}>Please select the date you would like to start promoting this stallion.</Typography>
           </Box> 
           <Box className='promotedStartdate' pt={4}>

           <InputLabel>Start Date</InputLabel>
          <Box className='promotedStartdateTooltip'>
          <Box className='edit-fields'>
              {/* <DatePicker value={props.startDate} handleChange={handlePromotedDate} disablePast ={false} placeholder="Enter Date" /> */}
              <CustomDatePicker placeholderText='Enter Date' value={props.startDate !== null ? dateHypenConvert(new Date()) : ''} minDate={new Date()} handleChange={handlePromotedDate} />
            </Box>
            {/* <Box className='tooltipPopoverbox'>
                  <HtmlTooltip
                  placement="bottom-start"
                className="tableTooltip"  sx={{ width: '200px !important' }}
                title={
                  <React.Fragment>
                    <Box className='tooltipPopoverBody'>
                      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ex impedit fugiat hic aliquam accusantium iusto ea sapiente reprehenderit inventore. </p>
                      
                    </Box>
                  </React.Fragment>
                }
              >
                <i className="icon-Info-circle tooltip-table" />
              </HtmlTooltip>
                </Box> */}
          </Box>
           </Box>
           <Box className='update-modal-bottom' pt={4}>
             <Button type='button' fullWidth className='lr-btn' onClick={handleClose} disabled={!startDate}>Confirm</Button>
           </Box>
                
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
