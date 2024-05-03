import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider } from '@mui/material';
// @types
import { Stallion } from '../../../../../@types/stallion';
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

export default function StallionMatchCarouselListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();
  
  const { title, description, buttonText, orientation, isActive, id } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let promotediconClass = (isActive == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 
  
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow hover selected={selected} className='datalist'>
        <TableCell align="left" className='menufill-td'><i className='menu-fill-ico'> <img src={Images.MenuFill} alt="" /></i></TableCell> 
        <TableCell align="left" className='title-td'>
            <Typography variant='h5'>{title}</Typography>
        </TableCell>
        <TableCell align="left" className='description-td'>
            <Typography component='p'>{description}</Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'>{buttonText}</Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'>{orientation}</Typography>
        </TableCell>
        <TableCell align="center"><i className='icon-Confirmed-24px' /></TableCell>
        <TableCell align="right" className='tablemoremenu'>
            <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
                <>
                <MenuItem className='selectDropDownList'
                    onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                    }}
                >
                    Edit Carousel
                </MenuItem>
                <Divider style={{ margin: "0"}} />
                <MenuItem> Remove</MenuItem>
                </>
            }
            />
        </TableCell>

    </TableRow>
    </StyledEngineProvider>
  );
}
