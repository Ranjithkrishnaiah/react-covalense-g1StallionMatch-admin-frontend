import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  ResponderProvided,
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot
} from "react-beautiful-dnd";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  StyledEngineProvider,
  Typography, MenuItem, Divider, Box, Popover
} from "@mui/material";
import { TestimonialDataItem } from "src/pages/dashboard/MarketingStallionMatchData";
import 'src/sections/@dashboard/css/list.css';
import { Interweave } from 'interweave';
import { useDeleteByUuidMutation,useReorderMarketingPageSectionListRowsMutation } from 'src/redux/splitEndpoints/marketingSplit';
import StallionMatchTestimonialEditModal from 'src/sections/@dashboard/marketing/stallionmatchpage/StallionMatchTestimonialEditModal';

/* 
Note: this is a working example, but more can be done to improve it.

In particular, on drag, the table cells in the dragged row may collapse and shrink the overall row.

If you wish to preserve their size mid-drag, you can create a custom component that wraps
the material TableCell and saves the pre-drag dimensions (e.g. in a ref or in state).
The component can be passed an 'isDragging' prop (via snapshot.isDragging) and can conditionally
apply pre-drag width/height via styles.

Pre-drag dimensions can be obtained via the new-ish ResizeObserver API. If you are using class 
components, the getSnapshotBeforeUpdate() lifecycle method can work with getBoundingClientRect(), 
*/

