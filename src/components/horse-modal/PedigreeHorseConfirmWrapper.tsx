import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, StyledEngineProvider, InputLabel, Stack } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import Button from '@mui/material/Button';
import { toPascalCase } from 'src/utils/customFunctions';
import { useUpdateHorsePedigreeMutation } from 'src/redux/splitEndpoints/horseSplit';
import { LoadingButton } from '@mui/lab';

// Custom Dialog Title
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const PedigreeHorseConfirmWrapper = (props: any) => {
  const {
    title,
    open,
    closeConfirm,
    contents,
    oldPedigreeName,
    newPedigreeName,
    position,
    getHorseDetails,
    updatePedigreeData
  } = props;

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [updatePedigree] = useUpdateHorsePedigreeMutation();

  // Handle close
  const closeExisting = () => {    
    closeConfirm();
  }

  //Handle save new existing
  const saveNewExisting = async() => {
    setIsSubmitLoading(true);
    await updatePedigree(updatePedigreeData);
    setIsSubmitLoading(false);
    closeConfirm();
    getHorseDetails();
  }
  
  return (
    <StyledEngineProvider injectFirst>
      {/* Dialog starts */}
      <Dialog
        open={props.open}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={closeExisting}
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

        {/* DialogContent starts */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className='select-favourite-pop-box merge' pt={3}> 
              {oldPedigreeName !== '~Add New Pedigree~' &&
              <Stack>
              Change {toPascalCase(oldPedigreeName)} to {toPascalCase(newPedigreeName)} as {position}
              </Stack>
              }
              {oldPedigreeName === '~Add New Pedigree~' &&
              <Stack>
              Do you want to add {toPascalCase(newPedigreeName)} to {position}
              </Stack>
              }
             <Box className='select-favourite-pop-inner' pt={1}>Are you sure you want to make this change? This cannot be undone and may have implications across the whole platform with respect to pedigrees.</Box>
             <Box className='remove-modal-bottom'>
             <LoadingButton type="button" fullWidth  size="large" className="search-btn select-btn" loading={isSubmitLoading} onClick={saveNewExisting}>
             YES, MAKE CHANGE
             </LoadingButton>
             {/* <Button onClick={saveNewExisting} className="search-btn select-btn">YES, MAKE CHANGE</Button> */}
             <Button onClick={closeExisting} className="add-btn select-btn">NO, CANCEL</Button>
          </Box>
          </Box>       
        </DialogContent>
        {/* DialogContent ends */}
      </Dialog>
      {/* Dialog ends */}
    </StyledEngineProvider>
  );
};