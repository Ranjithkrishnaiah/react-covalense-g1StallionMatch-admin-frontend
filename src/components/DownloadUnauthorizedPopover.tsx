import { useEffect, useState } from 'react';
// @mui
import { Box, Popover } from '@mui/material';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
export default function DownloadUnauthorizedPopover(props: any) {
  const { clickedPopover, setClickedPopover } = props;
  const [anchorE2, setAnchorE2] = useState<boolean>(false);
  const openPopover = Boolean(anchorE2);
  const idOpenover = openPopover ? 'simple-popover' : undefined;

  // call on Popover Click
  useEffect(() => {
    if (clickedPopover) {
      handlePopoverClick();
    }
  }, [clickedPopover]);

  // open Popover Click handler
  const handlePopoverClick = () => {
    setAnchorE2(true);
  };
  // close Popover Click handler
  const handlePopoverClose = () => {
    setClickedPopover(false);
    setAnchorE2(false);
  };

  return (
    <>
      {/* popover */}
      <Popover
        id={idOpenover}
        open={openPopover}
        className="view-shortlist"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={1}>
          <i className="icon-Cross" style={{ cursor: 'pointer' }} onClick={handlePopoverClose} />
          <Box className="shortlistBox">
            <UnAuthorized />
          </Box>
        </Box>
      </Popover>
    </>
  );
}
