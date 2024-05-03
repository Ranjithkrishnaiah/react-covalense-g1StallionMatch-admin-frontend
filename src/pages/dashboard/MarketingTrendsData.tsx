// @mu
import { useState } from 'react';
import React from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  Divider,
  MenuItem,
  Button,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  StyledEngineProvider,
} from '@mui/material';
import Page from 'src/components/Page';
// ----------------------------------------------------------------------
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import TrendsListTableRow from 'src/sections/@dashboard/marketing/trends/list/TrendsListTableRow';
import Switch, { SwitchProps } from '@mui/material/Switch';
import {
  FormProvider,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Trends } from 'src/@types/marketing';
import { useMarketingPageQuery, useAddTrendPageMutation, useEditTrendPageMutation } from 'src/redux/splitEndpoints/marketingSplit';
import { LoadingButton } from '@mui/lab';
import { Loader } from 'src/components/loader';
import { useDispatch, useSelector } from 'react-redux';
import DashboardHeader from 'src/layouts/dashboard/header';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

type FormValuesProps = Trends;

export default function MarketingTrendsData() {
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [marketingModuleAccess, setMarketingModuleAccess] = useState({
    marketing_viewonly: false,
    marketing_update: true,
  });

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  React.useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  React.useEffect(() => {
    if (valuesExist.hasOwnProperty('MARKETING_TRENDS_PAGE')) {
      setUserModuleAccess(true);
    }
    setMarketingModuleAccess({
      ...marketingModuleAccess,
      marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_TRENDS_PAGE') ? false : true,
      marketing_update: !valuesExist?.hasOwnProperty('MARKETING_TRENDS_PAGE') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const marketingTrendsPageId = process.env.REACT_APP_MARKETING_TRENDS_PAGE_ID;
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});

  const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 46,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));
  const [errors, setErrors] = useState<any>({});
  const [checkHeaderChange, setCheckHeaderChange] = useState(false);
  const [checkHeaderRegisteredChange, setCheckHeaderRegisteredChange] = useState(false);
  const [checkFooterChange, setCheckFooterChange] = useState(false);
  const [checkFooterRegisteredChange, setCheckFooterRegisteredChange] = useState(false);
  const [checkPermissionChange, setCheckPermissionChange] = useState(false);
  const [headerBannerText, setHeaderBannerText] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    isAnonymous: false,
  });
  const [headerBannerRegisteredText, setHeaderBannerRegisteredText] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    isRegistered: false
  });
  const [footerBannerText, setFootBannerText] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    isAnonymous: false,
  });
  const [footerBannerRegisteredText, setFootBannerRegisteredText] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    isRegistered: false
  });
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [editTrends] = useEditTrendPageMutation();
  const { data: trendData, error, isFetching, isLoading, isSuccess } = useMarketingPageQuery(marketingTrendsPageId);
  const currentTrends = (isSuccess) ? trendData : {};
  const TrendsList: any = currentTrends?.tilePermissions?.list;
  const NewFarmSchema = Yup.object().shape({
    hbTitle: Yup.string().required('Title is required'),
    hbDescription: Yup.string().required('Description is required'),
    hbButtonText: Yup.string().required('Button text is required'),
    hbUrl: Yup.string().required('URL is required'),
    fbTitle: Yup.string().required('Title is required'),
    fbDescription: Yup.string().required('Description is required'),
    fbButtonText: Yup.string().required('Button text is required'),
    fbUrl: Yup.string().required('URL is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      hbTitle: currentTrends?.headerBanner?.title || '',
      hbDescription: currentTrends?.headerBanner?.description || '',
      hbButtonText: currentTrends?.headerBanner?.buttonText || '',
      hbUrl: currentTrends?.headerBanner?.buttonUrl || '',
      fbTitle: currentTrends?.footerBanner?.title || '',
      fbDescription: currentTrends?.footerBanner?.description || '',
      fbButtonText: currentTrends?.footerBanner?.buttonText || '',
      fbUrl: currentTrends?.footerBanner?.buttonUrl || '',
      anonymous_hb_user: currentTrends?.headerBanner?.isAnonymous || false,
      registered_hb_user: currentTrends?.headerBanner?.isRegistered || false,
      anonymous_fb_user: currentTrends?.footerBanner?.isAnonymous || false,
      registered_fb_user: currentTrends?.footerBanner?.isRegistered || false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrends]
  );

  React.useEffect(() => {
    if (currentTrends) {
      reset(defaultValues);

      setHeaderBannerText(
        {
          title: currentTrends?.headerBanner?.title,
          description: currentTrends?.headerBanner?.description,
          buttonText: currentTrends?.headerBanner?.buttonText,
          buttonUrl: currentTrends?.headerBanner?.buttonUrl,
          isAnonymous: currentTrends?.headerBanner?.isAnonymous || false,
        }
      );

      setHeaderBannerRegisteredText(
        {
          title: currentTrends?.headerBannerRegistered?.title,
          description: currentTrends?.headerBannerRegistered?.description,
          buttonText: currentTrends?.headerBannerRegistered?.buttonText,
          buttonUrl: currentTrends?.headerBannerRegistered?.buttonUrl,
          isRegistered: currentTrends?.headerBannerRegistered?.isRegistered || false
        }
      );

      setFootBannerText(
        {
          title: currentTrends?.footerBanner?.title,
          description: currentTrends?.footerBanner?.description,
          buttonText: currentTrends?.footerBanner?.buttonText,
          buttonUrl: currentTrends?.footerBanner?.buttonUrl,
          isAnonymous: currentTrends?.footerBanner?.isAnonymous || false,
        }
      );

      setFootBannerRegisteredText(
        {
          title: currentTrends?.footerBannerRegistered?.title,
          description: currentTrends?.footerBannerRegistered?.description,
          buttonText: currentTrends?.footerBannerRegistered?.buttonText,
          buttonUrl: currentTrends?.footerBannerRegistered?.buttonUrl,
          isRegistered: currentTrends?.footerBannerRegistered?.isRegistered || false
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrends]);

  const handleCheckHeaderBannerChange = (event: any, type: string) => {
    setHeaderBannerText({
      ...headerBannerText,
      [type]: event.target.value
    })
    setCheckHeaderChange(true);
  }

  
  const handleCheckHeaderBannerRegisteredChange = (event: any, type: string) => {
    setHeaderBannerRegisteredText({
      ...headerBannerRegisteredText,
      [type]: event.target.value
    })
    setCheckHeaderRegisteredChange(true);
  }

  const handleCheckFooterBannerChange = (event: any, type: string) => {
    setFootBannerText({
      ...footerBannerText,
      [type]: event.target.value
    })
    setCheckFooterChange(true);
  }

  const handleCheckFooterBannerRegisteredChange = (event: any, type: string) => {
    setFootBannerRegisteredText({
      ...footerBannerRegisteredText,
      [type]: event.target.value
    })
    setCheckFooterRegisteredChange(true);
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  React.useEffect(() => {
    if (currentTrends) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrends]);

  const [state, setStateValue] = React.useState<any>({
    TPSA: false,
    TPSR: false,
    MPSA: false,
    MPSR: false,
    MPBSA: false,
    MPBSR: false,
    MSSA: false,
    MSSR: false,
    MSBSA: false,
    MSBSR: false,
    FAA: false,
    FAR: false,
    T102020MSA: false,
    T102020MSR: false,
    T102020MBSA: false,
    T102020MBSR: false,
    HCA: false,
    HCR: false,
    T10PMMSA: false,
    T10PMMSR: false,
    T10PMMBSA: false,
    T10PMMBSR: false,
    SMSAA: false,
    SMSAR: false,
    isCheckboxChangedA: false,
    isCheckboxChangedR: false,
  });

  React.useEffect(() => {
    if (isSuccess) {
      setStateValue({
        ...state,
        TPSA: TrendsList[0]?.isAnonymous,
        TPSR: TrendsList[0]?.isRegistered,
        MPSA: TrendsList[1]?.isAnonymous,
        MPSR: TrendsList[1]?.isRegistered,
        MPBSA: TrendsList[2]?.isAnonymous,
        MPBSR: TrendsList[2]?.isRegistered,
        MSSA: TrendsList[3]?.isAnonymous,
        MSSR: TrendsList[3]?.isRegistered,
        MSBSA: TrendsList[4]?.isAnonymous,
        MSBSR: TrendsList[4]?.isRegistered,
        FAA: TrendsList[5]?.isAnonymous,
        FAR: TrendsList[5]?.isRegistered,
        T102020MSA: TrendsList[6]?.isAnonymous,
        T102020MSR: TrendsList[6]?.isRegistered,
        T102020MBSA: TrendsList[7]?.isAnonymous,
        T102020MBSR: TrendsList[7]?.isRegistered,
        HCA: TrendsList[8]?.isAnonymous,
        HCR: TrendsList[8]?.isRegistered,
        T10PMMSA: TrendsList[9]?.isAnonymous,
        T10PMMSR: TrendsList[9]?.isRegistered,
        T10PMMBSA: TrendsList[10]?.isAnonymous,
        T10PMMBSR: TrendsList[10]?.isRegistered,
        SMSAA: TrendsList[11]?.isAnonymous,
        SMSAR: TrendsList[11]?.isRegistered,
      })
    }
  }, [TrendsList]);

  const onSubmit = async (data: FormValuesProps) => {
    try {

      let tilePermissions: any = [
        {
          "id": "1A73C535-69FB-416E-9F99-E4442BD5A609",
          "isAnonymous": state?.TPSA,
          "isRegistered": state?.TPSR,
        },
        {
          "id": "A021B4A7-C3DF-4B3E-AFD4-E6EAD78E8E87",
          "isAnonymous": state?.MPSA,
          "isRegistered": state?.MPSR,
        },
        {
          "id": "B69036EA-0F14-4FB8-A406-FE96F0CBA291",
          "isAnonymous": state?.MPBSA,
          "isRegistered": state?.MPBSR,
        },
        {
          "id": "D0A0EC48-456A-446A-A8F3-B69B5C1B578B",
          "isAnonymous": state?.MSSA,
          "isRegistered": state?.MSSR,
        },
        {
          "id": "A2B32D58-ECB3-4ECC-ACFE-BD39C23072AA",
          "isAnonymous": state?.MSBSA,
          "isRegistered": state?.MSBSR,
        },
        {
          "id": "D1F9B8DB-F03A-4D6D-A6BE-4642D3FFBE09",
          "isAnonymous": state?.FAA,
          "isRegistered": state?.FAR,
        },
        {
          "id": "4790EFDC-B2AB-4F88-9B89-DABCA6555197",
          "isAnonymous": state?.T102020MSA,
          "isRegistered": state?.T102020MSR,
        },
        {
          "id": "17925138-949C-4D94-A656-D5E1F5E6421A",
          "isAnonymous": state?.T102020MBSA,
          "isRegistered": state?.T102020MBSR,
        },
        {
          "id": "07BBCF18-A10A-473B-B590-BB3759FD1FC3",
          "isAnonymous": state?.HCA,
          "isRegistered": state?.HCR,
        },
        {
          "id": "14123B09-E372-48F1-B06B-46ECA75DC2D1",
          "isAnonymous": state?.T10PMMSA,
          "isRegistered": state?.T10PMMSR,
        },
        {
          "id": "0F654137-EDD0-4C70-A4DC-A55396E3E79B",
          "isAnonymous": state?.T10PMMBSA,
          "isRegistered": state?.T10PMMBSR,
        },
        {
          "id": "CE0D3B8B-B3D1-4384-9BFA-A93322749B85",
          "isAnonymous": state?.SMSAA,
          "isRegistered": state?.SMSAR,
        }
      ];
      const finalData = {
        "headerBanner": {
          "title": data.hbTitle,
          "description": data.hbDescription,
          "buttonText": data.hbButtonText,
          "buttonUrl": data.hbUrl,
          "isAnonymous": data.anonymous_hb_user
        },
        "headerBannerRegistered": {
          "title": data.hbTitle,
          "description": data.hbDescription,
          "buttonText": data.hbButtonText,
          "buttonUrl": data.hbUrl,
          "isRegistered": data.registered_hb_user
        },
        "footerBanner": {
          "title": data.fbTitle,
          "description": data.fbDescription,
          "buttonText": data.fbButtonText,
          "buttonUrl": data.fbUrl,
          "isAnonymous": data.anonymous_fb_user
        },
        "footerBannerRegistered": {
          "title": data.fbTitle,
          "description": data.fbDescription,
          "buttonText": data.fbButtonText,
          "buttonUrl": data.fbUrl,
          "isRegistered": data.registered_fb_user
        },
        tilePermissions
      }
      // console.log('Post Farm Data', finalData, 'tile state value', state);return false;
      await editTrends({ ...finalData, id: marketingTrendsPageId });
      // console.log('response', response);
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page display settings updated successfully!</b>' });
      setApiStatus(true);
      reset();
      // enqueueSnackbar('Trends page display settings updated successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const [isHeaderAnonymousChecked, setIsHeaderAnonymousChecked] = useState(false);
  const [isHeaderRegisteredChecked, setIsHeaderRegisteredChecked] = useState(false);
  const [isFooterAnonymousChecked, setIsFooterAnonymousChecked] = useState(false);
  const [isFooterRegisteredChecked, setIsFooterRegisteredChecked] = useState(false);

  React.useEffect(() => {
    setIsHeaderAnonymousChecked(defaultValues?.anonymous_hb_user);
    setIsHeaderRegisteredChecked(defaultValues?.registered_hb_user);
    setIsFooterAnonymousChecked(defaultValues?.anonymous_fb_user);
    setIsFooterRegisteredChecked(defaultValues?.registered_fb_user);
  }, [defaultValues]);

  const handleFooterData = async () => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
        status: 422,
        message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      const finalData: any = {
        footerBanner: footerBannerText,
        id: marketingTrendsPageId
      };
      await editTrends(finalData);
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page footer banner display settings updated successfully!</b>' });
      setApiStatus(true);
      setCheckFooterChange(false);
    }
  }

  const handleFooterRegisteredData = async () => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
        status: 422,
        message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      const finalData: any = {
        footerBannerRegistered: footerBannerRegisteredText,
        id: marketingTrendsPageId
      };
      if (!validateFormforFooter(finalData)) return;
      await editTrends(finalData);
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page footer banner display settings updated successfully!</b>' });
      setApiStatus(true);
      setCheckFooterRegisteredChange(false);
    }
  }

  const handleHeaderData = async () => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
        status: 422,
        message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      const finalData: any = {
        headerBanner: headerBannerText,
        id: marketingTrendsPageId
      };
      await editTrends(finalData);
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page header banner display settings updated successfully!</b>' });
      setApiStatus(true);
      setCheckHeaderChange(false);
    }
  }

  const validateWebsiteUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}\.[a-z]+(\/[^\s]*)?$/i;
    return pattern.test(url);
  };

  

