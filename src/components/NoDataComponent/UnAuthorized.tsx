import { Box, StyledEngineProvider, Typography } from '@mui/material'
import './noData.css'; 
import { useState } from 'react';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';


export default function UnAuthorized(props:any) {  
    const [apiStatus, setApiStatus] = useState(false);
    const [apiStatusMsg, setApiStatusMsg] = useState({});
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();
  return (    
    <StyledEngineProvider injectFirst>       
      <Box className='noResultWrapper'>
      <Box className='noResult'
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          
        }}
      >
        <Typography variant="h3">Unauthorized  Access</Typography>
        <Typography> You do not have sufficient privileges to access this module</Typography>
      </Box>
    </Box>
    </StyledEngineProvider>
  );
}
