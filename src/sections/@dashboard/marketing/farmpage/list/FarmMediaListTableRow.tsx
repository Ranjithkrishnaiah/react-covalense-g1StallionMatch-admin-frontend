import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider, Divider } from '@mui/material';
// @types
import { Stallion } from 'src/@types/stallion';
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
import { Interweave } from 'interweave';
import { useDeleteByUuidMutation, useEditFarmPageMutation, useEditStallionTestimonialMutation } from 'src/redux/splitEndpoints/marketingSplit';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  farmId: any;
  pageId: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  apiStatus:  boolean,
  setApiStatus: React.Dispatch<React.SetStateAction<boolean>>, 
  apiStatusMsg:  any,
  setApiStatusMsg: React.Dispatch<React.SetStateAction<any>>,
  refetchFarmMedia?: any;
};

export default function FarmMediaListTableRow({
  row,
  farmId,
  pageId,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, refetchFarmMedia
}: Props) {
  const theme = useTheme();

  const { title, description, company, isDeleted, testimonialId, uuid, mediaInfoFiles, mediaInfoId } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const [isDelete, setIsDelete] = useState(false);
  const [deleteStallionTestimonial] = useEditStallionTestimonialMutation();
  const [editFarmPage] = useEditFarmPageMutation();
  const handleStallionTestimonial = async () => {
    // setIsDelete(true);
    await editFarmPage({
      pageId: pageId,
      farmId: farmId,
      mediaInfos: [{
        mediaInfoId: mediaInfoId,
        title: title,
        description: description,
        isDeleted: true,
        mediaInfoFiles: (mediaInfoFiles?.length > 0) ?
          [{
            isDeleted: true,
            mediauuid: mediaInfoFiles[0]?.mediauuid
          }]
          : null
      }]
    });
    refetchFarmMedia();
    setApiStatusMsg({'status': 201, 'message': '<b>Farm media data deleted successfully!</b>'});  
    setApiStatus(true);
  }

  let promotediconClass = (mediaInfoFiles?.length > 0) ? 'icon-Confirmed-24px' : 'icon-NonPromoted';

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
        <TableCell align="center"><i className={promotediconClass} /></TableCell>
        <TableCell align="right" className='tablemoremenu'>
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <Divider style={{ margin: "0" }} />
                <MenuItem className='selectDropDownList'
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  Edit Media
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem onClick={handleStallionTestimonial}> Remove</MenuItem>
              </>
            }
          />
        </TableCell>

      </TableRow>
    </StyledEngineProvider>
  );
}
