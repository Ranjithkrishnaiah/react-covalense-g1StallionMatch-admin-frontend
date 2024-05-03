import React, { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { Images } from "src/assets/images";
import MenuPopover from 'src/components/MenuPopover';
import { IconButtonAnimate } from 'src/components/animate';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { SxProps } from "@mui/system";
import StallionsSettings from 'src/components/settingsModalForm/StallionsSettings';
import RunnerDetailsSettings from 'src/components/settingsModalForm/RunnerDetailsSettings';
import FarmsSettings from 'src/components/settingsModalForm/FarmsSettings';
import HorseDetailsSettings from 'src/components/settingsModalForm/HorseDetailsSettings';
import MarketingSettings from 'src/components/settingsModalForm/MarketingSettings';
import MembersSettings from 'src/components/settingsModalForm/MembersSettings';
import MessagesSettings from 'src/components/settingsModalForm/MessagesSettings';
import RaceSettings from 'src/components/settingsModalForm/RaceSettings';
import ReportsSettings from 'src/components/settingsModalForm/ReportsSettings';
import UserManagementSettings from 'src/components/settingsModalForm/UserManagementSettings';
import NotificationsSettings from 'src/components/settingsModalForm/NotificationsSettings';
import Scrollbar from 'src/components/Scrollbar';
import SalesSettings from 'src/components/settingsModalForm/SalesSettings';
import ProductsSettings from 'src/components/settingsModalForm/ProductsSettings';
import PromocodesSettings from 'src/components/settingsModalForm/PromocodesSettings';
import {PermissionConstants} from 'src/constants/PermissionConstants';
import {
  useGetAppPermissionByUserTokenQuery
 } from 'src/redux/splitEndpoints/usermanagementSplit';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { toPascalCase } from 'src/utils/customFunctions';
//////////////////////////////////////////////////////////////////////////

export default function SettingsPopover() {
  const icon: string = '';
  const [open, setOpen] = useState<HTMLElement | null>(null);
  const [valuesExist, setValuesExist] = useState({});

  // Get user permission settings api call
  const {data: appPermissionListByUser, isFetching, refetch, isLoading, isSuccess } =  useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });
  
  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccess && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState) => ({
            ...prevState,
            [item.value]: true
          }));
        } else {
          setValuesExist((prevState) => ({
            ...prevState,
            [item.value]: false
          }));
        }
      }
    }
  }, [isSuccess, isFetching]);

  // OPen and close settings modal
  const [isToggleClass, setIsToggleClass]= React.useState(false);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(event.currentTarget);
    setIsToggleClass(!isToggleClass);
  };
  let toggleClass = (isToggleClass) ? 'settings-active' : 'settings-inactive';
  const handleClose = () => {
    setOpen(null);
    setIsToggleClass(!isToggleClass);
  };

  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<string[]>([]);
  
  // Based on page navigation, set the current page
  useEffect(() => {
    const currentPage = location.pathname.split("/");
    setCurrentPage(currentPage);
  }, [location])

  // Based on page navigation, set the setting modal title
  const getSettingsTypeTitle = (type: string) => {
    let title = '';
    switch (true) {
      case type === 'stallions':
        title = 'Stallion'
        break;
      case type === 'marketing':
        title = 'Marketing Page'
        break;
      case type === 'members':
        title = 'Member'
        break;
      case type === 'farms':
        title = 'Farm'
        break;
      case type === 'horsedetails':
        title = 'Horse Details'
        break;
      case type === 'race':
        title = 'Race'
        break;
      case type === 'messages':
        title = 'Messages'
        break;
        case type === 'notifications':
          title = 'Notifications'
          break;
      case type === 'runnerdetails':
        title = 'Runner'
        break;
        case type === 'usermanagement':
        title = 'Permission'
        break;
        case type === 'sales':
        title = 'Sales'
        break;
        case type === 'products':
        title = 'Products'
        break;
        case type === 'reports':
        title = 'Report'
        break;
        default:
        break;
    }
    return title;
  }

  return (
    <>
      <IconButtonAnimate
      className={`${ ((currentPage[1] === 'dashboard'&& currentPage[2] === 'app') || currentPage[2] === 'systemactivities' || currentPage[2] === 'settings' || currentPage[2] === 'userprofile' || currentPage[2] === 'marketing')? 'SettingsPopover withdisabledState' : 'SettingsPopover'}`}
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
        <Box  className = {`SettingsIcon ${toggleClass}`} >
          <img src={Images.Settings} alt="" className='ImgSettInActive' />
          <img src={Images.SettingsActive} alt="" className='ImgSettActive' />
        </Box>
      </IconButtonAnimate>

      <MenuPopover
        className={`${currentPage[2] === 'usermanagement' ? 'home-dropdown settings-dropdown usermanagement-settings' : 'home-dropdown settings-dropdown'}`}
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
        <Scrollbar
        className='DrawerModalScroll'
        sx={{minHeight:'200px', maxHeight: "calc(100vh - 100px)"}} 
      >
        <Box sx={{ display: { xs: 'flex', lg: 'flex' } }} className="edit-section stallion-settings-popover">
          <Stack className='st-setting-text'>
            <Typography variant='h6'>{(currentPage[3] === 'promocodeslist') ? 'Promo Code' : toPascalCase(getSettingsTypeTitle(currentPage[2]))} Settings</Typography>
            <IconButton className='closeBtn' onClick={handleClose}>
              <i className="icon-Cross" />
            </IconButton>
          </Stack>
          {/* 
            Settings component
            based on the current page, render the corresponding module settings modal
          */}
          {(currentPage[2] === 'stallions' && (!valuesExist.hasOwnProperty("STALLION_ADMIN_MANAGE_STALLION_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'stallions' && (valuesExist.hasOwnProperty("STALLION_ADMIN_MANAGE_STALLION_ADMIN_SETTINGS"))) && <StallionsSettings handleClose={handleClose} />}
          {(currentPage[2] === 'horsedetails' && (!valuesExist.hasOwnProperty("HORSE_ADMIN_MANAGE_HORSE_DETAILS_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'horsedetails' && (valuesExist.hasOwnProperty("HORSE_ADMIN_MANAGE_HORSE_DETAILS_SETTINGS"))) && <HorseDetailsSettings  handleClose={handleClose}/>}
          {(currentPage[2] === 'members' && (!valuesExist.hasOwnProperty("MEMBER_ADMIN_MANAGE_MEMBER_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'members' && (valuesExist.hasOwnProperty("MEMBER_ADMIN_MANAGE_MEMBER_ADMIN_SETTINGS"))) && <MembersSettings handleClose={handleClose}/>}
          {(currentPage[2] === 'farms' && (!valuesExist.hasOwnProperty("FARM_ADMIN_MANAGE_FARM_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'farms' && (valuesExist.hasOwnProperty("FARM_ADMIN_MANAGE_FARM_ADMIN_SETTINGS"))) && <FarmsSettings handleClose={handleClose}/>}
          {(currentPage[2] === 'race' && (!valuesExist.hasOwnProperty("RACE_ADMIN_MANAGE_RACE_PAGE_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'race' && (valuesExist.hasOwnProperty("RACE_ADMIN_MANAGE_RACE_PAGE_SETTINGS"))) && <RaceSettings handleClose={handleClose} />}
          {(currentPage[2] === 'runnerdetails' && (!valuesExist.hasOwnProperty("RUNNER_ADMIN_MANAGE_RUNNER_PAGE_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'runnerdetails' && (valuesExist.hasOwnProperty("RUNNER_ADMIN_MANAGE_RUNNER_PAGE_SETTINGS"))) && <RunnerDetailsSettings handleClose={handleClose} />}
          {(currentPage[2] === 'messages' && (!valuesExist.hasOwnProperty("MESSAGING_ADMIN_MANAGE_MESSAGE_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'messages' && (valuesExist.hasOwnProperty("MESSAGING_ADMIN_MANAGE_MESSAGE_ADMIN_SETTINGS"))) && <MessagesSettings handleClose={handleClose} />}
          {currentPage[2] === 'marketing' && <MarketingSettings handleClose={handleClose} />}
          {(currentPage[2] === 'reports' && (!valuesExist.hasOwnProperty("REPORTS_ADMIN_MANAGE_REPORT_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'reports' && (valuesExist.hasOwnProperty("REPORTS_ADMIN_MANAGE_REPORT_ADMIN_SETTINGS"))) && <ReportsSettings  handleClose={handleClose}/>}
          {(currentPage[2] === 'usermanagement' && (!valuesExist?.hasOwnProperty("ADMIN_USER_MANAGEMENT_MANAGE_PERMISSION_LEVEL_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'usermanagement' && (valuesExist?.hasOwnProperty("ADMIN_USER_MANAGEMENT_MANAGE_PERMISSION_LEVEL_SETTINGS"))) && <UserManagementSettings handleClose={handleClose}/>}
          {currentPage[2] === 'sales' && <SalesSettings handleClose={handleClose}/>}
          {(currentPage[2] === 'notifications' && (!valuesExist.hasOwnProperty("NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATION_ADMIN_SETTINGS"))) && <UnAuthorized /> }
          {(currentPage[2] === 'notifications' && (valuesExist.hasOwnProperty("NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATION_ADMIN_SETTINGS"))) && <NotificationsSettings handleClose={handleClose} />}
          {currentPage[2] === 'products' && currentPage[3] !== 'promocodeslist' && <ProductsSettings handleClose={handleClose} />}
          {currentPage[2] === 'products' && currentPage[3] === 'promocodeslist' && <PromocodesSettings handleClose={handleClose} />}
        </Box>
        </Scrollbar>
      </MenuPopover>
    </>
  );
}