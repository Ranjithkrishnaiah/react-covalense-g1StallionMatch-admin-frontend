import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, StyledEngineProvider, Typography } from '@mui/material';
import './wrapper/wrapper.css';
import { v4 as uuid } from 'uuid';
import { Images } from 'src/assets/images';
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

function CustomDropzone(dataProps: any) {
  const props: any = dataProps.data;
  const tempFileName: any = uuid();
  // console.log(dataProps, 'dataProps');
  // states
  const [isDisplayed, setDisplayed] = useState<any>(true);
  const [files, setFiles] = useState([]);
  const [fileSelected, setFileSelected] = useState(props.fileDetails);
  const [fileError, setFileError] = useState<any>({});
  const imageFormats = ['jpg', 'jpeg', 'png'];
  const videoFormats = ['mp4'];
  // onDrop handler for file
  const onDrop = useCallback((acceptedFiles) => {
    const fileSize = 10000000; //53983
    const formats = ['jpg', 'jpeg', 'png'];
    setFiles(
      acceptedFiles.map((file: any) => {
        const type = file.path.split('.').pop();
        if (dataProps.galleryResolution) {
          var reader = new FileReader();
          //Read the contents of Image File.
          reader.readAsDataURL(file);
          reader.onload = function (e: any) {
            //Initiate the JavaScript Image object.
            var image = new Image();

            //Set the Base64 string return from FileReader as source.
            image.src = e.target.result;

            //Validate the File Height and Width.
            image.onload = function (this: any) {
              var height = this.height;
              var width = this.width;
              if (
                height < dataProps.galleryResolution.height ||
                width < dataProps.galleryResolution.width
              ) {
                setFileError({
                  message: `The image dimensions must be at least ${dataProps.galleryResolution.width}px*${dataProps.galleryResolution.height}px.`,
                });
                file.invalidPath = true;
              }
            };
          };
        }
        if (file.invalidPath) {
          setFileError({
            message: `The image dimensions must be at least ${dataProps.galleryResolution.width}px*${dataProps.galleryResolution.height}px.`,
          });
          return false;
        } else {
          setFileError({});
        }
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
        props.setFileUpload(file);
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
          <img
            src={`${props.fileDetails}?w=${dataProps?.size?.w}&h=${dataProps?.size?.h}`}
            alt="farm"
          />
        </Box>
      </Box>
    );
  }
  // if fileSelected and fileName present
  if (fileSelected && props.fileDetails?.fileName) {
    let imageFile, videoFile;
    const type = props.fileDetails?.fileName.split('.')[1];
    imageFile = imageFormats.includes(type) ? (
      <img
        src={`${props.fileDetails?.mediaUrl}?w=${dataProps?.size?.w}&h=${dataProps?.size?.h}`}
        alt={props.fileDetails?.fileName}
      />
    ) : (
      ''
    );
    videoFile = videoFormats.includes(type) ? (
      <video src={props.fileDetails?.mediaUrl} width="350" height="350" controls />
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
  // removeFile
  useEffect(
    () => () => {
      removeFile(files);
    },
    [props.Reset]
  );

  // remove File handler
  const removeFile = (file: any) => {
    setDisplayed(true);
    props.setFileUpload({ isDeleted: file.tempFileName, isNew: true });
    const validFileIndex = files.findIndex((e: any) => e.name === file.name);
    files.splice(validFileIndex, 1);
    setFiles([...files]);
    setFileError(false);
  };
  // remove File Existing handler
  const removeFileExisting = () => {
    setFileSelected(false);
    setDisplayed(true);
    props.setFileUpload({
      isDeleted: true,
      isNew: false,
      mediauuid: props?.fileDetails?.mediauuid,
    });
    setFileError(false);
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        {thumbs}
        {!fileSelected && (isDisplayed || fileError?.message) ? (
          <Box className="draganddrop farmImg" {...getRootProps({ style })} sx={{ height: '136px' }}>
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

export default CustomDropzone;
