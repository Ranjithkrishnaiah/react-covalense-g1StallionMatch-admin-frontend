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
  Avatar
} from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import 'src/components/wrapper/wrapper.css';
import React from 'react';

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

export const StallionConfirmWrapperDialog = (props: any) => {
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
           <Box className='select-favourite-pop-box' mt={3}>
             <InputLabel >The below stallions have the same name. Click a stallion to replace or create a new stallion.</InputLabel>

             <Box className='select-favourite-pop-inner'  pt={1}>
              <List component="nav" aria-label="" className='select-favourite-list'>               
                  <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Zoffany (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X 
                        </Typography>
                        Handsel  (1985, USA), Mowitzka (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>


                <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Pharlap (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X  
                        </Typography>
                        Count The Time (1985, USA), Saddle Up (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Magic Realm (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X  
                        </Typography>
                        Face Value (1985, USA), High Butterfly (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Diamond Park (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X  
                        </Typography>
                        Face Value (1985, USA), High Butterfly (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Pharlap (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X  
                        </Typography>
                        Count The Time (1985, USA), Saddle Up (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary='Pharlap (2017, AUS)'
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            X  
                        </Typography>
                        Count The Time (1985, USA), Saddle Up (1985, USA)
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>
                </List>
             </Box>

             <Box className='favourite-bottom-button'>
               <Button type='button' fullWidth className='lr-btn'>Create New</Button>
               <Button type='button' fullWidth className='lr-btn lr-btn-outline'>Cancel</Button>
             </Box>
            </Box>      
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
