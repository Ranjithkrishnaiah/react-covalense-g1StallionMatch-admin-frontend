import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import 'src/components/horse-modal/horsewrapper.css';
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
import ExistsStallionList from './ExistsStallionList';
import { useAddStallionMutation } from 'src/redux/splitEndpoints/stallionSplit';
import { useSnackbar } from 'notistack';
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
  const {
    openExists,
    closeExists,
    existStallionList,
    setExistStallionList,
    createStallionData,
    setCreateStallionData,
    forceCreateNew,
    setForceCreateNew,
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    getStallionIdModal
  } = props;
  const [addStallion, addStallionResult] = useAddStallionMutation<any>();
  const { enqueueSnackbar } = useSnackbar();
  const handleCreateForceStallion = async () => {
    setForceCreateNew(true);
    try {
      await addStallion({ ...createStallionData, forceCreateNew: true });
      closeExists();
      enqueueSnackbar('Create success!');
    } catch (error) {
      console.error(error);
    }
  }
  const getStallionId = (id:any) => {
    getStallionIdModal(id)
  }
  return (
    <StyledEngineProvider injectFirst>
      <Dialog
        open={props.openExists}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={closeExists}
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
            {/* <InputLabel >The below stallions have the same name. Click a stallion to replace or create a new stallion.</InputLabel> */}
            <InputLabel sx={{fontSize: '18px !important',lineHeight: '28px !important', color: '#000000 !important', letterSpacing: '-0.01em !important'}}>It appears the stallion you are attemping to add/edit already exists. Please confirm:</InputLabel>

            <Box className='select-favourite-pop-inner' pt={1}>
              <List component="nav" aria-label="" className='select-favourite-list'>
                {
                  (existStallionList.length > 0 && existStallionList.map((fsData: any) => <ExistsStallionList
                    key={fsData.stallionId}
                    data={fsData}
                    open={open}
                    handleEditPopup={handleEditPopup}
                    rowId={rowId}
                    isEdit={rowId}
                    openAddEditForm={openAddEditForm}
                    handleDrawerCloseRow={handleDrawerCloseRow}
                    handleCloseEditState={handleCloseEditState}
                    closeExists={closeExists}
                    getStallionId={getStallionId}
                  />))
                }
              </List>
            </Box>

            <Box className='favourite-bottom-button'>
              <Button type='button' fullWidth className='lr-btn' onClick={handleCreateForceStallion}>Create New</Button>
              <Button type='button' fullWidth className='lr-btn lr-btn-outline'>Cancel</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
