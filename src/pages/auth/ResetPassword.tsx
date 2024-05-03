import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// sections
import { ResetPasswordForm } from '../../sections/auth/reset-password';
// assets
import { SentIcon } from '../../assets';
import "./Login.css";
import stallionLogo from "../../assets/Images/StallionMatch-Logo Primary-White.svg";
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
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

export default function ResetPassword() {
  const [email, setEmail] = useState('');

  const [sent, setSent] = useState(false);

  return (
    <Page title="Reset Password" sx={{ height: 1 }}>
      <Box className="bg">
      <Box className="greyTiles"></Box>
      <Box className="container">
          <Box className="row">
            <Box className="d-flex mt-4">
            <Box p={2}>                
                  <img
                    src={stallionLogo}
                    alt="Stallion Match"
                  />
              </Box>  
          <Box className='login'>           
              <Container maxWidth="xs">
              <ContentStyle>
                <Box className="rich-text">
                  {!sent ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Forgot your password?
                      </Typography>

                      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                        Please enter the email address associated with your account and We will email you
                        a link to reset your password.
                      </Typography>

                      <ResetPasswordForm
                        onSent={() => setSent(true)}
                        onGetEmail={(value) => setEmail(value)}
                      />

                      <Button
                        fullWidth
                        size="large"
                        disableRipple
                        component={RouterLink}
                        to={PATH_AUTH.login}
                        sx={{ mt: 1 }}
                      >
                        Back
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

                      <Typography variant="h3" gutterBottom>
                        Request sent successfully
                      </Typography>

                      <Typography>
                        We have sent a confirmation email to &nbsp;
                        <strong>{email}</strong>
                        <br />
                        Please check your email.
                      </Typography>

                      <Button
                        size="large"
                        variant="contained"
                        component={RouterLink}
                        to={PATH_AUTH.login}
                        sx={{ mt: 5 }}
                      >
                        Back
                      </Button>
                    </Box>
                  )}
                </Box>
              </ContentStyle>
              </Container>
              </Box>          
              </Box>
            </Box>
          </Box>
      </Box>
    </Page>
  );
}
