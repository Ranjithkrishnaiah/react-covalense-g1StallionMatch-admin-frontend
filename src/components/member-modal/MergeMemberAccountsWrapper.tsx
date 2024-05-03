import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState, useRef } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SelectMemberName from '../SelectMemberName';
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


const searchforafarm = [
    { label: 'Matthew Ennis', year: 1994 },
    { label: 'Farid Dev', year: 1972 },
    { label: 'Ravi Covalense', year: 1974 },
  ];
  

export const MergeMemberAccountsWrapperDialog = (props: any) => {
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
        <Box className='mergefarm-account-modal' mt={4}>
            <InputLabel>Search for a User</InputLabel>
            <Box className='edit-field search-autocomplete'>
              <SelectMemberName />
                {/* <Autocomplete
                componentsProps={{
                  paper: {
                    sx: {
                    //   width: 300
                    }
                  }
                }}
                popupIcon={<KeyboardArrowDownIcon/>}
                disablePortal
                includeInputInList
                id="combo-box-demo"
                options={nameFilterOptions}
                getOptionLabel={(option:any) => option?.fullName}
                onInputChange={handleNameInput}
                onChange={(e:any, selectedOptions: any) => handleNameSelect(selectedOptions)}
                renderInput={(params) => <TextField {...params} placeholder='Search for a User' />}
            /> */}
            </Box>
        </Box>         
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
