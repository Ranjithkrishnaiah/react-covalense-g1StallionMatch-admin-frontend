import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, StyledEngineProvider, InputLabel } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import FarmAutoFilter from 'src/components/FarmAutoFilter';
/////////////////////////////////////////////////////////////////////
// Custom Dialog Title
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const MergeFarmAccountsWrapperDialog = (props: any) => {
  const {
    open,
    close,
    stateMerge,
    setStateMerge,
    pageType,
    userModuleAccessAddBtn,
    setUserModuleAccessAddBtn,
  } = props;
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

        {/* DialogContent starts */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className="mergefarm-account-modal" mt={4}>
            <InputLabel>Search for a Farm</InputLabel>
            <Box className="edit-field search-autocomplete">
              {/* FarmAutoFilter */}
              <FarmAutoFilter
                setFarmId={props?.setFarmId}
                farmName={stateMerge}
                pageType={pageType}
                isEdit={props?.isEdit}
                isExist={props?.isExist}
                isOpen={open || props?.openAddEditForm}
              />
            </Box>
          </Box>
        </DialogContent>
        {/* DialogContent ends */}
      </Dialog>
      {/* Dialog ends */}
    </StyledEngineProvider>
  );
};
