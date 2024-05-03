import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box, StyledEngineProvider, InputLabel } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import Button from '@mui/material/Button';
import { toPascalCase } from 'src/utils/customFunctions';
/////////////////////////////////////////////////////////////////////
// Custom Dialog Title
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const MergeHorseResponseWrapper = (props: any) => {
  const {
    title,
    open,
    close,
    contents
  } = props;

  // Handle close
  const closeExists = () => {    
    close();
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

        {/* DialogContent starts */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className='select-favourite-pop-box merge'>
             <InputLabel >
             {props.contents.title}
             </InputLabel>
             <Box className='select-favourite-pop-inner' pt={1}>
              {toPascalCase(props.contents.desc)}
             </Box>
             <Box>
             <Button onClick={closeExists} className="search-btn ok-btn">
                      Ok
                    </Button>
                    </Box>
          </Box>       
        </DialogContent>
        {/* DialogContent ends */}
      </Dialog>
      {/* Dialog ends */}
    </StyledEngineProvider>
  );
};