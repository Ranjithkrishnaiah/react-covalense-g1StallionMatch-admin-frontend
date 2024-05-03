import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, StyledEngineProvider, Typography } from '@mui/material';
import './wrapper/wrapper.css';
import { v4 as uuid } from 'uuid';
import {
  useDeleteByUuidMutation,
  useFarmGalleryImagesUploadStatusMutation,
  useUploadImageMutation,
} from 'src/redux/splitEndpoints/marketingSplit';
import { Images } from 'src/assets/images';
import { CircularSpinner } from './CircularSpinner';
// styles
const baseStyle = {};
const activeStyle = {
  borderColor: '#2196f3',
};
const acceptStyle = {
  borderColor: '#00e676',
};
const rejectStyle = {
  borderColor: '#ff1744',
};
let selectedImages: any = [];

function CustomLogoUploadDropZone(dataProps: any) {
  const props: any = dataProps.data;
  const tempFileName: any = uuid();
  // Patch media status api call
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
  // states
  const [isDisplayed, setDisplayed] = useState<any>(true);
  const [isLoader, setIsLoader] = useState<any>(false);
  const [files, setFiles] = useState([]);
  const [fileSelected, setFileSelected] = useState(props.fileDetails);
  const [fileError, setFileError] = useState<any>({});
  const imageFormats = ['jpg', 'jpeg', 'png'];
  const videoFormats = ['mp4'];
  const galleryResolution = { height: 182, width: 105 };
  const [heroImagesDeletedId, setHeroImagesDeletedId] = useState<any>([]);
  let [galleryImages, setGalleryImages] = useState<any>([]);
  const [fileUpload, setFileUpload] = useState<any>();
  const fileuuid: any = uuid();
  // API call to post images
  const [postHeroImages] = useUploadImageMutation();
  // API call to delete images
  const [deleteByUuid] = useDeleteByUuidMutation();
  // onDrop handler for file
  const onDrop = useCallback((acceptedFiles) => {
    const fileSize = 10000000; //53983
    const formats = ['jpg', 'jpeg', 'png'];
    setFiles(
      acceptedFiles.map((file: any) => {
        const type = file.path.split('.').pop();
        if (file.size > fileSize) {
          setFileError({ message: 'File size is exceeded' });
          return false;
        } else {
          setFileError({});
        }
        if (!formats.includes(type)) {
          setFileError({ message: `Please upload only ${formats.join(', ')}.` });
          return false;
        } else {
          setFileError({});
        }
        setDisplayed(false);
        file.tempFileName = tempFileName;
        if (props?.testimonialId) file.testimonialId = props.testimonialId;
        if (props?.mediaInfoId) file.mediaInfoId = props.mediaInfoId;
        if (props?.position) file.position = props.position;
        setFileUpload(file);
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      })
    );
  }, []);

  // useDropzone customize function
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: 'image/jpeg, image/png',
  });
  const style: any = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );
  let thumbs: any = '';
  // if fileSelected not present
  if (!fileSelected) {
    thumbs = files.map((file: any) => {
      if (selectedImages.indexOf(file.name) === -1) selectedImages.push(file.name);
      if (!fileError.message) {
        return (
          <Box className="draganddrop hero-pic" key={file.name}>
            <i className="icon-Incorrect" onClick={(e) => removeFile(file)} />
            <Box className="draganddropImg">
              <img src={file.preview} alt="stallions" />
            </Box>
          </Box>
        );
      }
    });
  }
  // if fileSelected present
  if (fileSelected) {
    thumbs = (
      <Box className="draganddrop hero-pic" key={props.fileDetails}>
        <i className="icon-Incorrect" onClick={(e) => removeFileExisting()} />
        <Box className="draganddropImg">
          <img src={props.fileDetails} alt="farm" />
        </Box>
      </Box>
    );
  }
  // if fileSelected and fileName present
  if (fileSelected && props.fileDetails?.fileName) {
    let imageFile, videoFile;
    const type = props.fileDetails?.fileName.split('.')[1];
    imageFile = imageFormats.includes(type) ? (
      <img src={`${props.fileDetails?.imageUrl}?w=${dataProps?.size?.w}&h=${dataProps?.size?.h}`} alt={props.fileDetails?.fileName} />
    ) : (
      ''
    );
    videoFile = videoFormats.includes(type) ? (
      <video src={props.fileDetails?.imageUrl} width="350" height="350" controls />
    ) : (
      ''
    );
    thumbs = (
      <Box className="draganddrop hero-pic" key={props.fileDetails?.fileName}>
        <i className="icon-Incorrect" onClick={(e) => removeFileExisting()} />
        <Box className="draganddropImg">
          {imageFile} {videoFile}
        </Box>
      </Box>
    );
  }
  // file preview
  useEffect(
    () => () => {
      if (!fileError.message) files.forEach((file: any) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  // remove File handler
  const removeFile = (file: any) => {
    setDisplayed(true);
    setFileUpload({ isDeleted: file.tempFileName, isNew: true });
    const validFileIndex = files.findIndex((e: any) => e.name === file.name);
    files.splice(validFileIndex, 1);
    setFiles([...files]);
    setFileError(false);
  };
  // remove File Existing handler
  const removeFileExisting = () => {
    setFileSelected(false);
    setDisplayed(true);
    setFileUpload({ isDeleted: fileSelected?.id, isNew: false });
    setFileError(false);
  };
  // call on file upload and deleted
  React.useEffect(() => {
    if (fileUpload && !fileUpload.isDeleted) {
      const fileAsDataURL = window.URL.createObjectURL(fileUpload);
      const img = new Image();
      img.src = fileAsDataURL;
      img.onload = function (this: any) {
        var height = this.height;
        var width = this.width;
        console.log(height, width, galleryResolution, 'galleryResolution')
        if (height >= galleryResolution.height && width >= galleryResolution.width) {
          setIsLoader(true);
          try {
            postHeroImages({
              fileName: fileUpload.path,
              fileuuid: fileuuid,
              fileSize: fileUpload.size,
              marketingPageSectionUuid: '284C00A1-3A9F-4B0E-BF35-6CE4AF8DD72A',
            }).then(async (res: any) => {
              setGalleryImages([
                ...galleryImages,
                {
                  file: fileUpload,
                  mediauuid: fileuuid,
                  url: res.data.url,
                  isNew: true,
                  position: fileUpload.position,
                },
              ]);
              // dataProps?.setOnSuccessCallApi(false);
              const uploadOptions = { method: 'Put', body: fileUpload };
              const result = await fetch(res.data.url, uploadOptions);
              // mediaUploadSuccess([fileuuid]);
              let count = 1;
              const interval = setInterval(async () => {
                if (count >= 1) {
                  let data: any = await mediaUploadSuccess([fileuuid]);
                  // console.log(data,'DTATA')
                  if (data.error.data != 'SUCCESS') {
                    count++;
                    if (count === 10) {
                      clearInterval(interval);
                    }
                  } else {
                    count = 0;
                    // dataProps?.setOnSuccessCallApi(true);
                    setIsLoader(false);
                  }
                }
              }, 3000);
            });
          } catch (error) { }
        } else {
          setFileError({ message: `Image Resolution is less then ${galleryResolution?.width}*${galleryResolution?.height}` });
        }
      };
    }
    if (fileUpload && 'isDeleted' in fileUpload) {
      let imagesDeletedId = [...heroImagesDeletedId, fileUpload.isDeleted];
      setHeroImagesDeletedId(imagesDeletedId);
      const removeSpecificFile = props.galleryImages.map((res: any) => {
        return {
          ...res,
          isDeleted: imagesDeletedId.includes(res.id) ? true : false,
        };
      });
      try {
        deleteByUuid({ id: imagesDeletedId[0] });
      } catch (error) { }
    }
  }, [fileUpload]);

  return (
    <>
      <StyledEngineProvider injectFirst>
        <Box className='logo-parent'>
          {thumbs}
          {isLoader && <Box className='logo-spinner'><CircularSpinner /></Box>}
        </Box>
        {!fileSelected && isDisplayed ? (
          <Box className="draganddrop clientLogo" {...getRootProps({ style })} sx={{ height: '136px' }}>
            <input {...getInputProps()} />
            <img src={Images.uploadicon} alt="Photograph" />
            <Typography variant="h6">Drag and drop your images here</Typography>
            <span>
              or <a href="#">upload</a> from your computer
            </span>
          </Box>
        ) : (
          ''
        )}
        {fileError ? <Typography className="error-text">{fileError?.message}</Typography> : ''}
      </StyledEngineProvider>
    </>
  );
}

export default CustomLogoUploadDropZone;
