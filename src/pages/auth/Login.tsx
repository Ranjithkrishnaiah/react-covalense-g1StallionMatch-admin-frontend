import { capitalCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Stack, Link, Alert, Tooltip, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// hooks
import useAuth from '../../hooks/useAuth';
import useResponsive from '../../hooks/useResponsive';
// components
import Page from '../../components/Page';
import Logo from '../../components/Logo';
import Image from '../../components/Image';
// sections
import { LoginForm } from '../../sections/auth/login';
import "./Login.css";
import stallionLogo from "../../assets/Images/StallionMatch-Logo Primary-White.svg";
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Login() {
  const { method } = useAuth();

  const smUp = useResponsive('up', 'sm');

  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Login">
      <Box className="bg">
      <Box className="greyTiles"></Box>
          <Box>
            <Box className="d-flex">
              <Box p={2}>                
                  <img
                    src={stallionLogo}
                    alt="Stallion Match"
                  />
              </Box>               
              </Box>
              <Box className='login'>
              <Container maxWidth="xs">
                <ContentStyle className='loginBody'>
                  <Stack className='loginBody' direction="row" alignItems="center" sx={{ mb: 5 }}>
                    <Box sx={{ flexGrow: 1 }} className="rich-text">
                      <Typography variant="h4" gutterBottom>
                        Sign in
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>Sign in and start managing Stallion Match!</Typography>
                    </Box>
                  </Stack>

                  <LoginForm />

                  {/* {!smUp && (
                    
                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                      Don’t have an account?{' '}
                      <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
                        Get started
                      </Link>
                    </Typography>
                    
                  )} */}
                </ContentStyle>
              </Container> 
              </Box>
          </Box>
      </Box>
    </Page>
  );
}
