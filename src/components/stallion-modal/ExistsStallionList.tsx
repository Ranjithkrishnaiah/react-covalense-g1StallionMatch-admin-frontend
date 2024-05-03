import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { InputLabel, StyledEngineProvider, Typography, Button, Checkbox, Avatar } from '@mui/material';
import { Images } from 'src/assets/images'
import { Box } from '@mui/system';
import { ExistsStallion } from 'src/@types/existsStallion';
import { toPascalCase } from 'src/utils/customFunctions';
import { VoidFunctionType } from 'src/@types/typeUtils';

type Props = {
    key: number;
    data: ExistsStallion;
    open:VoidFunction,
    handleEditPopup:VoidFunction,
    rowId:string,
    isEdit:boolean,
    openAddEditForm:VoidFunction,
    handleDrawerCloseRow:VoidFunction,
    handleCloseEditState:VoidFunction,
    closeExists:VoidFunction,
    getStallionId:any
  };
  
function ExistsStallionList({
    key,
    data,
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    closeExists,
    getStallionId
  }: Props) {
      
    const handleExistsStallion = () => {
        isEdit=true;
        closeExists();
        getStallionId(data?.stallionId)
    }
    
      return (
        <ListItemButton onClick={handleExistsStallion}>
                    <ListItemIcon>
                        <Avatar className='fav-stallion-img' alt="" src=''/>
                    </ListItemIcon>
                        <ListItemText primary={`${toPascalCase(data.horseName)} (${data.yob}, ${data.countryCode})`}
                        secondary={
                        <React.Fragment>
                        <Typography
                            sx={{ display: 'none' }}
                            component="span"
                            variant="body2"
                            color="#007142;"
                        >
                            &nbsp; 
                        </Typography>
                        Located {`${data.farmName}, ${data.farmCountry}`}
                      
                        </React.Fragment>
                    }
                        />                     
                </ListItemButton>
      );
}
export default ExistsStallionList
