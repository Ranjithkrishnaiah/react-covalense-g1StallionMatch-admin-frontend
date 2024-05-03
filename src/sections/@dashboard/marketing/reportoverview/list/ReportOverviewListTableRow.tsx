import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider } from '@mui/material';
// @types
import { Stallion } from '../../../../../@types/stallion';
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
import { Interweave } from 'interweave';
// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

export default function ReportOverviewListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();
  
  const { title, description, buttonText, isActive, imageUrl, pdfUrl, id } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let activeIconClass = (isActive == true) ? 'icon-Confirmed-24px' : 'icon-Incorrect';
  let imageIconClass = (imageUrl !== null) ? 'icon-Confirmed-24px' : 'icon-Incorrect'; 
  
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow hover selected={selected} className='datalist'>
        <TableCell align="left" className='menufill-td'><i className='menu-fill-ico'> <img src={Images.MenuFill} alt="" /></i></TableCell> 
        <TableCell align="left" className='title-td'>
            <Typography variant='h5'>{title}</Typography>
        </TableCell>
        <TableCell align="left" className='description-td'>
            <Typography component='p'><Interweave content={description} /></Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'>{buttonText}</Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'><i className={activeIconClass} /></Typography>
        </TableCell>
        <TableCell align="center"><i className={imageIconClass} /></TableCell>
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
                    Edit Report
                </MenuItem>
                <Divider style={{ margin: "0"}} />
                <MenuItem> View Orders</MenuItem>
                </>
            }
            />
        </TableCell>
    </TableRow>
    </StyledEngineProvider>
  );
}