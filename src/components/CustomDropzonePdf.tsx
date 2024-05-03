import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, StyledEngineProvider, Typography } from '@mui/material';
import './wrapper/wrapper.css';
import { v4 as uuid } from 'uuid';
// styles
const baseStyle = {
  display: 'flex',
  transition: 'border .3s ease-in-out',
};
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

function CustomDropzonePdf(dataProps: any) {
  const props: any = dataProps.data;
  const tempFileName: any = uuid();
  // states
  const [isDisplayed, setDisplayed] = useState<any>(true);
  const [files, setFiles] = useState([]);
  const [fileSelected, setFileSelected] = useState(props.pdfDetails);
  // onDrop handler for file
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file: any) => {
        setDisplayed(false);
        file.tempFileName = tempFileName;
        if (props?.testimonialId) file.testimonialId = props.testimonialId;
        if (props?.mediaInfoId) file.mediaInfoId = props.mediaInfoId;
        props.setPdfUpload(file);
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
    accept: 'application/pdf',
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
      return (
        <Box className="draganddrop hero-pic" key={file.name}>
          <i className="icon-Incorrect" onClick={(e) => removeFile(file)} />
          <img src={file.preview} title="Sample Pdf" />
        </Box>
      );
    });
  }
  // if fileSelected present
  if (fileSelected) {
    thumbs = (
      <Box className="draganddrop hero-pic" key={props.pdfDetails.fileName}>
        <i className="icon-Incorrect" onClick={(e) => removeFileExisting()} />
        <img src={props.pdfDetails} title="Sample Pdf" />
      </Box>
    );
  }
  // if fileSelected and fileName present
  if (fileSelected && props.pdfDetails?.fileName) {
    thumbs = (
      <Box className="draganddrop hero-pic" key={props.pdfDetails?.fileName}>
        <i className="icon-Incorrect" onClick={(e) => removeFileExisting()} />
        <Box className="draganddropImg">
          <img src={props.pdfDetails} title="Sample Pdf" />
        </Box>
      </Box>
    );
  }
  // file preview
  useEffect(
    () => () => {
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  // remove File handler
  const removeFile = (file: any) => {
    setDisplayed(true);
    props.setPdfUpload({ isDeleted: file.tempFileName, isNew: true });
    const validFileIndex = files.findIndex((e: any) => e.name === file.name);
    files.splice(validFileIndex, 1);
    setFiles([...files]);
  };
  // remove File Existing handler
  const removeFileExisting = () => {
    setFileSelected(false);
    setDisplayed(true);
    props.setPdfUpload({ isDeleted: true, isNew: false });
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        {thumbs}
        {!fileSelected && isDisplayed ? (
          <Box className="draganddrop" {...getRootProps({ style })} sx={{ height: '136px' }}>
            <input {...getInputProps()} />
            <i className="icon-Photograph"></i>
            <Typography variant="h6">Drag and drop your PDF here</Typography>
            <span>
              or <a href="#">upload</a> from your computer
            </span>
          </Box>
        ) : (
          ''
        )}
      </StyledEngineProvider>
    </>
  );
}

export default CustomDropzonePdf;
