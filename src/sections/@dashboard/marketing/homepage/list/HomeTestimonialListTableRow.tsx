import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider } from '@mui/material';
// @types
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
import { Interweave } from 'interweave';
import { useDeleteByUuidMutation } from 'src/redux/splitEndpoints/marketingSplit';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

export default function HomeTestimonialListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();
  
  const { name, testimonial, company, isActive, id, uuid } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const [isDelete,setIsDelete] = useState(false);
  const [deleteTestimonial] = useDeleteByUuidMutation();
  const handleDeleteTestimonial = async(uuid: any) => {
    setIsDelete(true);
    await deleteTestimonial({id: uuid});
  }

  let promotediconClass = (isActive == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 
  
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow hover selected={selected} className='datalist'>
        <TableCell align="left" className='menufill-td'><i className='menu-fill-ico'> <img src={Images.MenuFill} alt="" /></i></TableCell> 
        <TableCell align="left" className='title-td'>
            <Typography variant='h5'>{name}</Typography>
        </TableCell>
        <TableCell align="left" className='description-td'>
            <Typography component='p'><Interweave content={testimonial} /></Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'>{company}</Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'><i className='icon-Confirmed-24px' /></Typography>
        </TableCell>
        <TableCell align="center"><i className='icon-Confirmed-24px' /></TableCell>
        <TableCell align="right" className='tablemoremenu'>
            <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
                <>
                <Divider style={{ margin: "0"}} />
                <MenuItem className='selectDropDownList'
                    onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                    }}
                >
                    Edit Testimonials
                </MenuItem>
                <Divider style={{ margin: "0"}} />
                <MenuItem onClick={() => handleDeleteTestimonial(uuid)}> Remove</MenuItem>
                </>
            }
            />
        </TableCell>

    </TableRow>
    </StyledEngineProvider>
  );
}
