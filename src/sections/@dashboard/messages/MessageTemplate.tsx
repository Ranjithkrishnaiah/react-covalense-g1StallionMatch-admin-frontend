import React, { useState } from 'react';
// @mui
import { Typography, StyledEngineProvider, Divider, Box } from '@mui/material';
import 'src/sections/@dashboard/css/list.css';
import { getDateForMessage, toPascalCase } from 'src/utils/customFunctions';
import { Stack } from '@mui/material';
import { Avatar } from '@mui/material';
import { Images } from 'src/assets/images';
import { useGetFarmMembersQuery } from 'src/redux/splitEndpoints/messagesSplit';

export default function MessageTemplate(props: any) {
  // props
  const { rowData, message, prevMessage } = props;

  // API call to get farm members
  const { data: farmMembersList } = useGetFarmMembersQuery(rowData?.farmId);

  const checkFarmExists = farmMembersList?.some(
    (farm: any) => farm?.memberId === message?.senderId
  );

  const messageDate = getDateForMessage(message?.timestamp);
  const prevMessageDate = getDateForMessage(prevMessage?.item.timestamp);
  const [time, setTime] = useState<any>('');
  const [messageTitle, setMessageTitle] = useState<any>();
  const [receipentNameVar, setReceipentNameVar] = useState<any>();

  // time conversion from API data
  React.useEffect(() => {
    if (message?.timestamp !== null && message?.timestamp !== undefined) {
      const timeData = new Date(message?.timestamp)
        .toLocaleTimeString()
        .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
      setTime(timeData.toLocaleString());
    }
  }, [message?.timeStamp]);

  // logics for setting MessageTitle and ReceipentName
  React.useEffect(() => {
    if (
      message?.isAccepted === false &&
      message?.isCounterOffer === false &&
      message?.isDeclined === false
    ) {
      setMessageTitle(`${message?.senderName} has sent a Nomination Offer.`);
      setReceipentNameVar(message?.farmName);
    } else if (
      message?.isAccepted === false &&
      message?.isCounterOffer === true &&
      message?.isDeclined === false &&
      checkFarmExists
    ) {
      setMessageTitle(`${message?.senderName} have been sent a Counteroffer.`);
      setReceipentNameVar(message?.fromMemberName);
    } else if (
      message?.isAccepted === false &&
      message?.isCounterOffer === true &&
      message?.isDeclined === false &&
      !checkFarmExists
    ) {
      setMessageTitle(`${message?.senderName} have been sent a Counteroffer.`);
      setReceipentNameVar(message?.farmName);
    } else if (message?.isAccepted === true && checkFarmExists) {
      setMessageTitle('Congratulations. Your Nominations Offer has been accepted.');
      setReceipentNameVar(message?.fromMemberName);
    } else if (message?.isAccepted === true && !checkFarmExists) {
      setMessageTitle('Congratulations. Your Nominations Offer has been accepted.');
      setReceipentNameVar(message?.farmName);
    } else if (message?.isDeclined === true && checkFarmExists) {
      setMessageTitle('You Nomination Offer has been declined.');
      setReceipentNameVar(message?.fromMemberName);
    } else if (message?.isDeclined === true && !checkFarmExists) {
      setMessageTitle('You Nomination Offer has been declined.');
      setReceipentNameVar(message?.farmName);
    }
  }, [message, receipentNameVar, messageTitle, checkFarmExists]);

  // Media Upload in Messages
  const allowFileTypes = '.doc,.docx,application/pdf';
  const allowImagesTypes = '.jpg, .jpeg, .png';
  const mediaLink = message?.mediaUrl || '';
  const media =
    mediaLink.length > 0 ? mediaLink.substring(mediaLink.lastIndexOf('/') + 1).split('.') : [];
  const mediaName = media ? media[0] + '.' + media[1] : null;
  const mediaType = media ? media[1] : null;

  return (
    <StyledEngineProvider injectFirst>
      {/* divider section */}
      {(prevMessage.index === 0 || prevMessageDate !== messageDate) && (
        <Box pt={5} className="respondDate">
          <Typography variant="h6">{messageDate}</Typography>
          <Divider flexItem />
        </Box>
      )}

      {/* message section */}
      {!message?.nominationRequestId ? (
        <>
          {message?.message === ' ' ? (
            ''
          ) : (
            <Box mt={3} className="respond-offer">
              <Stack direction="row">
                <Box>
                  <Avatar
                    alt={message?.senderName}
                    src={message?.senderImage ? message?.senderImage : Images.userSign}
                    style={{ width: '56px', height: '56px' }}
                  />
                </Box>
                <Box pl={2}>
                  <Typography variant="h5">
                    <span className="sender-name">
                      {message?.senderName === null
                        ? toPascalCase(message?.unregisteredName)
                        : toPascalCase(message?.senderName)}
                    </span>
                    {time}
                  </Typography>
                  {/* message media section */}
                  <Box py={2}>
                    <Typography
                      variant="h5"
                      dangerouslySetInnerHTML={{ __html: message?.message }}
                    ></Typography>
                    {allowImagesTypes.includes(mediaType) ? (
                      <a href={message?.mediaUrl} download className="messagesImage">
                        <img src={message?.mediaUrl} style={{ width: '264px', height: '176px' }} />
                      </a>
                    ) : allowFileTypes.includes(mediaType) ? (
                      <a href={message?.mediaUrl} download className="messagesURL">
                        {mediaName}
                      </a>
                    ) : (
                      ''
                    )}
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </>
      ) : (
        <Box
          mt={3}
          className={`respond-offer nomination-offer ${
            message?.isAccepted ? 'acceptedRequest' : ''
          } ${message?.isDeclined ? 'declinedRequest' : ''}`}
        >
          {/* message template */}
          <Stack direction="row">
            <Box>
              <Avatar
                alt={message?.senderName}
                src={message?.senderImage ? message?.senderImage : Images.userSign}
                style={{ width: '56px', height: '56px' }}
              />
            </Box>
            <Box pl={2}>
              <Typography variant="h5">
                <span>{messageTitle}</span> {time}
              </Typography>
              <Box mt={2}>
                <Typography variant="h4">Farm: {toPascalCase(message?.farmName)}</Typography>
                <Typography variant="h4">Stallion: {toPascalCase(message?.horseName)}</Typography>

                <Typography variant="h4">
                  {message?.isAccepted === true || message?.isDeclined === true
                    ? ''
                    : message?.isCounterOffer === true &&
                      message?.counterOfferPrice !== 0 &&
                      'Previous'}{' '}
                  Offer: {message?.currencySymbol}
                  {message?.isCounterOffer === true &&
                  (message?.isAccepted === true || message?.isDeclined === true)
                    ? message?.counterOfferPrice
                    : message?.offerPrice}
                </Typography>

                {message?.isAccepted === true || message?.isDeclined === true
                  ? ''
                  : message?.isCounterOffer === true &&
                    message?.counterOfferPrice !== 0 && (
                      <Typography variant="h4">
                        Counteroffer: {message?.currencySymbol}
                        {message?.counterOfferPrice}
                      </Typography>
                    )}
              </Box>
              <Box mt={2}>
                <Typography variant="h5">Hi {toPascalCase(receipentNameVar)},</Typography>
                <Typography
                  variant="h5"
                  dangerouslySetInnerHTML={{ __html: message?.message }}
                ></Typography>
                {allowImagesTypes.includes(mediaType) ? (
                  <a href={message?.mediaUrl} download target="_blank" className="messagesImage">
                    <img src={message?.mediaUrl} style={{ width: '264px', height: '176px' }} />
                  </a>
                ) : allowFileTypes.includes(mediaType) ? (
                  <a href={message?.mediaUrl} download target="_blank" className="messagesURL">
                    {mediaName}
                  </a>
                ) : (
                  ''
                )}
              </Box>
              <Box mt={2}>
                <Typography variant="h5">Thanks!</Typography>
                <Typography variant="h5">{message?.senderName}</Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </StyledEngineProvider>
  );
}
