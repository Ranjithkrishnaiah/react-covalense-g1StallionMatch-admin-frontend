import React, { useState } from 'react'
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import { Box } from '@mui/material';

type IconProps = {
    data: {
      label: string;
      icon?: string;
    };
}
function TableHeadIcon(props: IconProps) {

  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event:any) => {
     setAnchorEl(event.currentTarget);
     setOpenPopper((previousOpen) => !previousOpen);
  };

  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const isIconVisisble = (props.data.label === 'Promoted' || props.data.label === 'Name' || props.data.label === 'Name') ? true : false;
  const hidePopover = () => {
    setOpenPopper(false);
  } 
  return (
    <div className='tooltipPopover'>{props.data.label}<i className={`${props.data.icon} tooltip-table`} onMouseOver={handleClick} onMouseOut={hidePopover} />
    <Popper className='tooltipPopover' id={id} open={openPopper} anchorEl={anchorEl} transition placement='auto-end'>
    {({ TransitionProps }) => (
      <Fade {...TransitionProps} timeout={350}>

        {/* stallion-Promoted-Popover */}
        <Box className='tooltipPopoverBody'>
          <p><i className='icon-Confirmed-24px'></i> Valid Promotion</p>
          <p><i className='icon-Incorrect'></i> Recently Expired</p>
          <p><i className='icon-NonPromoted'></i> Not Promoted</p>
        </Box>


        {/* Horse Details-Horse-Popover */}
        {/* <Box className='tooltipPopoverBody HorseDetailsPopover'>
          <p><i className='popover-circle yellow'></i> Unverified Horse</p>
          <p><i className='popover-circle red'></i> Missing Information</p>
          <p><i className='popover-circle black'></i> Verified & Complete</p>
        </Box> */}


        {/* Members Details-Name-Popover */}
        {/* <Box className='tooltipPopoverBody HorseDetailsPopover'>
          <p><i className='popover-circle yellow'></i> Suspended</p>
          <p><i className='popover-circle red'></i> Closed</p>
          <p><i className='popover-circle black'></i> Verified & Complete</p>
        </Box> */}


        {/* Farm List-Name-Popover */}
        {/* <Box className='tooltipPopoverBody HorseDetailsPopover'>
          <p><i className='popover-circle red'></i> Requires Verification</p>
          <p><i className='popover-circle black'></i> Verified & Complete</p>
        </Box> */}


      </Fade>
    )}
  </Popper>
  </div>
  )
}

export default TableHeadIcon