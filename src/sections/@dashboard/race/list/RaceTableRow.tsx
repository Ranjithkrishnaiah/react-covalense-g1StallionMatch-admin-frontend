import { useState } from 'react';
//import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem } from '@mui/material';
// utils
//import { fDate } from '../../../../utils/formatTime';
//import { fCurrency } from '../../../../utils/formatNumber';
// @types
import { Farm } from '../../../../@types/farm';
// components
import Label from '../../../../components/Label';
//import Image from '../../../../components/Image';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { Divider } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: Farm;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

export default function RaceTableRow({
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
  
  const { id, farmName, countryCode, stateName, totalStallions, promoted, users, lastActive  } = row;
  
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  //let promotediconClass = (verifiedAccount == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 

  return (
    <TableRow hover selected={selected}>
        <TableCell align="left">{farmName}</TableCell>
        <TableCell align="left">{countryCode}</TableCell>   
        <TableCell align="left">{stateName}</TableCell>
        <TableCell align="left">{totalStallions}</TableCell>
        <TableCell align="left">{promoted}</TableCell>   
        <TableCell align="left">{users}</TableCell>
        <TableCell align="left">{lastActive}</TableCell>  
      <TableCell align="right">
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
                Edit Farm
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
                Edit Farm Page
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
               View Stallions
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
               View Users
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem
              >
               View Activity
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
