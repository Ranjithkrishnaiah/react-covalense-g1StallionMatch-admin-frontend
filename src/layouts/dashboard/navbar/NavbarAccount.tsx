import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// hooks
import useAuth from '../../../hooks/useAuth';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import MyAvatar from '../../../components/MyAvatar';
import { Images } from '../../../assets/images';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

type Props = {
  isCollapse: boolean | undefined;
};

export default function NavbarAccount({ isCollapse }: Props) {
  let { user } = useAuth();
  const fullName = localStorage.getItem('fullName');
  const roleName = localStorage.getItem('roleName');  
  // const userData = JSON.parse(user);
  //const userData = JSON.parse(localStorage.getItem('user'), true);   
  return (
    // <Link className='userAccountBox' underline="none" color="inherit" component={RouterLink} to={PATH_DASHBOARD.userprofile.data}>
    <RootStyle className='userAccLeftWrapper'>
      <RootStyle className='userAccLeft'
        sx={{
          ...(isCollapse && {
            bgcolor: 'transparent',
          }),
        }}
      >
        <MyAvatar src={Images.userSign} />

        <Box
        className='userAccRight'
          sx={{
            ml: 2,
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
            ...(isCollapse && {
              ml: 0,
              width: 0,
            }),
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {fullName}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {roleName}
          </Typography>
        </Box>
      </RootStyle>
      </RootStyle>
    // </Link>
  );
}
