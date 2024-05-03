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

function CustomDropzoneHeroImage(dataProps: any) {
  const props: any = dataProps.data;
  const tempFileName: any = uuid();
  // states
  const [isDisplayed, setDisplayed] = useState<any>(true);
  const [files, setFiles] = useState([]);
  const [fileSelected, setFileSelected] = useState(props.heroImagesDetails);
  const [fileError, setFileError] = useState<any>({});
  const imageFormats = ['jpg', 'jpeg', 'png'];
  const videoFormats = ['mp4'];
  // onDrop handler for file
  const onDrop = useCallback((acceptedFiles) => {
    const fileSize = 10000000; //53983
    const formats = ['jpg', 'jpeg', 'png', 'gif'];
    console.log(acceptedFiles, 'acceptedFiles')
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
        props.setHeroFileUpload(file);
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
    accept: 'image/jpeg,image/png,image/jpg,image/gif',
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
      <Box className="draganddrop hero-pic" key={props.heroImagesDetails}>
        <i className="icon-Incorrect" onClick={(e) => removeFileExisting()} />
        <Box className="draganddropImg">
          {props.heroImagesDetails?.includes('gif') ? <img src={`${props.heroImagesDetails}`} alt="farm" /> :
            <img src={`${props.heroImagesDetails}?w=${dataProps?.size?.w}&h=${dataProps?.size?.h}`} alt="farm" />}
        </Box>
      </Box>
    );
  }
  // if fileSelected and fileName present
  if (fileSelected && props.heroImagesDetails?.fileName) {
    let imageFile, videoFile;
    const type = props.heroImagesDetails?.fileName.split('.')[1];
    imageFile = imageFormats.includes(type) ? (
      props.heroImagesDetails?.mediaUrl?.includes('gif') ? <img src={`${props.heroImagesDetails?.mediaUrl}`} alt={props.heroImagesDetails?.fileName} /> :
        <img src={`${props.heroImagesDetails?.mediaUrl}?w=${dataProps?.size?.w}&h=${dataProps?.size?.h}`} alt={props.heroImagesDetails?.fileName} />
    ) : (
      ''
    );
    videoFile = videoFormats.includes(type) ? (
      <video src={props.heroImagesDetails?.mediaUrl} width="350" height="350" controls />
    ) : (
      ''
    );
    thumbs = (
      <Box className="draganddrop hero-pic" key={props.heroImagesDetails?.fileName}>
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
    props.setHeroFileUpload({ isDeleted: file.tempFileName, isNew: true });
    const validFileIndex = files.findIndex((e: any) => e.name === file.name);
    files.splice(validFileIndex, 1);
    setFiles([...files]);
    setFileError(false);
  };
  // remove File Existing handler
  const removeFileExisting = () => {
    setFileSelected(false);
    setDisplayed(true);
    props.setHeroFileUpload({ isDeleted: true, isNew: false });
    setFileError(false);
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        {thumbs}
        {!fileSelected && isDisplayed ? (
          <Box className="draganddrop" {...getRootProps({ style })} sx={{ height: '136px' }}>
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

export default CustomDropzoneHeroImage;
