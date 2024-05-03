import * as React from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import Select ,{ SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuItem from '@mui/material/MenuItem';
import { Images } from "src/assets/images";
import 'src/components/wrapper/wrapper.css';
import { MenuProps } from 'src/constants/MenuProps';
import { horsefilterConstants } from 'src/constants/HorseFilterConstants';
import { toPascalCase } from 'src/utils/customFunctions';
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



const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 46,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 20,
      height: 20,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));

//   const [active, setActive] = React.useState('');
//   const handleActive = (e: SelectChangeEvent)=>{
//     setActive(e.target.value);
//   }

export const FindDuplicatesWrapperDialog = (props: any) => {
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
        <Box className='finddupicates-modal' mt={4}>
           <InputLabel>Duplicate based on</InputLabel>
           <Box className='edit-section '>
            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Name</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch defaultChecked />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>
                
                <Box className='edit-field'>
                <Select 
                MenuProps={MenuProps}
                IconComponent = {KeyboardArrowDownRoundedIcon}
                name="active"  defaultValue="and" className="filter-slct">
                  {horsefilterConstants?.duplicateSettingList?.map(({ id, Name }) => {
                    return (
                      <MenuItem className="selectDropDownList" value={id} key={id}>
                        {toPascalCase(Name)}
                      </MenuItem>
                    );
                  })}
                </Select>
                </Box>
            </Box>  

            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Sex</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch  />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>

                <Box className='edit-field'></Box>
            </Box>  

            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Country</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch defaultChecked />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>

                <Box className='edit-field'>
                <Select 
                MenuProps={MenuProps}
                IconComponent = {KeyboardArrowDownRoundedIcon}
                name="active"  defaultValue="and" className="filter-slct">
                    {horsefilterConstants?.duplicateSettingList?.map(({ id, Name }) => {
                    return (
                      <MenuItem className="selectDropDownList" value={id} key={id}>
                        {toPascalCase(Name)}
                      </MenuItem>
                    );
                  })}
                </Select>
                </Box>
            </Box>  

            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Birth Year</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>

                <Box className='edit-field'></Box>
            </Box>  


            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Sire</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch defaultChecked />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>

                <Box className='edit-field'>
                <Select 
                MenuProps={MenuProps}
                IconComponent = {KeyboardArrowDownRoundedIcon}
                name="active"  defaultValue="and" className="filter-slct">
                    {horsefilterConstants?.duplicateSettingList?.map(({ id, Name }) => {
                    return (
                      <MenuItem className="selectDropDownList" value={id} key={id}>
                        {toPascalCase(Name)}
                      </MenuItem>
                    );
                  })}
                </Select>
                </Box>
            </Box> 

            <Box className='FormGroup'>
                    <Box className='RHF-Switches'>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Dam</Typography>
                    <FormControlLabel 
                        control={<IOSSwitch defaultChecked />}
                        label=""
                        name="requiredVerification"
                    />
                </Box>

                <Box className='edit-field'>
                <Select 
                MenuProps={MenuProps}
                IconComponent = {KeyboardArrowDownRoundedIcon}
                name="active"  defaultValue="and" className="filter-slct">
                    {horsefilterConstants?.duplicateSettingList?.map(({ id, Name }) => {
                    return (
                      <MenuItem className="selectDropDownList" value={id} key={id}>
                        {toPascalCase(Name)}
                      </MenuItem>
                    );
                  })}
                </Select>
                </Box>
            </Box>  

           </Box>

           <Box className='ModalFooter'>
                <Button className='lr-btn' fullWidth type='button' disabled>Search</Button>
            </Box>

        </Box>         
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
