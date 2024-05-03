import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  StyledEngineProvider,
  Button,
  InputLabel,
} from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import { useUpdateRaceHorseUrlMutation } from 'src/redux/splitEndpoints/raceHorseSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { LoadingButton } from '@mui/lab';

/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const EditUrlWrapperDialog = (props: any) => {
  const { open, close, raceHorseId, aliasName, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg } = props;
  const [horseAliasName, setHorseAliasName] = useState(aliasName);
  const [updateRaceHorseUrl] = useUpdateRaceHorseUrlMutation(); 
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Update the race horse url for frontend
  const handleUpdateRaceHorseName = async() => {
    setIsSubmitLoading(true);
    let res: any = await updateRaceHorseUrl({raceHorseId: raceHorseId, raceHorseUrl: horseAliasName});
    setIsSubmitLoading(false);
    if (setApiStatusMsg && setApiStatus) {
      if (res?.data) {
        setApiStatusMsg({
          status: 201,
          message: `<b>Race horse url has been updated successfully.`,
        });
        setApiStatus(true);
      }
      if (res?.error) {
        const error: any = res.error;
        if (res?.error.status === 422) {
          var obj = error?.data?.errors;
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const element = obj[key];
              setApiStatusMsg({ status: 422, message: element });
              setApiStatus(true);
            }
          }
        }
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
              color: () => '#1D472E',
            }}
          >
          <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>
        <DialogContent className="popup-cnt " sx={{ p: '2rem' }}>     
          <Box className='FormGroup' mt={5.5}>
            <InputLabel>{process.env.REACT_APP_PUBLIC_URL}</InputLabel>
              <Box className='edit-field'>
                <TextField name="aliasRaceHorseName" placeholder='Enter Subdirectory' defaultValue={toPascalCase(aliasName)?.toString()} className='hp-form-input' onChange={(e) => setHorseAliasName(e.target.value)} />
              </Box>
          </Box>
          <Box className='ModalFooter display-flex' pt={4}>
              {/* <Button type='button' fullWidth className='lr-btn md' onClick={() => handleUpdateRaceHorseName()}>Save</Button> */}
              <LoadingButton type="button" fullWidth  size="large" className="lr-btn md" loading={isSubmitLoading} onClick={handleUpdateRaceHorseName}>
                      Save
              </LoadingButton>
              <Button type='button' fullWidth className='lr-btn lr-btn-outline md' onClick={close}>Cancel</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};