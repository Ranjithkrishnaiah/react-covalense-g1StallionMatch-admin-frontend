// @mui
import { IconButton } from '@mui/material';
import { inherits } from 'util';
//
import Iconify from '../Iconify';
import MenuPopover from '../MenuPopover';

// ----------------------------------------------------------------------

type Props = {
  actions: React.ReactNode;
  open?: HTMLElement | null;
  onClose?: VoidFunction;
  onOpen?: (event: React.MouseEvent<HTMLElement>) => void;
};

export default function TableMoreMenu({ actions, open, onClose, onOpen }: Props) {
  return (
    <>
      <IconButton onClick={onOpen} className='tablemoremenu-btn'>
      <i className='icon-Dots-horizontal' />
      </IconButton>
      
      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        className='MenuPopover'
        sx={{
          mt: -1,
          width: 168,
          '& .MuiMenuItem-root': {
            px: 1,
            typography: 'body2',
            borderRadius: 0.75,
            '& svg': { mr: 2, width: 20, height: 20 },
          },
          '& .MuiPaper-root ': {
            boxShadow: 'inherit !important',
          }
        }}
      >
        
        {actions}
      </MenuPopover>
    </>
  );
}
