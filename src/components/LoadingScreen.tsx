// @mui
import { styled } from '@mui/material/styles';
import { Box, SxProps } from '@mui/material';
import { Spinner } from './Spinner';
import { HorseSpinner } from 'src/components/HorseSpinner';
import { useLocation } from 'react-router-dom';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

type Props = {
  isDashboard?: boolean;
  sx?: SxProps;
};

export default function LoadingScreen({ isDashboard, ...other }: Props) {
  const { pathname } = useLocation();
  const isHorseNewPage = pathname.includes('/dashboard/horsedetails/data/new');
  const isNewStallionRequest = pathname.includes('/addnewforstallion');
  const isNewMareRequest = pathname.includes('/addnewformare');
  return (
    <>
      <Box className='SpinnerLoader'>
        {isHorseNewPage || isNewStallionRequest || isNewMareRequest ? <HorseSpinner /> : <Spinner />}
      </Box>
    </>
  );
}
