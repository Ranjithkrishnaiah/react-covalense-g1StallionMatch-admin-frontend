import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
// @mui
import { Box, Button, Typography, Container } from '@mui/material';
// components
import Page from '../components/Page';
import { SeverErrorIllustration } from '../assets';
import 'src/components/NoDataComponent/noData.css'; 
// ----------------------------------------------------------------------
export default function Page403() {
  return (
    <Page title="403 Forbidden Error" sx={{ height: 1 }}>
        <Container>
          <Box className='noResultWrapper'>
            <Box className='noResult'
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                
              }}
            >
              <Typography variant="h3">Unathorized Access</Typography>
              <Typography> You do not have sufficient privileges to access this module</Typography>
              <Button to="/" size="large" variant="contained" component={RouterLink}>
                Go to Home
              </Button>
            </Box>
          </Box>
        </Container>
    </Page>
  );
}
