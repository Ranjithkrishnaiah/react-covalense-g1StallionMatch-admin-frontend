import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, TableCell, MenuItem } from '@mui/material';
// @types
import { Farm } from '../../../../@types/farm';
// components
import { TableMoreMenu } from '../../../../components/table';
import { Divider } from '@mui/material';
// ----------------------------------------------------------------------
// Props type
type Props = {
  row: Farm;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
};

export default function FarmTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
}: Props) {
  const theme = useTheme();
  // row data from props
  const { id, farmName, countryCode, stateName, totalStallions, promoted, users, lastActive } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  // open menu handler
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  // close menu handler
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    // table row section
    <TableRow hover selected={selected}>
      <TableCell align="left">{farmName}</TableCell>
      <TableCell align="left">{countryCode}</TableCell>
      <TableCell align="left">{stateName}</TableCell>
      <TableCell align="left">{totalStallions}</TableCell>
      <TableCell align="left">{promoted}</TableCell>
      <TableCell align="left">{users}</TableCell>
      <TableCell align="left">{lastActive}</TableCell>
      {/* more menu starts */}
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
              <Divider style={{ margin: '0' }} />
              <MenuItem>Edit Farm Page</MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem>View Stallions</MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem>View Users</MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem>View Activity</MenuItem>
            </>
          }
        />
      </TableCell>
      {/* more menu ends */}
    </TableRow>
    // table row section ends
  );
}
