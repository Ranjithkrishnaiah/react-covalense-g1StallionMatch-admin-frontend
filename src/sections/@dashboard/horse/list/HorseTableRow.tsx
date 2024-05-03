import { useState } from 'react';
//import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider, Divider } from '@mui/material';
// utils
//import { fDate } from '../../../../utils/formatTime';
// @types
import { Horse } from '../../../../@types/horse';
// components
import Label from '../../../../components/Label';
//import Image from '../../../../components/Image';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';

// ----------------------------------------------------------------------

type Props = {
  row: Horse;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  // onEditPopup : VoidFunction;
  // onSetRowId : VoidFunction;
  // handleEditState: VoidFunction;
};

export default function HorseTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  // onEditPopup,
  // onSetRowId,
  // handleEditState
}: Props) {
  const theme = useTheme();
  
  //const { id, name, yob, cob, horseColor, sex, gelding, type, status } = row;
  const { id, horseId, horseName, gender, yob, countryName, colourId, gelding, isThoroughbred, isLocked, createdOn } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <StyledEngineProvider injectFirst>
    <TableRow hover selected={selected} className='datalist'>
      <TableCell>{horseName}</TableCell>
      <TableCell align="left">{gender}</TableCell>
      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>{yob}</TableCell>
      <TableCell align="left">{countryName}</TableCell>
      <TableCell align="left"></TableCell>
      <TableCell align="center">{createdOn}</TableCell>      
      <TableCell align="left"></TableCell>
      <TableCell align="left"></TableCell>
      <TableCell align="left"></TableCell>
      <TableCell align="left"></TableCell>
      <TableCell align="right" className='table-more-btn'>
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              {/* <MenuItem
                onClick={() => {
                  onDeleteRow();
                  handleCloseMenu();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon={'eva:trash-2-outline'} />
                Delete
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:edit-fill'} />
                Edit
              </MenuItem> */}
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();                  
                }}
              >Edit Horse</MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem>View  Progeny</MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem>View Races</MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem>View Activity</MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
    </StyledEngineProvider>
  );
}
