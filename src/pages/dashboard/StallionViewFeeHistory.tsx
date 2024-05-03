import React, { useState } from 'react'
import { useEffect } from 'react';
import { paramCase, capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Avatar, Box, Container, Divider, Grid, IconButton, MenuItem, MenuList, Select, Stack, StyledEngineProvider, TextField, Typography } from '@mui/material';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useStallionQuery } from 'src/redux/splitEndpoints/stallionSplit'
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import StallionFilterSidebar from 'src/sections/@dashboard/stallion/filters/StallionFilterSidebar';
import { Link } from 'react-router-dom';


import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { MenuProps } from '../../constants/MenuProps';
import { CustomSelect } from 'src/components/CustomSelect';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Images } from 'src/assets/images';

import MatchedMares from 'src/components/MatchedMares';
import StudFeeHistory from 'src/components/StudFeeHistory';
import { SxProps } from "@mui/system";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import './analytics.css';
import { CustomButton } from 'src/components/CustomButton';
import { LineBarChart } from 'src/components/graph/LineBarChart';
// ----------------------------------------------------------------------

export default function StallionViewFeeHistory() {
  const { themeStretch } = useSettings();

  
  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }: any) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 346,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));


  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.mode === 'light' ? '#1D472E' : '#1D472E',
    },
  }));


  const paperSx: SxProps = {

    "& .MuiPaper-root": {
      paddingBottom: '10px !important',
      borderRadius: '8px !important',

    },
    "& .PrivatePickersYear-yearButton.Mui-disabled": {
      color: '#ccc',
  },

    "& .css-epd502": {
      width: '382px',
      maxHeight: '431px',

    },
    "& .MuiCalendarPicker-root": {
      backgroundColor: "#ffffff",
      borderRadius: '8px !important',
      maxHeight: '431px',
      width: '100%',
    },
    
    "& .MuiCalendarPicker-root .css-1dozdou": {
      marginTop:'33px',
      paddingLeft: '39px',
      marginBottom: '24px',
    },

    "& .MuiCalendarPicker-root .css-e8k8r9": {
      marginLeft: 'auto',
      color: '#005632',
      fontFamily: 'synthese-bold',
      fontWeight: '700',
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '-0.01em',
      textTransform:'uppercase',
    },

    "& .MuiCalendarPicker-root .PrivatePickersSlideTransition-root": {
      overflow: 'hidden',
      paddingBottom: '10px',
      minHeight: '310px',

    },
    "& .MuiCalendarPicker-root .PrivatePickersSlideTransition-root .css-mvmu1r": {
      overflow: 'hidden',
      margin: '0px'

    },
    "& .MuiIconButton-edgeEnd": {
      position: 'absolute',
      top: '24px',
      left: '24px',
      width: '49px',
      height: '49px',
      border: 'solid 1px #F2F2F2',
      borderRadius: '4px',
      color: '#005632',
      background:'none',

    },

    "& .MuiIconButton-edgeStart": {
      position: 'absolute',
      top: '24px',
      right: '24px',
      width: '49px',
      height: '49px',
      border: 'solid 1px #F2F2F2',
      borderRadius: '4px',
      color: '#005632',
      background:'none',

    },


    "& .MuiIconButton-edgeStart svg,.MuiIconButton-edgeEnd svg": {
      fontSize: '16px',
    },

  
    "& .MuiCalendarPicker-root .css-195v8y8": {
      margin: 'auto',
      marginTop: '12px',
      fontFamily: 'synthese-bold',
      fontSize: '16px',
      textTransform: 'uppercase',
      color: '#005632'
    },

    "& .MuiCalendarPicker-viewTransitionContainer ": {
      overflowY: 'hidden'
    },

    "& .MuiTypography-root": {
      margin: '0 2px',
      padding: '0px 2px',
      fontWeight: '400',
      fontSize: '11px',
      lineHeight: '16px',
      color: '#979797',
      fontFamily: 'synthese-Regular',
      width: '45px',
      height: '30px',
    },

    "& .MuiPickersDay-dayWithMargin": {
      fontFamily: 'synthese-bold',
      fontSize: '16px',
      margin: '2px',
      color: "#161716",
      backgroundColor: "#ffffff",
      padding: '10px 0px 12px',
      lineHeight: '23px',
      width: '45px',
      height: '45px'
    },

    "& .MuiPickersDay-dayWithMargin:hover": {
      backgroundColor: "#F4F1EF",
      borderRadius: '4px'
    },

    "& .MuiPickersDay-root.Mui-selected": {
      backgroundColor: "#007142",
      borderRadius: '4px',
      color: '#ffffff'
    },

    "& .MuiPickersDay-root.Mui-disabled": {
      color: '#CCCCCC'
    },

    "& .MuiPickersDay-today": {
      border: '0 !important',
      backgroundColor: '#F4F1EF',
      borderRadius: '4px'
    },
    "& .MuiButtonBase-root svg.MuiSvgIcon-root.css-1wqoh3d-MuiSvgIcon-root,.MuiButtonBase-root svg.MuiSvgIcon-root.css-dgb0wu-MuiSvgIcon-root":{
      fill: '#007142',
    },

    "& .MuiPickersDay-today:hover": {
      backgroundColor: '#d4d4d4',
    },
    "& .MuiTabs-root": { backgroundColor: "rgba(120, 120, 120, 0.4)" }
  };

  const Icon : any = () =>   <IconButton
  aria-label="toggle password visibility"
  edge="end"
  sx={{ marginRight: '3px', padding: '0px' }}>
 <img src={Images.Datepicker} alt='Date Picker'/>
