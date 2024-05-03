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
import { v4 as uuid } from 'uuid';
import './WrappedDialog/dialogPopup.css';
import { VoidFunctionType } from 'src/@types/typeUtils';
import { CustomRangeSlider } from './CustomRangeslider';
import { CustomButton } from './CustomButton';
import './LRpopup.css'
import './WrappedDialog/dialogPopup.css'
import CropCon from './imageCrop/cropCon';
import { toast } from 'react-toastify';
import {
  useUpdateHorseImageMutation,
  useHorseImagesUploadStatusMutation
} from 'src/redux/splitEndpoints/horseSplit';

import { Spinner } from './Spinner';
import { LoadingButton } from '@mui/lab';

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
  onClose: VoidFunctionType;
  horseId?: string;
  setIsCroppedImageError?: any;
}
function CropImageDialog(props: CropImageDialogProps) {
  const [Reset, setReset] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [cropUrl, setCropUrl] = React.useState('');
  const [urlObj, setUrlObj] = React.useState<any>();
  const [ImgCor, setImgCor] = React.useState<any>();
  const [uploadInProgress, setUploadInProgress] = React.useState<any>(false);
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useHorseImagesUploadStatusMutation();
  const [sendPatchRequest, patchResponse] = useUpdateHorseImageMutation();
  let details = { fileName: "", fileuuid: uuid(), fileSize: 0 }
  // close and reset handler
  const closeAndReset = () => {
    props.onClose();
    setReset(true);
    props.setCropPrevImg(null);
  };

  // method to crop image
  function getCroppedImg(image: any, pixelCrop: any, fileName: any) {
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx: any = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((file: any) => {
        resolve(file);
      }, urlObj?.blob?.type);
    });
  }
  const getBlob = async (fileUri: any) => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };
  const dataURLtoFile = (dataurl: any, filename: any) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // submit handler 
  const handleSubmit = async () => {
    const type: any = /[^.]+$/.exec(props.imgName);
    const file = new File([urlObj?.blob], props.imgName, { type: `image/${type[0] === 'jpg' ? 'jpeg' : type[0]}` });
    // console.log(file, urlObj, 'file123')
    if (file.size <= 10000000) {

      props?.setCropImageFile(file);
      setUploadInProgress(true);
      const uploadOptions = { method: 'PUT', body: file }
      let res = await sendPatchRequest({ profileImageuuid: props.uniqueUuid, horseId: props.horseId })
      let result = await fetch(props.awsUrl, uploadOptions)
      if (props.uniqueUuid) {
        const mediaFileuuid = props.uniqueUuid;
        let count = 1;
        const interval = setInterval(async () => {
          if (count >= 1) {
            let data: any = await mediaUploadSuccess([
              mediaFileuuid,
            ]);
            if (data.error.data != 'SUCCESS') {
              count++;
              if (count === 10) {
                clearInterval(interval);
              }
            } else {
              count = 0;
              setUploadInProgress(false);
            }
          }
        }, 3000);
      }
      // }
      props.setIsCroppedImageError(false);
      closeAndReset();
    } else {
      // console.log(props,'callled')
      toast.error('Crop size should be less then 10MB')
      props.setIsCroppedImageError(true);
      // if(props.open) props.setCropPrevImg(null);
    }
  }

  // method get File From Base64
  function getFileFromBase64(string64: string, fileName: string) {
    const trimmedString = string64.replace('data:image/png;base64', '');
    const imageContent = atob(trimmedString);
    const buffer = new ArrayBuffer(imageContent.length);
    const view = new Uint8Array(buffer);

    for (let n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }
    const type = 'image/jpeg';
    const blob = new Blob([buffer], { type });
    return new File([blob], fileName, { lastModified: new Date().getTime(), type });
  }

  // handleZoom and image handler
  const handleZoom = (e: any) => setZoom(e.target.value)
  const handleImageUrl = (url: any, completedCrop: any) => {
    console.log(url, 'URLLL')
    setCropUrl(url.previewUrl);
    setUrlObj(url);
    if (props.setCropPrevImg) props.setCropPrevImg(url.previewUrl);
    setImgCor(completedCrop);
  }

  // convert To Base64
  const convertToBase64 = () => {
    var reader = new FileReader();
    reader.readAsDataURL(urlObj.blob);
    var base64data: any = '';
    reader.onloadend = function () {
      base64data = reader.result;
    }
    return base64data;
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
            <LoadingButton fullWidth size="large" className="lr-btn" loading={uploadInProgress} onClick={handleSubmit}>
              Save Image
            </LoadingButton>
            {/* <CustomButton className="save-img-btn" onClick={handleSubmit} loa>Save Image</CustomButton> */}
          </Box>
        </DialogContent>
      </Dialog>
      {uploadInProgress ? (<Box className="spin-load"><Spinner /></Box>) : ''}
    </StyledEngineProvider>
  )
}

export default CropImageDialog