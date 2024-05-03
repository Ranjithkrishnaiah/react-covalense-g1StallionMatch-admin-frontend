import { useState, forwardRef } from 'react';
import {
    StyledEngineProvider,
    Snackbar,
    Stack,
  } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Interweave } from 'interweave';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export const CustomToasterMessage = (props: any) => {
    const [openSnackBar, setOpenSnackBar] = useState(props.apiStatus);
    // click handler
    const handleClick = () => {
        setOpenSnackBar(true);
    };

    // close toast handler
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
        return;
        }
        setOpenSnackBar(false);
        props.setApiStatus(false);
    };

    return (
        <StyledEngineProvider injectFirst>
          <Snackbar className='CustomToasterMessage' autoHideDuration={20000} open={openSnackBar} onClose={handleClose}>
          <Stack sx={{ width: '100%' }} spacing={2} className='AlertMessage'>
            {(props.apiStatusMsg.status === 201) &&            
            <Alert 
              sx={{background: '#2EFFB4', color:'#1D472E'}} 
              className='successAlert'
              icon={false} 
              onClose={handleClose}
              severity="success"
            ><Interweave content={props.apiStatusMsg.message} /></Alert>
            }
            {(props.apiStatusMsg.status === 422 || props.apiStatusMsg.status === 500) &&            
            <Alert 
              sx={{background: '#C75227', color:'#fff'}}
              className='errorAlert'
              icon={false} 
              onClose={handleClose}
              severity="success"
            ><Interweave content={props.apiStatusMsg.message} /></Alert>
            }              
            </Stack>
          </Snackbar>
    </StyledEngineProvider>
  );
}