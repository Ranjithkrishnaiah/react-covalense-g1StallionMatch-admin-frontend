// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Typography, StyledEngineProvider } from '@mui/material';

export default function DashboardFooter() {
  return (
    <StyledEngineProvider injectFirst>
      <Box className='FooterSection'>
        <Typography className='footernav smp-version' sx={{ padding: '0 20px 0 0', color: '#2EFFB4 !important' }}>v 1.1.69</Typography>
        <Typography>2022 © G1 Racesoft - stallionmatch.com</Typography>
      </Box>
    </StyledEngineProvider>
  );
}
