import { useEffect, useRef, useState } from 'react';
// @mui
import { Typography, StyledEngineProvider, Box, styled } from '@mui/material';
// @types
// components
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import { Stack } from '@mui/material';
import { TextField } from '@mui/material';
import {
  useMessageMediaUploadStatusMutation,
  usePatchMessageMutation,
  usePostMessageAttachmentMutation,
} from 'src/redux/splitEndpoints/messagesSplit';
import { v4 as uuid } from 'uuid';

export default function SendMessage(props: any) {
  // props
  const { rowData, setLoaderInProgress, isFileUpload, setIsFileUpload, 
    messageModuleAccess, setMessageModuleAccess, clickedPopover, setClickedPopover } = props;
  // states
  const [enteredText, setEnteredText] = useState('');
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  // message media
  const fileuuid: any = uuid();
  const [imageFile, setImageFile] = useState<File>();
  const [selectedFile, setFile] = useState<any>();
  const [preview, setPreview] = useState<any>('');
  const [allowFileTypes, setAllowFileTypes] = useState<any>('');
  // API call for POST message
  const [postMessage] = usePatchMessageMutation();
  // API call for POST attachments
  const [sendMessageAttachement, responSesendMessageAttachement] =
    usePostMessageAttachmentMutation();
  const [selectedType, SetSelectedType] = useState<any>('');
  const [mediauuid, SetMediauuid] = useState<any>('');
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  // API call for media status
  const [mediaUploadSuccess, mediaUploadSuccessResponse] =
    useMessageMediaUploadStatusMutation<any>();

  const inputFile = useRef<any>({});

  // file upload handler
  const fileUpload = async () => {
    SetSelectedType('files');
    setAllowFileTypes('.doc,.docx,application/pdf');
    setTimeout(() => {
      inputFile.current.click();
    }, 100);
  };

  // image upload handler
  const imageUpload = async () => {
    SetSelectedType('images');
    setAllowFileTypes('.jpg, .jpeg, .png');
    setTimeout(() => {
      inputFile.current.click();
    }, 100);
  };

  // on change file handler
  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    if (file.size < 10000000) {
      validateResolution(file);
      setFileSizeError(false);
    } else {
      setFileSizeError(true);
      setTimeout(() => {
        setFileSizeError(false);
      }, 6000);
    }
  };

  //Read the contents of Image File.
  const validateResolution = (file: any) => {
    var reader = new FileReader();
    var flag = '';
    reader.readAsDataURL(file);
    setImageFile(file);
    callProfileAPI(file);
  };

  // send attacments handler
  const callProfileAPI = (file: any) => {
    try {
      sendMessageAttachement({
        fileName: file.name,
        fileuuid,
        fileSize: file.size,
      }).then(async (res: any) => {
        if (selectedType == 'images') {
          setPreview(URL.createObjectURL(file));
        } else {
          setPreview('file');
        }
        setFile(file);
        SetMediauuid(fileuuid);
        setPresignedProfilePath(res.data.url);
      });
    } catch (error) {}
  };

  // message payload for API
  let messagePayload: any = {
    channelId: rowData?.msgChannelId,
    subject: rowData?.subject,
    message: enteredText,
    medias: [
      {
        mediauuid,
      },
    ],
  };

  // on send message handler
  const handleClickedkey = (e: any) => {
    if (enteredText === '') {
      setErrorDisplay(true);
    } else if (enteredText?.trim().length > 0) {
      setLoaderInProgress(true);
      postMessage(messagePayload);
      if (presignedProfilePath) {
        setIsFileUpload(true);
        setTimeout(() => {
          const uploadOptions = { method: 'Put', body: selectedFile };
          const result = fetch(presignedProfilePath, uploadOptions);
        }, 5000);
        setPresignedProfilePath('');
        // Media Upload check until lamda success
        let count = 1;
        const interval = setInterval(async () => {
          if (count >= 1) {
            let data: any = await mediaUploadSuccess([mediauuid]);

            if (data.error.data != 'SUCCESS') {
              count++;
              if (count === 10) {
                clearInterval(interval);
              }
            } else {
              count = 0;
            }
          }
        }, 3000);
      } else {
      }
      setTimeout(() => {
        setEnteredText('');
        setErrorDisplay(false);
        setFile('');
        SetMediauuid('');
        setPreview('');
        SetSelectedType('');
      }, 500);
    }
  };

  // rempve file handler
  const removeFile = () => {
    setFile('');
    SetMediauuid('');
    setPresignedProfilePath('');
    setPreview('');
    SetSelectedType('');
  };

  // on success media upload
  useEffect(() => {
    if (mediaUploadSuccessResponse?.error?.data == 'SUCCESS') {
      setLoaderInProgress(false);
      setIsFileUpload(false);
    }
  }, [mediaUploadSuccessResponse?.error?.data]);

  return (
    <StyledEngineProvider injectFirst>
      <Stack
        direction="row"
        className={`${(rowData?.messageStatus === 'Deleted' || messageModuleAccess?.message_send_within_conversation === false ) ? 'deletedBlock' : 'activeBlock'} ${
          rowData?.isRegistered === 0 ? 'unregisteredBlock' : ''
        }`}
      >
        <Box className="attach">
          <input
            type="file"
            id="file"
            ref={inputFile}
            style={{ display: 'none' }}
            onChange={onChangeFile}
            onClick={(event: any) => {
              event.target.value = null;
            }}
            accept={allowFileTypes}
          />
          <i className="icon-Photograph" onClick={imageUpload} />
        </Box>
        <Box className="attach" px={1}>
          <i className="icon-Paper-clip" onClick={fileUpload} />
        </Box>
        <Box sx={{ width: '100%' }} className="send-msg typing-message sendmessage-multi">
          <Box sx={{ width: '100%' }}>
            <TextField
              multiline
              autoFocus
              value={enteredText}
              onChange={(e: any) => setEnteredText(e.target.value)}
              sx={{ width: '100%' }}
              id="input-with-icon-textfield"
              placeholder="Type a message..."
              InputProps={{
                className: 'msg-type',
              }}
              variant="standard"
            />
            {preview && selectedType == 'images' ? (
              <>
                <Box className="previewsendImage">
                  <img src={preview} alt="preview image" />
                  <i className="icon-Incorrect" onClick={(e) => removeFile()} />
                </Box>
              </>
            ) : (
              ''
            )}

            {preview && selectedType == 'files' ? (
              <Box className="previewsendattach">
                {selectedFile?.name}
                <i className="icon-Incorrect" onClick={(e) => removeFile()} />
              </Box>
            ) : (
              ''
            )}
          </Box>
          <i className="icon-Send-Message" onClick={handleClickedkey} />
        </Box>
      </Stack>
      <Box className="error-msg-secttion">
        {errorDisplay && enteredText === '' && (
          <Typography className="errorMsg">Message is a required field</Typography>
        )}
        {fileSizeError && <Typography className="errorMsg">File size is exceeded</Typography>}
      </Box>
    </StyledEngineProvider>
  );
}