</IconButton>;



const [dateValue, setDateValue] = React.useState(null);


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
 const MenuPropss: any = {
    PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          marginTop: '-1px',
          marginLeft: '0',
          boxShadow: 'none',
          border: 'solid 1px #161716',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxSizing: 'border-box',
        },
      },

}
const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  return (
    <StyledEngineProvider injectFirst>
    <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
    <Page title={'View Fee History'} sx={{display: 'flex'}} className='ViewAnalyticsPage'>
      <StallionFilterSidebar/> 
      <Container maxWidth={themeStretch ? false : 'lg'} >

      <Box className='ViewAnalyticsPageBody' px={2}>   
      <Box mb={4} className="common-list-header">
        <Box my={1} className='backtopagewrapper'>
          <i className="icon-Chevron-left" style={{ color: '#007142' }} />{' '}
          <Link to="/dashboard/stallions/data" className="backtopage">
            {' '}
            Back to Stallion List
          </Link>
        </Box>
      </Box>

     


    {/* Header */}
      <Box py={3} my={5} className='stallion-report' sx={{ position: 'relative' }}>
        <Grid container lg={12} xs={12}>
        <Grid item lg={6} xs={12}>
          <Stack direction={{ lg:'row',sm: 'row', xs: 'column' }} spacing={2}>
            <Box>
              <Avatar sx={{ width: '72px', height: '72px' }}/>
            </Box>
            <Box>
              <Typography variant='h2'>I Am Invincible</Typography>
              <Typography variant='h6'>Service Fee: $172,000</Typography>
              <Typography variant='h6'>YOB: 2000</Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item lg={6} xs={12}>
        <Stack direction={{ lg:'row', sm: 'row', xs:'column' }} spacing={{ xs: 0, sm: 2, md: 3 }}  sx={{ justifyContent: { lg: 'end', xs: 'left' } }} className='report-links'>
                            {/* <MenuList>
                                  <MenuItem disableGutters>
                                    <i className='icon-Link'/> Stallion Match Link
                                  </MenuItem>
                          </MenuList> */}
                          <MenuList>
                                  <MenuItem disableGutters>
                                    <i className='icon-Download'/> Download
                                  </MenuItem>
                          </MenuList>
                            <MenuList>
                                  <MenuItem disableGutters>
                                  <i className='icon-Share'/> Share
                                  </MenuItem>
                          </MenuList>  
                          <MenuList sx={{ position: { xs:'absolute', lg:'inherit' }, top: { xs:'0px' }, right: { xs:'16px' } }}>
                                  <MenuItem disableGutters>
                                  <i className="icon-Circle-dots-horizontal" style={{ fontSize: '40px', marginRight: '0' }}/>
                                  </MenuItem>
                          </MenuList>   
                          
        </Stack>
        <Stack>
          <Box className='progressbar' sx={{ mt:{ lg: '1rem', xs:'0' }, width:{ lg: '80%', xs:'95%' } }}>
              <Box mb={1} sx={{ display: 'flex' }}>
                <Typography variant="h6" flexGrow={1}>
                  Profile Rating: <b>Intermediate</b>
                </Typography>

                <HtmlTooltip
                placement="bottom"
                className="CommonTooltip"
                title={
                  <React.Fragment>
                    {'Your stallion’s profile rating is determined by how much information is complete. To increase his profile rating, please update and add information to your stallion’s profile page. '}
                    {' '}
                  </React.Fragment>
                }
              >
                <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
              </HtmlTooltip>
              
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                   <BorderLinearProgress variant="determinate" value={50} />
              </Box>
              </Box>
            </Stack>
        </Grid>
        </Grid>
     </Box>



{/* Body */}
     <Box py={3} my={5} className="stallion-match-activity" sx={{ position: 'relative' }}>
        <Box className="trends-header-wrapper" pt={1} pb={{ sm: '0', md: '26px', lg: '26px' }}>
          <Stack direction={{ lg: 'row', xs: 'column' }} className="trends-header-wrapper-inner">
            <Box flexGrow={1}>
              <Typography variant="h3" sx={{ color: '#1D472E' }}>
              Stud Fee Chart
              </Typography>
            </Box>            
            <Box className="trends-header-wrapper-left">
              <Box className="trends-popover">
              <Box className='edit-field'>
                <CustomSelect
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  defaultValue={'none'}
                  className="selectDropDownBox trends-select-box"
                  MenuProps={MenuPropss}
                >
                  <MenuItem className="selectDropDownList" value="none" disabled>
                    Select View
                  </MenuItem>

                  <MenuItem className="selectDropDownList"> Select Last 2 weeks</MenuItem>
                  <MenuItem className="selectDropDownList"> Select Last 2 weeks</MenuItem>
                  <MenuItem className="selectDropDownList"> Select Last 2 weeks</MenuItem>
                </CustomSelect>
                </Box>
              </Box>

              <Box className="trends-activty-button">
              <Box className='edit-field'>
                <Box className="customDate" >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                            className='edit-field calender-box'
                              value={dateValue}
                              onChange={(newValue) => {
                                setDateValue(newValue);
                              }}
                              components={{
                                OpenPickerIcon: Icon ,
                              }}
                              PopperProps ={{ 
                                placement:'bottom-end'
                              }}
                              PaperProps={{
                                sx: paperSx, 
                              }}
                              //renderInput={(params) => <TextField {...params} />}
                              renderInput={(params : any) => <TextField  className="datepicker"  {...params}   inputProps={{
                                ...params.inputProps,
                                placeholder: "14 May - 19 May"
                        
                              }}
                              />}
                            />
                          </LocalizationProvider>
                          </Box>
                </Box>
                
              </Box>
            </Box>
          </Stack>
        </Box>



        <Box  className="aptitude-fullscreen">
          <Box className="SPtreechat StallionMatchActivityGraph">
            <Stack direction="row" className="StallionMatchActivityFS">
              <CustomButton className="ListBtn">
                <i className="icon-Arrows-expand" /> Full Screen
              </CustomButton>
            </Stack>
            <Box className="Linechart-StMatchActvty" sx={{ padding: '24px 40px 40px', height:'250px' }}>
              {/* <StallionActivityChart /> */}
              <LineBarChart />
            </Box>
          
          </Box>
        </Box>






      
          <StudFeeHistory />
          
        

        
      </Box>

      </Box>


      </Container>
    </Page>
    </StyledEngineProvider>
  );
}