export const TestimonialMaterialTable: React.FC<{ items: TestimonialDataItem[], TestimonialSectionUuid: any, apiStatus:  boolean, setApiStatus:React.Dispatch<React.SetStateAction<boolean>>, 
  apiStatusMsg: any, setApiStatusMsg:React.Dispatch<React.SetStateAction<any>>, 
  marketingModuleAccess: any, setMarketingModuleAccess:React.Dispatch<React.SetStateAction<any>>,
  clickedPopover: any, setClickedPopover: React.Dispatch<React.SetStateAction<any>> }> = (
    { items, TestimonialSectionUuid, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg,
      marketingModuleAccess, setMarketingModuleAccess, clickedPopover, setClickedPopover }) => {
  // cache the items provided via props in state for purposes of this demo
  const [localItems, setLocalItems] = useState<Array<TestimonialDataItem>>(items);
  let positionArr: any = [];
  const [apiPositionedUuids, setApiPositionedUuids] = useState<any>([]);
  const [updateReorderList, response] = useReorderMarketingPageSectionListRowsMutation();

  // normally one would commit/save any order changes via an api call here...
  const handleDragEnd = (result: DropResult, provided?: ResponderProvided) => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
          status: 422,
          message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      if (!result.destination) {
        return;
      }

      if (result.destination.index === result.source.index) {
        return;
      }
      
      const tempSourceIndex = result.source.index;
      const tempDestinationIndex = result.destination.index;
      
      positionArr[tempSourceIndex] = positionArr[tempDestinationIndex];
      positionArr[result.destination.index] = result.draggableId;
      
      setLocalItems((prev: any) => {      
        let temp = [...prev];
        const d = temp[result.destination!.index];
        temp[result.destination!.index] = temp[result.source.index];
        temp[result.source.index] = d;
        temp = temp.filter(function( element ) {
          return element !== undefined;
      });
        return temp;
      });
      const data = {
        sourceId:  result.draggableId,
        sourcePosition: result.destination.index,
        destinationId: positionArr[result.destination.index],
        destinationPosition: result.source.index
      };
      const finalData = { ...data, PageSectionId: TestimonialSectionUuid };
      updateReorderList(finalData);    
    }
  };

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
    if (!marketingModuleAccess?.marketing_update) {
      setClickedPopover(true);
    } else {  
      setIsDelete(true);
      await deleteTestimonial({id: uuid});
      if(setApiStatusMsg) setApiStatusMsg({'status': 201, 'message': '<b>Testimonial data deleted successfully!</b>'});  
      if(setApiStatus) setApiStatus(true);
    }
  }
    
  items?.map((item: any, index: number)=>{
    positionArr[item.position] = item.id;
  });
  
  const [open, setOpen] = useState(false);
  const [isEdit,setEdit] = useState(false);
  const [rowId, setRowId] = useState("");

  const handleEditPopup = (reportId: any) =>{
    if (!marketingModuleAccess?.marketing_update) {
      setClickedPopover(true);
    } else {  
      setOpenPopover(false);
      setOpen(!open);
      setEdit(true);
      setRowId(reportId);    
    }
  }

  const handleCloseEditState =() => {
    setEdit(false);
    setOpen(false);
    setRowId(""); 
  }

  const [anchorEl, setAnchorEl] = React.useState<null | (EventTarget & Element)>(null);
  const [openPopover, setOpenPopover] = React.useState(false);
  const [itemId, setItemId] = React.useState('');
  const [itemName, setItemName] = React.useState('');
  const [openUserAccess,setOpenUserAccess] = useState(false);
  const id = openPopover ? 'popover' : undefined;
  const toggleOptions = (evt: any) => {
    setItemId(evt.currentTarget.id);
    setItemName(evt.currentTarget.accessKey);
    setAnchorEl(evt.currentTarget);
    setOpenPopover(true);
  };
  
  return (
    <StyledEngineProvider injectFirst>  
    <TableContainer className='datalist' sx={{ minWidth: 800 }}>
      <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>        
        <TableHead>
            <TableRow>    
                <TableCell align="left">Order</TableCell>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Testimonial</TableCell>
                <TableCell align="left">Company</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="left"></TableCell>
            </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" direction="vertical">
            {(droppableProvided: DroppableProvided) => (
              <TableBody
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {localItems && localItems.map((item: TestimonialDataItem, index: number) => (
                  <Draggable
                    key={item?.id}
                    draggableId={item?.id}
                    index={item?.position}
                  >
                    {(
                      draggableProvided: DraggableProvided,
                      snapshot: DraggableStateSnapshot
                    ) => {
                      return (
                        <TableRow
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          style={{
                            ...draggableProvided.draggableProps.style,
                            background: snapshot.isDragging
                              ? "rgba(245,245,245, 0.75)"
                              : "none"
                          }}
                        >
                          {/* note: `snapshot.isDragging` is useful to style or modify behaviour of dragged cells */}
                          <TableCell align="left">
                            <div {...draggableProvided.dragHandleProps}>
                              <i className='icon-menu-fill'></i>
                            </div>
                          </TableCell>
                          <TableCell align="left" className='title-td'><Typography variant='h4'>{item?.name}</Typography></TableCell>
                          <TableCell align="left" className='description-td'><Typography variant='h5'><Interweave content={item?.testimonial} /></Typography></TableCell>
                          <TableCell align="left"><Typography variant='h5'>{item?.company}</Typography></TableCell>
                          <TableCell align="center"><Typography variant='h5'><i className={(item?.isActive === true) ? 'icon-Confirmed-24px' : 'icon-Incorrect'} /></Typography></TableCell>
                          <TableCell align="center"><Typography variant='h5'><i className={(item?.imageUrl !== null) ? 'icon-Confirmed-24px' : 'icon-Incorrect'} /></Typography></TableCell>
                          <TableCell align="right" className='tablemoremenu table-more-btn'>
                            <i
                              aria-describedby={item?.id}
                              className={'tablemoremenu-btn icon-Dots-horizontal'}
                              accessKey={item?.id}
                              id={item?.id}
                              onClick={toggleOptions}
                            />
                        </TableCell>
                        </TableRow>
                      );
                    }}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </TableContainer>
    {isEdit && 
      <StallionMatchTestimonialEditModal 
        open={open} 
        rowId={rowId} 
        isEdit={isEdit} 
        handleEditPopup={handleEditPopup} 
        handleCloseEditState={handleCloseEditState} 
        sectionUuid={TestimonialSectionUuid} 
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />  
    }
    {openPopover && (
        <Popover
          sx={ { display: { lg: 'flex', xs: 'flex' } } }
          id={id}
          open={openPopover}
          anchorEl={anchorEl}
          onClose={() => setOpenPopover(false)}
          anchorOrigin={ {
            vertical: 'bottom',
            horizontal: 'right',
          } }
          transformOrigin={ {
            vertical: 'top',
            horizontal: 'right',
          } }
          className="MenuPopover"
        >
          <Box className='MenuPopoverMarketing'>
            <MenuItem className='selectDropDownList'
              onClick={() => {
                handleEditPopup(itemId);
                }}
            >
                Edit Testimonial
            </MenuItem>
            <Divider style={{ margin: "0"}} />
            <MenuItem className='selectDropDownList' onClick={() => handleDeleteTestimonial(itemId)}>Remove</MenuItem>
          </Box>
        </Popover>
      )}
    </StyledEngineProvider>
  );
};