// validate Form handler
let validateFormforHeader = (data: any) => {
    /*eslint-disable */
    let errors = {};
    let formIsValid = true;
    //@ts-ignore 
    console.log(headerBannerRegisteredText.buttonUrl);   
    console.log(validateWebsiteUrl(headerBannerRegisteredText.buttonUrl));   
    if (headerBannerRegisteredText.buttonUrl !== '' && validateWebsiteUrl(headerBannerRegisteredText.buttonUrl) === false) {
        formIsValid = false; //@ts-ignore
        errors['buttonURL'] = `buttonURL is invalid`;
    }
    console.log(errors);
    setErrors(errors);
    return formIsValid;
};

// validate Form handler
let validateFormforFooter = (data: any) => {
  /*eslint-disable */
  let errors = {};
  let formIsValid = true;
  //@ts-ignore 
  console.log(footerBannerRegisteredText.buttonUrl);   
  console.log(validateWebsiteUrl(footerBannerRegisteredText.buttonUrl));   
  if (footerBannerRegisteredText.buttonUrl !== '' && validateWebsiteUrl(footerBannerRegisteredText.buttonUrl) === false) {
      formIsValid = false; //@ts-ignore
      errors['buttonURL'] = `buttonURL is invalid`;
  }
  console.log(errors);
  setErrors(errors);
  return formIsValid;
};



  const handleHeaderRegisteredData = async () => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
        status: 422,
        message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      const finalData: any = {
        headerBannerRegistered: headerBannerRegisteredText,
        id: marketingTrendsPageId
      };
      if (!validateFormforHeader(finalData)) return;
      await editTrends(finalData);
      
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page header banner display settings updated successfully!</b>' });
      setApiStatus(true);
      setCheckHeaderRegisteredChange(false);
    }
  }

  const handleTilePermissionData = async () => {
    if (!marketingModuleAccess?.marketing_update) {
      setApiStatusMsg({
        status: 422,
        message: '<b>You do not have sufficient privileges to access this module!</b>',
      });
      setApiStatus(true);
    } else {
      let tilePermissions: any = [
        {
          "id": "1A73C535-69FB-416E-9F99-E4442BD5A609",
          "isAnonymous": state?.TPSA,
          "isRegistered": state?.TPSR,
        },
        {
          "id": "A021B4A7-C3DF-4B3E-AFD4-E6EAD78E8E87",
          "isAnonymous": state?.MPSA,
          "isRegistered": state?.MPSR,
        },
        {
          "id": "B69036EA-0F14-4FB8-A406-FE96F0CBA291",
          "isAnonymous": state?.MPBSA,
          "isRegistered": state?.MPBSR,
        },
        {
          "id": "D0A0EC48-456A-446A-A8F3-B69B5C1B578B",
          "isAnonymous": state?.MSSA,
          "isRegistered": state?.MSSR,
        },
        {
          "id": "A2B32D58-ECB3-4ECC-ACFE-BD39C23072AA",
          "isAnonymous": state?.MSBSA,
          "isRegistered": state?.MSBSR,
        },
        {
          "id": "D1F9B8DB-F03A-4D6D-A6BE-4642D3FFBE09",
          "isAnonymous": state?.FAA,
          "isRegistered": state?.FAR,
        },
        {
          "id": "4790EFDC-B2AB-4F88-9B89-DABCA6555197",
          "isAnonymous": state?.T102020MSA,
          "isRegistered": state?.T102020MSR,
        },
        {
          "id": "17925138-949C-4D94-A656-D5E1F5E6421A",
          "isAnonymous": state?.T102020MBSA,
          "isRegistered": state?.T102020MBSR,
        },
        {
          "id": "07BBCF18-A10A-473B-B590-BB3759FD1FC3",
          "isAnonymous": state?.HCA,
          "isRegistered": state?.HCR,
        },
        {
          "id": "14123B09-E372-48F1-B06B-46ECA75DC2D1",
          "isAnonymous": state?.T10PMMSA,
          "isRegistered": state?.T10PMMSR,
        },
        {
          "id": "0F654137-EDD0-4C70-A4DC-A55396E3E79B",
          "isAnonymous": state?.T10PMMBSA,
          "isRegistered": state?.T10PMMBSR,
        },
        {
          "id": "CE0D3B8B-B3D1-4384-9BFA-A93322749B85",
          "isAnonymous": state?.SMSAA,
          "isRegistered": state?.SMSAR,
        }
      ];
      const finalData: any = {
        tilePermissions: tilePermissions,
        id: marketingTrendsPageId
      };
      await editTrends(finalData);
      setApiStatusMsg({ 'status': 201, 'message': '<b>Trends page tile permissions settings updated successfully!</b>' });
      setApiStatus(true);
      setStateValue({
        ...state,
        isCheckboxChangedA: false,
        isCheckboxChangedR: false,
      })
    }
  }

  return (
    <StyledEngineProvider injectFirst>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title="Trends" sx={{ display: 'flex' }} className='HomepageData trendspageData'>
        {/* <MarketingFilterSidebar/>  */}
        <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
            <Stack direction='row' className='MainTitleHeader'>
              <Grid container mt={1}>
                <Grid item lg={12} sm={12}>
                  <Typography variant="h6" className='MainTitle'>Trend Page Display Settings</Typography>
                </Grid>

              </Grid>
            </Stack>
            {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
              <UnAuthorized />
            ) :
            (isFetching) ?
            <Box className='Spinner-Wrp'>  <Loader/></Box> :
                <Box mt={3} className='HomepageDataBody'>
                  <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Box className='HomeBlockWrapper' >
                      <Grid container spacing={2} className='hp-heading-block'>
                        <Grid item lg={9} sm={9} className='hp-heading-block-left'>
                          <Typography variant="h6">Anonymous User Header Banner</Typography>
                          <Grid className='hp-form-block' container spacing={1}>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbTitle" placeholder='Title' className='input-item hp-form-input' onChange={(event) => handleCheckHeaderBannerChange(event, "title")} value={headerBannerText.title} />
                              </Box>
                            </Grid>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbDescription" placeholder='Description' onChange={(event) => handleCheckHeaderBannerChange(event, "description")} value={headerBannerText.description} className='input-item hp-form-input' multiline rows={2.4} />
                              </Box>
                            </Grid>
                            <Grid item lg={3} sm={3} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbButtonText" placeholder='Button Text' onChange={(event) => handleCheckHeaderBannerChange(event, "buttonText")} value={headerBannerText.buttonText} className='input-item hp-form-input' />
                              </Box>
                            </Grid>
                            <Grid item lg={9} sm={9} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbUrl" placeholder='URL' onChange={(event) => handleCheckHeaderBannerChange(event, "buttonUrl")} value={headerBannerText.buttonUrl} className='input-item hp-form-input' />
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item lg={3} sm={3} className='hp-heading-block-right'>
                          <Typography variant="h6"></Typography>
                          <Box className='RHF-Switches'>
                            <RHFSwitch
                              className='RHF-Switches'
                              name="anonymous_hb_user"
                              labelPlacement="start"
                              checked={headerBannerText.isAnonymous}
                              onClick={() => { setHeaderBannerText({ ...headerBannerText, isAnonymous: !headerBannerText.isAnonymous }); setCheckHeaderChange(true) }}
                              label={
                                <>
                                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                                    Anonymous
                                  </Typography>
                                </>
                              }
                              sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                            />
                          </Box>
                        </Grid>
                        {checkHeaderChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important', }}>
                          <Stack className='home-btn  save-btn-wrpr'>
                            <Button variant='contained' className='search-btn' type='button' onClick={handleHeaderData}>Save</Button>
                          </Stack>
                        </Grid>}
                      </Grid>
                    </Box>

                    <Box className='HomeBlockWrapper' mt={4}>
                      <Grid container spacing={2} className='hp-heading-block'>
                        <Grid item lg={9} sm={9} className='hp-heading-block-left'>
                          <Typography variant="h6">Registered User Header Banner</Typography>
                          <Grid className='hp-form-block' container spacing={1}>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbTitle" placeholder='Title' className='input-item hp-form-input' onChange={(event) => handleCheckHeaderBannerRegisteredChange(event, "title")} value={headerBannerRegisteredText.title} />
                              </Box>
                            </Grid>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbDescription" placeholder='Description' onChange={(event) => handleCheckHeaderBannerRegisteredChange(event, "description")} value={headerBannerRegisteredText.description} className='input-item hp-form-input' multiline rows={2.4} />
                              </Box>
                            </Grid>
                            <Grid item lg={3} sm={3} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbButtonText" placeholder='Button Text' onChange={(event) => handleCheckHeaderBannerRegisteredChange(event, "buttonText")} value={headerBannerRegisteredText.buttonText} className='input-item hp-form-input' />
                              </Box>
                            </Grid>
                            <Grid item lg={9} sm={9} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="hbUrl" error={errors.buttonURL ? true : false} placeholder='URL' onChange={(event) => handleCheckHeaderBannerRegisteredChange(event, "buttonUrl")} value={headerBannerRegisteredText.buttonUrl} className='input-item hp-form-input' />
                                {errors.buttonURL && <div className="errorMsg">{errors.buttonURL}</div>}
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item lg={3} sm={3} className='hp-heading-block-right'>
                          <Typography variant="h6"></Typography>
                          <Box className='RHF-Switches'>
                            <RHFSwitch
                              className='RHF-Switches'
                              name="registered_hb_user"
                              labelPlacement="start"
                              checked={headerBannerRegisteredText.isRegistered}
                              onClick={() => { setHeaderBannerRegisteredText({ ...headerBannerRegisteredText, isRegistered: !headerBannerRegisteredText.isRegistered }); setCheckHeaderRegisteredChange(true) }}
                              label={
                                <>
                                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                                    Registered
                                  </Typography>
                                </>
                              }
                              sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                            />
                          </Box>
                        </Grid>
                        {checkHeaderRegisteredChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important', }}>
                          <Stack className='home-btn  save-btn-wrpr'>
                            <Button variant='contained' className='search-btn' type='button' onClick={handleHeaderRegisteredData}>Save</Button>
                          </Stack>
                        </Grid>}
                      </Grid>
                    </Box>

                    <Box className='HomeBlockWrapper' mt={4}>
                      <Grid container spacing={2} className='hp-heading-block'>
                        <Grid item lg={9} sm={9} className='hp-heading-block-left'>
                          <Typography variant="h6">Anonymous User Footer Banner</Typography>
                          <Grid className='hp-form-block' container spacing={1}>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbTitle" placeholder='Title' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerChange(event, "title")} value={footerBannerText.title} />
                              </Box>
                            </Grid>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbDescription" placeholder='Description' className='input-item hp-form-input' multiline rows={2} onChange={(event) => handleCheckFooterBannerChange(event, "description")} value={footerBannerText.description} />
                              </Box>
                            </Grid>
                            <Grid item lg={3} sm={3} className='hp-form-item'>
                              <Box className='edit-field'><RHFTextField name="fbButtonText" placeholder='Button Text' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerChange(event, "buttonText")} value={footerBannerText.buttonText} />
                              </Box>
                            </Grid>
                            <Grid item lg={9} sm={9} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbUrl"  placeholder='URL' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerChange(event, "buttonUrl")} value={footerBannerText.buttonUrl} />
                              </Box>
                              
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item lg={3} sm={3} className='hp-heading-block-right'>
                          <Typography variant="h6"></Typography>
                          <Box className='RHF-Switches'>
                            <RHFSwitch
                              className='RHF-Switches'
                              name="anonymous_fb_user"
                              labelPlacement="start"
                              checked={footerBannerText.isAnonymous}
                              onClick={() => { setFootBannerText({ ...footerBannerText, isAnonymous: !footerBannerText.isAnonymous }); setCheckFooterChange(true) }}
                              label={
                                <>
                                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                                    Anonymous
                                  </Typography>
                                </>
                              }
                              sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                            />
                          </Box>
                        </Grid>
                        {checkFooterChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important', }}>
                          <Stack className='home-btn  save-btn-wrpr'>
                            <Button variant='contained' className='search-btn' type='button' onClick={handleFooterData}>Save</Button>
                          </Stack>
                        </Grid>}
                      </Grid>
                    </Box>

                    <Box className='HomeBlockWrapper' mt={4}>
                      <Grid container spacing={2} className='hp-heading-block'>
                        <Grid item lg={9} sm={9} className='hp-heading-block-left'>
                          <Typography variant="h6">Registered User Footer Banner</Typography>

                          <Grid className='hp-form-block' container spacing={1}>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbTitle" placeholder='Title' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerRegisteredChange(event, "title")} value={footerBannerRegisteredText.title} />
                              </Box>
                            </Grid>
                            <Grid item lg={12} sm={12} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbDescription" placeholder='Description' className='input-item hp-form-input' multiline rows={2} onChange={(event) => handleCheckFooterBannerRegisteredChange(event, "description")} value={footerBannerRegisteredText.description} />
                              </Box>
                            </Grid>
                            <Grid item lg={3} sm={3} className='hp-form-item'>
                              <Box className='edit-field'><RHFTextField name="fbButtonText" placeholder='Button Text' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerRegisteredChange(event, "buttonText")} value={footerBannerRegisteredText.buttonText} />
                              </Box>
                            </Grid>
                            <Grid item lg={9} sm={9} className='hp-form-item'>
                              <Box className='edit-field'>
                                <RHFTextField name="fbUrl" error={errors.buttonURL ? true : false} placeholder='URL' className='input-item hp-form-input' onChange={(event) => handleCheckFooterBannerRegisteredChange(event, "buttonUrl")} value={footerBannerRegisteredText.buttonUrl} />
                                {errors.buttonURL && <div className="errorMsg">{errors.buttonURL}</div>}
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item lg={3} sm={3} className='hp-heading-block-right'>
                          <Typography variant="h6"></Typography>
                          <Box className='RHF-Switches'>
                            <RHFSwitch
                              className='RHF-Switches'
                              name="registered_fb_user"
                              labelPlacement="start"
                              checked={footerBannerRegisteredText.isRegistered}
                              onClick={() => { setFootBannerRegisteredText({ ...footerBannerRegisteredText, isRegistered: !footerBannerRegisteredText.isRegistered }); setCheckFooterRegisteredChange(true) }}
                              label={
                                <>
                                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                                    Registered
                                  </Typography>
                                </>
                              }
                              sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                            />
                          </Box>
                        </Grid>
                        {checkFooterRegisteredChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important', }}>
                          <Stack className='home-btn  save-btn-wrpr'>
                            <Button variant='contained' className='search-btn' type='button' onClick={handleFooterRegisteredData}>Save</Button>
                          </Stack>
                        </Grid>}
                      </Grid>
                    </Box>

                    <Box className='HomeBlockWrapper' mt={3}>
                      <Grid container className='hp-heading-block'>
                        <Grid item lg={12} sm={12} className='hp-heading-block-left'>

                          <Box className='trends-table-wrapper' mt={2}>
                            <TableContainer className='trendsdatalist' sx={{ maxWidth: '724px !important', overflow: 'hidden !important' }}>
                              <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="left">Tile Permissions</TableCell>
                                    <TableCell align="center">Anonymous</TableCell>
                                    <TableCell align="center">Registered</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {TrendsList.map((row: any, index: number) => (
                                    <TrendsListTableRow
                                      key={row.id}
                                      row={row}
                                      state={state}
                                      setStateValue={setStateValue}
                                    />
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          {(state?.isCheckboxChangedR || state?.isCheckboxChangedA) && <Grid item lg={12} sm={12} mt={2} className='hp-form-item trends-btn' sx={{ paddingTop: '6px !important', }}>
                            <Stack className='home-btn  save-btn-wrpr'>
                              <Button variant='contained' className='search-btn' type='button' onClick={handleTilePermissionData}>Save</Button>
                            </Stack>
                          </Grid>}

                        </Grid>

                      </Grid>
                    </Box>
                  </FormProvider>
                </Box>
            }
          </Container>
        </Box>
      </Page>
    </StyledEngineProvider>
  );
}