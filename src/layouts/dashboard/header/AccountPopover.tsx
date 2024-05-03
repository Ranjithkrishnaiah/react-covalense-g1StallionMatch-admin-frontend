import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, Link } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  Divider,
  Typography,
  Stack,
  MenuItem,
  ListItem,
  ListItemButton,
  List,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_AUTH } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import MyAvatar from '../../../components/MyAvatar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { Images } from '../../../assets/images';
import { useGetUnreadNotificationsTypeQuery } from 'src/redux/splitEndpoints/notificationsSplit';
import { useGetUnreadMessagesTypeQuery } from 'src/redux/splitEndpoints/messagesSplit';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  // {
  //   label: 'Home',
  //   linkTo: '/',
  // },
  {
    label: 'Profile',
    // linkTo: PATH_DASHBOARD.user.profile,
    linkTo: PATH_DASHBOARD.userprofile.data,
  },
  // {
  //   label: 'Settings',
  //   linkTo: PATH_DASHBOARD.user.account,
  // },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { authentication, setLogout } = useAuth();

  const userData = user !== null ? JSON.parse(JSON.stringify(user)) : null;

  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      setLogout(true);
      // navigate(PATH_AUTH.login, { replace: true });
      navigate('auth/login', { replace: true });

      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  //Get API for notifications unread count
  const { data: unreadNotificationData } = useGetUnreadNotificationsTypeQuery();
  //Get API for messages unread count
  const { data: unreadMesssageData } = useGetUnreadMessagesTypeQuery();

  const notificationRedirection = () => {
    navigate(PATH_DASHBOARD.system.notifications);
  };
  const messagesRedirection = () => {
    navigate(PATH_DASHBOARD.messages.data);
  };

  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;

  const handleSwitchToSm = () =>{
    window.open(`${BaseAPI}`, '_blank');
  }

  return (
    <>
      <IconButtonAnimate
        className="AccountPopover"
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <MyAvatar src={Images.userSign} />
      </IconButtonAnimate>

      <MenuPopover
        className="home-dropdown"
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        {/* <Box sx={{ my: 1.5, px: 2.5 }} className='nav-dropdown-list'>
          <Typography variant="subtitle2" noWrap>
            {userData.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userData.email}
          </Typography>
        </Box> */}

        <Box sx={{ display: { xs: 'flex', lg: 'flex' } }} className="navigation-dropdown">
          <List>
            <ListItem>
              <ListItemText>
                <Typography variant="h6" onClick={() => {navigate(PATH_DASHBOARD.userprofile.data)}}>
                  Profile
                </Typography>
              </ListItemText>
              <ListItemIcon />
            </ListItem>
            {/* <ListItem>
          <ListItemText>
            <Typography variant="h6">
            My Horses
            </Typography>
          </ListItemText>
          <ListItemIcon />
        </ListItem>
        */}
            <ListItem onClick={notificationRedirection}>
              <ListItemText>
                <Typography variant="h6">Notifications</Typography>
              </ListItemText>
              {unreadNotificationData?.unreadCount > 0 && (
                <ListItemIcon>
                  <span>{unreadNotificationData?.unreadCount < 99 ? unreadNotificationData?.unreadCount : '99+'}</span>
                </ListItemIcon>
              )}
            </ListItem>
            <ListItem onClick={messagesRedirection}>
              <ListItemText>
                <Typography variant="h6">Messages</Typography>
              </ListItemText>
              {unreadMesssageData?.unreadCount > 0 && (
                <ListItemIcon>
                  <span>{unreadMesssageData?.unreadCount < 99 ? unreadMesssageData?.unreadCount : '99+'}</span>
                </ListItemIcon>
              )}
            </ListItem>
            {/* <ListItem>
              <ListItemText>
                <Typography variant="h6">
                  Shortlist
                </Typography>
              </ListItemText>
              <ListItemIcon>
                <i className="icon-Chevron-right" />
              </ListItemIcon>
            </ListItem> */}
          </List>

          {/* <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={handleClose}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack> */}

          <Divider sx={{ borderStyle: 'solid', borderColor: '#C5CFC4' }} />

          <List>
            <ListItem>
              <ListItemText>
                <Typography variant="h6" onClick={handleSwitchToSm}>Switch to SM.com</Typography>
              </ListItemText>
              <ListItemIcon />
            </ListItem>
            <ListItem>
              <ListItemText>
                <Typography variant="h6" onClick={handleLogout}>
                  Sign Out
                </Typography>
              </ListItemText>
              <ListItemIcon />
            </ListItem>
          </List>
        </Box>
      </MenuPopover>
    </>
  );
}
