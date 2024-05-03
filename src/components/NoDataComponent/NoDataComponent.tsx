import { Box, Button, StyledEngineProvider, Typography } from '@mui/material'
import './noData.css'; 
export default function NoDataComponent(props:any) {
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
        <Typography variant="h3">No Results</Typography>
        {props.hideText === undefined  && <Typography> Try Clearing the filters and search Again</Typography>}
        {props.hideText === undefined && <Button
            className='clearStyleBtn' onClick = {props.clearAll}>
            Clear filter
          </Button>}
      </Box>
    </Box>
    </StyledEngineProvider>
  );
}
