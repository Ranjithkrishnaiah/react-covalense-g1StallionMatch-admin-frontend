import React from 'react'
import {
  Badge,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  StyledEngineProvider,
} from '@mui/material';
import { CustomDialogTitle } from './WrappedDialog/WrapperDialog';
import './WrappedDialog/dialogPopup.css';
import { VoidFunctionType } from 'src/@types/typeUtils';
import { CustomRangeSlider } from './CustomRangeslider';
import { CustomButton } from './CustomButton';
// import '../forms/LRpopup.css'
import './WrappedDialog/dialogPopup.css'
import CropCon from './imageCrop/cropCon';
import { toast } from 'react-toastify';
import { Spinner } from './Spinner';

type CropImageDialogProps = {
  open: boolean;
  title: string;
  imgName: string;
  imgSrc: string;
  awsUrl: string;
  imgFile: any;
  setCropPrevImg?: any;
  setCropImageFile?: any;
  circularCrop?: boolean;
  uniqueUuid?: string;
  onClose: VoidFunctionType
}

function CropImageDialogSimple(props: CropImageDialogProps) {
  const [Reset, setReset] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [cropUrl, setCropUrl] = React.useState('');
  const [urlObj, setUrlObj] = React.useState<any>();
  const [ImgCor, setImgCor] = React.useState<any>();
  const [uploadInProgress, setUploadInProgress] = React.useState<any>(false);
  
  // close and reset handler
  const closeAndReset = () => {
    // props?.setCropImageFile("");
    props.onClose();
    setReset(true);
  };

  // submit handler 
  const handleSubmit = async () => {
    const type: any = /[^.]+$/.exec(props.imgName);
    const file = new File([urlObj.blob], props.imgName, { type: `image/${type[0] === 'jpg' ? 'jpeg' : type[0]}` });
    
    if (props?.imgFile?.size <= 10000000) {  
      if (props?.setCropImageFile && props?.setCropImageFile) {
        props?.setCropImageFile(file);
      } 
      closeAndReset();
    } else {
      toast.error('File size exceeded. Maximum upload file size is 10MB')
    }
  }
  
  // handleZoom and image handler
  const handleZoom = (e: any) => setZoom(e.target.value)
  const handleImageUrl = (url: any, completedCrop: any) => {
    setCropUrl(url.previewUrl);
    setUrlObj(url);
    if(props.setCropPrevImg) props.setCropPrevImg(url.previewUrl);
    setImgCor(completedCrop);
  }

  
  let iconSx: any = undefined;

  return (
    <StyledEngineProvider injectFirst>
      <Dialog open={props.open} className='dialogPopup image-crop-popup'>
        <CustomDialogTitle>
          {props.title}
          <IconButton
            aria-label="close"
            onClick={closeAndReset}
            sx={
              iconSx || {
                position: 'absolute',
                right: 12,
                width: 36,
                height: 36,
                top: 18,
                color: '#1D472E',
              }
            }
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>
        <DialogContent className='image-crop'>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            style={{ margin: 'auto' }}
          >
          </Badge>
          {props.imgSrc && <CropCon imgSrc={props.imgSrc} zoom={zoom} handleImageUrl={handleImageUrl} circularCrop={props.circularCrop} />}
          <Box className='slider-drag'>
            <Box className='crop-slider'><p>-</p><CustomRangeSlider
            value={zoom}
            onChange={handleZoom}
            valueLabelDisplay="auto"
            min={1}
            max={10}
            step={0.1}
          /><p>+</p></Box>
          </Box>
          <Box className='saveBtn'>
          <CustomButton className="save-img-btn" onClick={handleSubmit}>Save Image</CustomButton>
          </Box>
        </DialogContent>
      </Dialog>
      {uploadInProgress ? (<Box className="spin-load"><Spinner /></Box>) : ''}
    </StyledEngineProvider>
  )
}

export default CropImageDialogSimple