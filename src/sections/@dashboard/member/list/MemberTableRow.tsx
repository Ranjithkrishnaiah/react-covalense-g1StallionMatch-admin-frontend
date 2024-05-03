import { useState } from 'react';
//import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem } from '@mui/material';
// utils
//import { fDate } from '../../../../utils/formatTime';
//import { fCurrency } from '../../../../utils/formatNumber';
// @types
import { Member } from '../../../../@types/member';
// components
import Label from '../../../../components/Label';
//import Image from '../../../../components/Image';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { Divider } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: Member;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

export default function MemberTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();
  
  const { id, fullName, email, address, country,verifiedAccount  } = row;
  
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let promotediconClass = (verifiedAccount == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 

  return (
    <TableRow hover selected={selected}>
        <TableCell align="left">{fullName}</TableCell>
        <TableCell align="left">{email}</TableCell>   
        <TableCell align="left">{address}</TableCell>
        <TableCell align="left">{country}</TableCell>
        <TableCell align="center"><i className={promotediconClass} /></TableCell>
      <TableCell align="right" className='table-more-btn'>
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onEditPopup();
                  onSetRowId();
                  handleCloseMenu();
                  handleEditState();
                }}
              >
                Edit Member
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
                View Activity
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
               Reset Password
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
               Resend Verification
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
