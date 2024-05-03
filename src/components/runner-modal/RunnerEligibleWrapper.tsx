import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
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
import { useChangeEligibilityAllMutation, useChangeEligibilityForOnlyRunnerMutation } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import { LoadingButton } from '@mui/lab';
import { toast } from "react-toastify";
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

export const RunnerEligibleWrapperDialog = (props: any) => {
  const { open, close } = props;
  const [changeEligibilityLoader, setChangeEligibilityLoader] = useState(false);
  const [changeEligibilityForAllRaceLoader, setChangeEligibilityForAllRaceLoader] = useState(false);
  const [changeEligibilityForOnlyRunnerLoader, setChangeEligibilityForOnlyRunnerLoader] = useState(false);
  const [changeEligibility, responseChangeEligibility] = useChangeEligibilityMutation();
  const [changeEligibilityForAllRace, responseChangeEligibilityForAllRace] = useChangeEligibilityAllMutation();
  const [changeEligibilityForOnlyRunner, responseChangeEligibilityForOnlyRunner] = useChangeEligibilityForOnlyRunnerMutation();

  useEffect(() => {
    if (responseChangeEligibility.isSuccess) {
      let res: any = responseChangeEligibility;
      toast.success(res?.data?.message);
    }
  }, [responseChangeEligibility.isLoading])

  useEffect(() => {
    if (responseChangeEligibilityForAllRace.isSuccess) {
      let res: any = responseChangeEligibilityForAllRace;
      toast.success(res?.data?.message);
    }
  }, [responseChangeEligibilityForAllRace.isLoading])

  useEffect(() => {
    if (responseChangeEligibilityForOnlyRunner.isSuccess) {
      let res: any = responseChangeEligibilityForOnlyRunner;
      toast.success(res?.data?.message);
    }
  }, [responseChangeEligibilityForOnlyRunner.isLoading])

  const onUpdateRace = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (props.isEdit) {
      setChangeEligibilityLoader(true);
      try {
        let eligibleRes: any = await changeEligibility({ id: props.state.raceUuid, isEligible: props.state.isEligible })
        props.handleOnEligibleSuccess(eligibleRes);
        setChangeEligibilityLoader(false);
      } catch (error) {
        console.error(error);
        setChangeEligibilityLoader(false);
      }
    }
  }

  const onUpdateAllRace = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (props.isEdit) {
      setChangeEligibilityForAllRaceLoader(true);
      try {
        let eligibleRes: any = await changeEligibilityForAllRace({ id: props.state.runnerUuid, isEligible: props.state.isEligible })
        props.handleOnEligibleSuccess(eligibleRes);
        setChangeEligibilityForAllRaceLoader(false);
      } catch (error) {
        setChangeEligibilityForAllRaceLoader(false);
        console.error(error);
      }
    }
  }

  const onUpdateOnlyRunner = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (props.isEdit) {
      setChangeEligibilityForOnlyRunnerLoader(true);
      try {
        let eligibleRes: any = await changeEligibilityForOnlyRunner({ id: props.state.horseUuid, isEligible: props.state.isEligible })
        props.handleOnEligibleSuccess(eligibleRes);
        setChangeEligibilityForOnlyRunnerLoader(false);
      } catch (error) {
        console.error(error);
        setChangeEligibilityForOnlyRunnerLoader(false);
      }
    }
  }

  const handleClose = () => {
    close();
    props.handleOnEligibleClose();
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
            onClick={handleClose}
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

        <DialogContent className="popup-cnt" sx={{ p: '2.2rem' }}>
          <Box className='farmmerge-modal' mt={4}>
            <InputLabel>Update status to Race or Globally?</InputLabel>
            <Typography component='p' pt={2}>Do you wish to apply this status to all runners in this race only, or apply this status to ALL runners in it’s lifetime? <b>Proceed with caution as some runners can change race type. </b> </Typography>
            <Box className='remove-modal-bottom' pt={1}>
              <LoadingButton className='lr-btn lr-btn-race' fullWidth loading={changeEligibilityLoader} onClick={onUpdateRace}>Update Race</LoadingButton>
              <LoadingButton fullWidth className='lr-btn lr-btn-outline' loading={changeEligibilityForAllRaceLoader} onClick={onUpdateAllRace}>Update All</LoadingButton>
            </Box>
            <Box className='update-modal-bottom' pt={1}>
              <LoadingButton fullWidth className='add-btn golden-btn' loading={changeEligibilityForOnlyRunnerLoader} onClick={onUpdateOnlyRunner}>Update Only Runner</LoadingButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
