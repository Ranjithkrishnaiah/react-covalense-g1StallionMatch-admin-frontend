import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
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
import 'src/components/wrapper/wrapper.css';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePostEmailShareMutation } from 'src/redux/splitEndpoints/stallionsSplit';
import { useSnackbar } from 'notistack';
import { TextareaAutosize } from '@mui/material';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const ShareMailWrapperDialog = (props: any) => {
  const { open, close, stallionID, pdfDataUrl, fromDate, toDate, reportType, filterBy } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [emailAddress, setEmailAddress] = useState('');
  const [comments, setComments] = useState('');
  const [postEmail] = usePostEmailShareMutation();

  // email validation regular expression
  let emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  // method to validate form
  const validateFarm = () => {
    if (emailReg.test(emailAddress) == false || comments === '') {
      return false;
    } else {
      return true;
    }
  };

  // onSubmit form
  const onSubmit = async () => {
    try {
      let emailPayload = {
        stallionId: stallionID,
        toEmail: emailAddress,
        comment: comments,
        fromDate: fromDate,
        toDate: toDate,
        type: reportType,
        filterBy: filterBy,
        // pdfLink: pdfDataUrl,
      };
      postEmail(emailPayload);
      enqueueSnackbar('Email sent successfully!');
    } catch (error) {
      console.error(error);
    }
    close();
  };

  // set initial state on popup close
  useEffect(() => {
    if (open === false) {
      setEmailAddress('');
      setComments('');
    }
  }, [open]);

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
          <Box className="farmmerge-modal" mt={4}>
            <Box className="mergefarm-account-modal" mt={4}>
              <InputLabel>To</InputLabel>
              <Box className="edit-field search-autocomplete">
                <TextField
                  fullWidth
                  name="toEmail"
                  value={emailAddress}
                  onChange={(e: any) => setEmailAddress(e.target.value)}
                  placeholder="Enter Email Address"
                  className="edit-field"
                />
              </Box>
            </Box>
            <Box className="mergefarm-account-modal" mt={4}>
              <InputLabel>Comments</InputLabel>
              <Box className="edit-field search-autocomplete">
                <TextareaAutosize
                  name="comments"
                  minRows={5}
                  value={comments}
                  onChange={(e: any) => setComments(e.target.value)}
                  placeholder="Enter Comments"
                  className="edit-field"
                />
              </Box>
            </Box>
            <Box className="remove-modal-bottom full-width" pt={2} pb={2}>
              <Button
                disabled={!validateFarm()}
                type="submit"
                fullWidth
                className="lr-btn"
                onClick={onSubmit}
              >
                Submit
                {/* {pdfDataUrl == undefined ? 'Generating Pdf' : 'Submit'} */}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
