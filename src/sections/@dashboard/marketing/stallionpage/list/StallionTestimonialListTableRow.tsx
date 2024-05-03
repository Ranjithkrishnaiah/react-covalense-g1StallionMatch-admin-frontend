import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider } from '@mui/material';
// @types
import { Stallion } from 'src/@types/stallion';
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
import { Interweave } from 'interweave';
import { useDeleteByUuidMutation, useEditStallionTestimonialMutation } from 'src/redux/splitEndpoints/marketingSplit';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  stallionId: any;
  pageId: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
  apiStatus:  boolean,
  setApiStatus: React.Dispatch<React.SetStateAction<boolean>>, 
  apiStatusMsg:  any,
  setApiStatusMsg: React.Dispatch<React.SetStateAction<any>>,
  refetchStallionTestimonial?: any;
};

export default function StallionTestimonialListTableRow({
  row,
  stallionId,
  pageId,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, refetchStallionTestimonial
}: Props) {
  const theme = useTheme();
  
  const { title, description, company, isDeleted, testimonialId, uuid, media } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const [isDelete,setIsDelete] = useState(false);
  const [deleteStallionTestimonial] = useEditStallionTestimonialMutation();
  const handleStallionTestimonial = async() => {
    // setIsDelete(true);
    await deleteStallionTestimonial({
      pageId: pageId, 
      stallionId: stallionId,
      testimonialId: testimonialId,
      title: title,
      description: description,
      isDeleted: true,
      testimonialMedia: (media?.length > 0) ?
      {
        isDeleted: true,
        mediauuid: media[0]?.mediauuid
      } : null
    });
    refetchStallionTestimonial();
    setApiStatusMsg({'status': 201, 'message': '<b>Stallion testimonial data deleted successfully!</b>'});  
    setApiStatus(true);
  }

  let promotediconClass = (media?.length > 0) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 
  
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow hover selected={selected} className='datalist'>
        {/* <TableCell align="left" className='menufill-td'><i className='menu-fill-ico'> <img src={Images.MenuFill} alt="" /></i></TableCell>  */}
        <TableCell align="left" className='title-td'>
            <Typography variant='h5'>{title}</Typography>
        </TableCell>
        <TableCell align="left" className='description-td'>
            <Typography component='p'><Interweave content={description} /></Typography>
        </TableCell>
        <TableCell align="left">
            <Typography component='p'>{company}</Typography>
        </TableCell>
        <TableCell align="center"><i className={promotediconClass} /></TableCell>
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
                    Edit Testimonial
                </MenuItem>
                <Divider style={{ margin: "0"}} />
                <MenuItem onClick={handleStallionTestimonial}> Remove</MenuItem>
                </>
            }
            />
        </TableCell>

    </TableRow>
    </StyledEngineProvider>
  );
}
