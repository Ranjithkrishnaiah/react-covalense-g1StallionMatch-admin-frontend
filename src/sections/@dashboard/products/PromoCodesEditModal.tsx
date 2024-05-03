import * as React from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// @mui
import { LoadingButton } from '@mui/lab';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import { Images } from 'src/assets/images';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  Radio,
  TextField,
  FormControl,
  Autocomplete,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { RunnerEligibleWrapperDialog } from 'src/components/runner-modal/RunnerEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import { MenuProps } from '../../../constants/MenuProps';
import {
  useAddPromoCodeMutation,
  useEditPromoCodeMutation,
  usePromoCodeQuery,
} from 'src/redux/splitEndpoints/promoCodeSplit';
import { DateRange } from 'src/@types/dateRangePicker';
import { dateHypenConvert, toPascalCase } from 'src/utils/customFunctions';
import { useMembersListWithoutAdminsQuery } from 'src/redux/splitEndpoints/memberSplit';
import CloseIcon from '@mui/icons-material/Close';
import { Checkbox } from '@mui/material';
import { useMemberProductListQuery } from 'src/redux/splitEndpoints/productSplit';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
const drawerWidth = 654;
// DrawerHeader method
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));
// Props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function PromoCodesEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus,
    setApiStatus,
    apiStatusMsg,
    setApiStatusMsg,
  } = props;
  const navigate = useNavigate();

  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  React.useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
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
    if (isEdit) {
      if (valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_EDIT_EXISTING')) {
        setUserModuleAccess(true);
      } else {
        setUserModuleAccess(false);
      }
    } else {
      if (valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_ADD_NEW_PROMOCODE')) {
        setUserModuleAccess(true);
      } else {
        setUserModuleAccess(false);
      }
    }
    // console.log(valuesExist, userModuleAccess, valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_EDIT_EXISTING'), 'valuesExist22')
  }, [valuesExist, isEdit]);

  // close Drawer handler
  const handleDrawerClose = () => {
    handleEditPopup();
    resetData();
  };

  // close modal handler
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
    setisUserLoaded(false);
    resetData();
  };

  // API call to get currencies List
  const { data: currencyList } = useCurrenciesQuery();
  // API call to add Promocode
  const [addPromoCode, addPromoCodeResponse] = useAddPromoCodeMutation();
  // API call to edit Promocode
  const [editPromoCode, editPromoCodeResponse] = useEditPromoCodeMutation();
  const [isProductActive, setIsProductActive] = React.useState(false);
  const [dueDateValue, setDueDateValue] = useState<DateRange>([null, null]);
  const [dueDate, setDueDate] = useState<DateRange>([null, null]);
  const [errors, setErrors] = React.useState<any>({});
  // API call to get member sList Without Admins List
  const { data: membersListWithoutAdminsList, isSuccess: isMemberListSuccess } =
    useMembersListWithoutAdminsQuery();
  // API call to get product List
  const { data: productList } = useMemberProductListQuery();
  const [defaultList, setDefaultList] = React.useState<any>([]);
  const [productDefaultList, setProductDefaultList] = React.useState<any>([]);
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const [isDateSelected, setIsDateSelected] = React.useState(false);
  // initial state
  const [state, setStateValue] = useState<any>({
    currencyId: '',
    discountType: isEdit ? '' : 'Percentage',
    duration: '',
    durationNo: '',
    durationType: '',
    endDate: null,
    isActive: false,
    memberId: '',
    price: '',
    inputProductIds: [],
    promoCode: '',
    promoCodeName: '',
    redemtions: '',
    startDate: null,
    inputUserIds: [],
    id: '',
  });
  // API call to get promocode Data
  const {
    data: promocodeData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = usePromoCodeQuery(rowId, { skip: !isEdit, refetchOnMountOrArgChange: true });
  const currentPromocode = promocodeData;

  // Default Values handler
  const handleDefaultValues = () => {
    if (currentPromocode?.productids?.length > 0) {
      setIsProductActive(true);
    } else {
      setIsProductActive(false);
    }
    if (isEdit) {
      setDueDate([currentPromocode.startDate, currentPromocode.endDate]);
      setDueDateValue([currentPromocode.startDate, currentPromocode.endDate]);
      if (currentPromocode.startDate && currentPromocode.endDate) {
        setConvertedCreatedRangeValue(
          `${dateHypenConvert(currentPromocode.startDate)} - ${dateHypenConvert(
            currentPromocode.endDate
          )}`
        );
      }
    }
    setStateValue({
      ...state,
      currencyId: currentPromocode.currencyId || '',
      discountType: currentPromocode.discountType
        ? String(currentPromocode.discountType)[0].toUpperCase() +
        String(currentPromocode.discountType).substring(1)
        : '',
      duration: currentPromocode.duration || '',
      durationNo: currentPromocode.durationNo || '',
      durationType: currentPromocode.durationType || '',
      endDate: currentPromocode.endDate || '',
      isActive: currentPromocode.isActive || false,
      memberId: currentPromocode.memberId || '',
      price: currentPromocode.price || '',
      inputProductIds: currentPromocode?.productids?.length
        ? currentPromocode.productids?.split(',')
        : [] || [],
      promoCode: currentPromocode.promoCode || '',
      promoCodeName: currentPromocode.promoCodeName || '',
      redemtions: currentPromocode.redemtions || '',
      startDate: currentPromocode.startDate || '',
      inputUserIds: currentPromocode?.userIds?.length
        ? currentPromocode.userIds?.split(',')
        : [] || [],
      id: currentPromocode.id || '',
    });
  };

  // call if edit and currentPromocode available
  React.useEffect(() => {
    if (isEdit && currentPromocode) {
      handleDefaultValues();
    }
    if (!isEdit) {
      resetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPromocode]);

  // method to reset data
  const resetData = () => {
    setStateValue({
      currencyId: '',
      discountType: 'Percentage',
      duration: '',
      durationNo: '',
      durationType: '',
      endDate: null,
      isActive: false,
      memberId: '',
      price: '',
      inputProductIds: [],
      promoCode: '',
      promoCodeName: '',
      redemtions: '',
      startDate: null,
      inputUserIds: [],
      id: '',
    });
    setDefaultList([]);
    setProductDefaultList([]);
    setConvertedCreatedDateValue([null, null]);
    setConvertedCreatedRangeValue('');
    setIsDateSelected(false);
    setIsProductActive(false);
  };

  

  // call if defaultList changed
  useEffect(() => {
    let idWithPlaceholder = `checkboxes-tags-demo user-new`;
    if (defaultList.length === 0) {
      document
        .getElementById(idWithPlaceholder)
        ?.setAttribute('placeholder', 'Restrict to specific user');
    }
  }, [defaultList]);

  // call if productDefaultList changed
  useEffect(() => {
    let idWithPlaceholder = `checkboxes-tags-demo new`;
    if (productDefaultList.length === 0) {
      document.getElementById(idWithPlaceholder)?.setAttribute('placeholder', 'Select Product');
    }
  }, [productDefaultList]);

  // onSubmit handler to edit PromoCode
  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const finalData = {
        ...state,
      };
      if (!isEdit) {
        if (finalData.inputUserIds.length) {
          let userList: any = [];
          userList = finalData.inputUserIds.map((v: any) => v.id);
          finalData.inputUserIds = userList;
        }
        if (finalData.inputProductIds.length) {
          let productList: any = [];
          productList = finalData.inputProductIds.map((v: any) => v.id);
          finalData.inputProductIds = productList;
        }
      }
      if (isEdit) {
        let res: any = await editPromoCode({ ...finalData });
        if (res?.error) {
          setApiStatusMsg({ status: 422, message: res?.error?.data?.message });
          setApiStatus(true);
        } else {
          setApiStatusMsg({ status: 201, message: res?.data?.message });
          setApiStatus(true);
          handleEditPopup();
          resetData();
        }
        handleCloseModal();
        handleDrawerCloseRow();
      } else {
        let res: any = await addPromoCode(finalData);
        if (res?.error) {
          setApiStatusMsg({ status: 422, message: res?.error?.data?.message });
          setApiStatus(true);
        } else {
          setApiStatusMsg({ status: 201, message: res?.data?.message });
          setApiStatus(true);
          // handleEditPopup();
          resetData();
          handleDrawerCloseRow();
        }
        // handleCloseModal();
      }
    } catch (error) { }
  };

  // validation check for edit PromoCode form
  let validateForm = () => {
    /*eslint-disable */
    let fields = state;
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (!fields['promoCode']) {
      formIsValid = false; //@ts-ignore
      errors['promoCode'] = `promoCode is required`;
    }
    if (!fields['promoCodeName']) {
      formIsValid = false; //@ts-ignore
      errors['promoCodeName'] = `PromoCode Name is required`;
    }
    if (!fields['price']) {
      formIsValid = false; //@ts-ignore
      errors['price'] = `Price is required`;
    }
    if (fields['discountType'] === 'Fixed') {
      if (!fields['currencyId']) {
        formIsValid = false; //@ts-ignore
        errors['currencyId'] = `Currency is required`;
      }
    }
    if (isProductActive) {
      if (!fields['inputProductIds']) {
        formIsValid = false; //@ts-ignore
        errors['inputProductIds'] = `Product is required`;
      }
    }
    if (!(fields['startDate'] && fields['endDate'])) {
      if (!fields['durationType']) {
        formIsValid = false; //@ts-ignore
        errors['durationType'] = `Duration Type is required`;
      }
    }
    if (!checkForNull(dueDateValue)) {
      if (fields['durationType'] === 'Multiple') {
        if (!fields['durationNo']) {
          formIsValid = false; //@ts-ignore
          errors['durationNo'] = `Duration No is required`;
        }
        if (!fields['duration']) {
          formIsValid = false; //@ts-ignore
          errors['duration'] = `Duration is required`;
        }
      }
    }
    if (fields['durationType'] === '') {
      if (!fields['startDate']) {
        formIsValid = false; //@ts-ignore
        errors['startDate'] = `Date range is required`;
      }
      if (!fields['endDate']) {
        formIsValid = false; //@ts-ignore
        errors['endDate'] = `Date range is required`;
      }
    }
    if (!fields['redemtions']) {
      formIsValid = false; //@ts-ignore
      errors['redemtions'] = `Redemtions is required`;
    }
    setErrors(errors);
    return formIsValid;
    /*eslint-enable */
  };

  const [countryID, setCountryID] = React.useState(
    currentPromocode?.countryId > 0 ? currentPromocode?.countryId : 0
  );
  const [isCountrySelected, setIsCountrySelected] = React.useState(
    currentPromocode?.countryId > 0 ? true : false
  );
  // API call to get States By CountryId
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: !isCountrySelected });
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);

  // close merge farms accounts popup
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };

  const [openRunnerEligibleWrapper, setOpenRunnerEligibleWrapper] = useState(false);

  // close merge Runner Eligible popup
  const handleCloseRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(false);
  };

  // time conversion handler
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        marginLeft: '-.5px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };

  // onChange field handler
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });

    if (type == 'price' || type == 'redemtions') {
      let priceRange = targetValue.replace(/[^0-9.]/g, '');
      setStateValue({
        ...state,
        [type]: targetValue ? priceRange : targetValue,
      });
    }

    if (type == 'redemtions') {
      let redemtionsRange = targetValue.replace(/[^0-9]/g, '');
      setStateValue({
        ...state,
        [type]: targetValue ? redemtionsRange : targetValue,
      });
    }
    if (type === 'promoCodeName') {
      let promName = targetValue.replace(/[^a-zA-Z]/g, ''); // Allow only alphabets
      setStateValue({
        ...state,
        [type]: promName,
      });
    }
    if (type === 'promoCode') {
      let promCode = targetValue.replace(/[^0-9]/g, ''); 
      setStateValue({
        ...state,
        [type]: promCode,
      });
    }
    
  };

  useEffect(() => {
    if (state.durationType == 'Once') {
      setTimeout(() => {
        setStateValue({
          ...state,
          redemtions: 1,
        });
      }, 500);
    }
  }, [state.durationType])

  // check For Null handler
  const checkForNull = (arr: any) => {
    return arr.some((el: any) => el !== null);
  };

  const [isUserLoaded, setisUserLoaded] = React.useState(false);
  // call if editing
  React.useEffect(() => {
    if (isEdit) {
      let arr: any = [];
      setDefaultList([]);
      let list = currentPromocode?.userIds?.length
        ? currentPromocode.userIds?.split(',')
        : [] || [];
      membersListWithoutAdminsList?.forEach((v: any, i) => {
        list.forEach((id: any) => {
          if (v.id == id) {
            arr.push(v);
          }
        });
      });
      setDefaultList(arr);
      setisUserLoaded(true);

      setTimeout(() => {
        if (currentPromocode?.userIds?.length) {
          let idWithPlaceholder = `checkboxes-tags-demo user-edit`;
          if (arr.length > 0) {
            document.getElementById(idWithPlaceholder)?.setAttribute('placeholder', '');
          } else if (arr.length === 0) {
            document
              .getElementById(idWithPlaceholder)
              ?.setAttribute('placeholder', 'Restrict to specific user');
          }
        }
      }, 250);

      let arr1: any = [];
      setProductDefaultList([]);
      let list1 = currentPromocode?.productids?.length
        ? currentPromocode.productids?.split(',')
        : [] || [];
      productList?.forEach((v: any, i) => {
        list1.forEach((id: any) => {
          if (v.id == id) {
            arr1.push(v);
          }
        });
      });
      setProductDefaultList(arr1);

      setTimeout(() => {
        if (currentPromocode?.productids?.length) {
          let idWithPlaceholder = `checkboxes-tags-demo edit`;
          if (arr1.length > 0) {
            document.getElementById(idWithPlaceholder)?.setAttribute('placeholder', '');
          } else if (arr1.length === 0) {
            document
              .getElementById(idWithPlaceholder)
              ?.setAttribute('placeholder', 'Select product');
          }
        }
      }, 250);
    }
  }, [currentPromocode, isSuccess]);
  React.useEffect(() => {
    setStateValue({
      ...state,
      startDate: convertedCreatedDateValue[0],
      endDate: convertedCreatedDateValue[1],
    });
    if (state?.startDate && state?.endDate) {
      setIsDateSelected(true);
    }
  }, [convertedCreatedRangeValue, convertedCreatedDateValue]);

  // close drawer handler
  const handleCloseDrawer = () => {
    handleDrawerCloseRow();
    setisUserLoaded(false);
    resetData();
    setErrors({});
  };

  return (
    // drawer
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root': {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className="DrawerRightModal RaceEditModal PromocodeEditModal"
    >
      <Scrollbar
        className="DrawerModalScroll"
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: '100vh',
            background: '#E2E7E1',
          },
        }}
      >
        <CssBaseline />
        {/* close icon */}
        <DrawerHeader className="DrawerHeader">
          <IconButton className="closeBtn" onClick={isEdit ? handleCloseModal : handleCloseDrawer}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>

        {!userModuleAccess ? <UnAuthorized /> :
          <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
            {/* form to edit promocode form */}
            <form onSubmit={onSubmit}>
              <Box px={0} className="PromoCodesEditModal">
                <Typography variant="h4" className="ImportedHeader">
                  Promo Codes
                </Typography>
                <Grid container spacing={1} mt={0} pt={0} className="RaceListModalBox">
                  <Grid item xs={8} md={8} mt={0} className="racelistgroup">
                    <Grid container spacing={2} className="" sx={{ marginTop: '0px !important' }}>
                      <Grid item xs={5} md={5} mt={0} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            name="ID"
                            placeholder="ID"
                            value={currentPromocode && currentPromocode.id}
                            className="edit-field"
                            disabled
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={3} md={3} mt={0} className="racelistgroup"></Grid>
                      <Grid item xs={4} md={4} mt={0} className="racelistgroup">
                        <Box className="FormGroup">
                          <div className="swith-container">
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              Active{' '}
                            </Typography>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={state.isActive}
                                onChange={(e) => handleChangeField('isActive', e.target.checked)}
                                name="isActive"
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </Box>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={12} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        {/* Name */}
                        <TextField
                          error={errors.promoCodeName ? true : false}
                          name="Name"
                          placeholder="Name"
                          value={toPascalCase(state.promoCodeName)}
                          onChange={(e) => handleChangeField('promoCodeName', e.target.value)}
                          className="edit-field"
                        />
                      </Box>
                      {errors.promoCodeName && <p className="error-text">{errors.promoCodeName}</p>}
                    </Grid>
                    <Grid item xs={12} md={12} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        {/* Code */}
                        <TextField
                          error={errors.promoCode ? true : false}
                          name="Code"
                          placeholder="Code"
                          value={state.promoCode}
                          onChange={(e) => handleChangeField('promoCode', e.target.value)}
                          className="edit-field"
                        />
                      </Box>
                      {errors.promoCode && <p className="error-text">{errors.promoCode}</p>}
                    </Grid>
                  </Grid>
                  <Grid item xs={4} md={4} mt={0} className="racelistgroup RawDataGroup">
                    <Box className="FormGroup">
                      <List className="RawDataList" sx={{ padding: '0px', paddingBottom: '0px' }}>
                        <ListItem>
                          <ListItemText
                            primary="Created:"
                            secondary={
                              currentPromocode?.createdOn
                                ? parseDate(currentPromocode?.createdOn)
                                : '--'
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Updated:"
                            secondary={
                              currentPromocode?.modifiedOn
                                ? parseDate(currentPromocode?.modifiedOn)
                                : '--'
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Redemptions:"
                            secondary={
                              currentPromocode?.redemtions ? currentPromocode?.redemtions : '--'
                            }
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={1} pt={0}>
                    <Typography variant="h4" className="">
                      Type*
                    </Typography>{' '}
                  </Grid>
                  <Grid
                    item
                    xs={5}
                    md={5}
                    mt={0}
                    pt={0}
                    className="promocodeRadio"
                    sx={{ alignItems: 'start' }}
                  >
                    <Box className="">
                      {/* Percentage and Fixed Discount */}
                      <FormControl>
                        <RadioGroup
                          sx={{
                            paddingLeft: '5px',
                            paddingTop: '0px',
                          }}
                          className="RadioList"
                          row
                          aria-labelledby="demo-row-radio-buttons-group-label"
                          value={state?.discountType}
                          defaultValue={isEdit ? state?.discountType : 'Percentage'}
                          name="discountType"
                          onChange={(e: any) => {
                            handleChangeField('discountType', e.target.value);
                          }}
                        >
                          <FormControlLabel
                            value="Percentage"
                            control={
                              <Radio
                                checkedIcon={<img src={Images.Radiochecked} />}
                                icon={<img src={Images.Radiounchecked} />}
                              />
                            }
                            label="Percentage Discount"
                          />
                          <FormControlLabel
                            value="Fixed"
                            control={
                              <Radio
                                checkedIcon={<img src={Images.Radiochecked} />}
                                icon={<img src={Images.Radiounchecked} />}
                              />
                            }
                            label="Fixed $ Discount"
                          />
                        </RadioGroup>
                      </FormControl>
                      {/* Percentage and Fixed Discount ends */}
                    </Box>
                  </Grid>

                  <Grid item xs={6} md={6} mt={0} pt={0} className="promocodeRadio">
                    <Grid container spacing={0.5}>
                      <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            name="Name"
                            error={errors.price ? true : false}
                            placeholder="%"
                            type="number"
                            value={state?.discountType === 'Fixed' ? null : state.price}
                            disabled={state?.discountType === 'Fixed'}
                            onChange={(e: any) => {
                              handleChangeField('price', e.target.value);
                            }}
                            className="edit-field"
                          />
                        </Box>
                        {state?.discountType === 'Percentage' && (
                          <p className="error-text">{errors.price}</p>
                        )}
                      </Grid>
                      <Grid item xs={6} md={6} mt={0} className="racelistgroup"></Grid>
                      <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                        <Box className="FormGroup">
                          <Box className="edit-field selectCurrencyFieldpromo">
                            <Select
                              // MenuProps={MenuPropss}
                              MenuProps={{
                                disableScrollLock: true,
                                ...MenuProps
                              }}
                              IconComponent={KeyboardArrowDownRoundedIcon}
                              value={state.currencyId === '' ? 'none' : state.currencyId}
                              className="filter-slct"
                              disabled={state?.discountType === 'Percentage'}
                              onChange={(e: any) => {
                                handleChangeField('currencyId', e.target.value);
                              }}
                              defaultValue="none"
                              name="expiredStallion"
                            >
                              <MenuItem
                                className="selectDropDownList selectCurrencyListPromo"
                                value="none"
                                disabled
                              >
                                <em>Currency</em>
                              </MenuItem>
                              {currencyList?.map(({ id, currencyName }) => {
                                return (
                                  <MenuItem
                                    className="selectDropDownList selectCurrencyListPromo"
                                    value={id}
                                    key={id}
                                  >
                                    {currencyName}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </Box>
                          {state?.discountType === 'Fixed' && (
                            <p className="error-text">{errors.currencyId}</p>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            name="Name"
                            placeholder="Price"
                            value={state?.discountType === 'Percentage' ? null : state.price}
                            disabled={state?.discountType === 'Percentage'}
                            onChange={(e: any) => {
                              handleChangeField('price', e.target.value);
                            }}
                            className="edit-field"
                          />
                        </Box>
                        {state?.discountType === 'Fixed' && (
                          <p className="error-text">{errors.price}</p>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={5.5} md={5.5} mt={2} className="racelistgroup">
                    <Box className="FormGroup">
                      <div className="swith-container applytospecific">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="isEligible"
                            onChange={(e: any) => setIsProductActive(e.target.checked)}
                            checked={isProductActive}
                          />
                          <span className="slider round"></span>
                        </label>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                          Apply to specific products{' '}
                        </Typography>
                      </div>
                    </Box>
                  </Grid>

                  <Grid item xs={6.5} md={6.5} mt={2} className="racelistgroup">
                    <Box className="FormGroup">
                      <Box className="edit-field selectuserpromo">
                        {/* Select Product */}
                        {isUserLoaded && (
                          <Autocomplete
                            id="checkboxes-tags-demo edit"
                            options={productList || []}
                            value={productDefaultList}
                            filterSelectedOptions
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            multiple
                            disableCloseOnSelect
                            disablePortal
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            getOptionLabel={(option: any) =>
                              `${toPascalCase(option?.productName)?.toString()}`
                            }
                            onChange={(e: any, selectedOptions: any) => {
                              let arr: any = [];
                              selectedOptions?.map((record: any) => {
                                arr.push(record?.id);
                              });
                              setStateValue({
                                ...state,
                                inputProductIds: arr,
                              });
                              setProductDefaultList(selectedOptions);
                              let idWithPlaceholder = `checkboxes-tags-demo edit`;
                              if (
                                selectedOptions.length > 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', '');
                              } else if (
                                selectedOptions.length === 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length === 0
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', 'Select Product');
                              }
                            }}
                            renderOption={(props: any, option: any, { selected }) => {
                              return (
                                <li {...props}>
                                  <span className="autocompleteTitle">
                                    {toPascalCase(option?.productName)?.toString()}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} />}
                                    icon={<img src={Images.unchecked} />}
                                    style={{ marginRight: 0 }}
                                    checked={selected}
                                  />
                                </li>
                              );
                            }}
                            renderInput={(params: any) => (
                              <TextField {...params} placeholder={'Select Product'} />
                            )}
                            disabled={!isProductActive}
                          />
                        )}
                        {!isUserLoaded && !isEdit && (
                          <Autocomplete
                            id="checkboxes-tags-demo new"
                            options={productList || []}
                            value={productDefaultList}
                            filterSelectedOptions
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            getOptionLabel={(option: any) =>
                              `${toPascalCase(option?.productName)?.toString()}`
                            }
                            onChange={(e: any, selectedOptions: any) => {
                              let arr: any = [];
                              selectedOptions?.map((record: any) => {
                                arr.push(record);
                              });
                              setStateValue({
                                ...state,
                                inputProductIds: arr,
                              });
                              setProductDefaultList(selectedOptions);
                              let idWithPlaceholder = `checkboxes-tags-demo new`;
                              if (
                                selectedOptions.length > 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', '');
                              } else if (
                                selectedOptions.length === 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length === 0
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', 'Select Product');
                              }
                            }}
                            renderOption={(props: any, option: any, { selected }) => {
                              return (
                                <li {...props}>
                                  <span className="autocompleteTitle">
                                    {toPascalCase(option?.productName)?.toString()}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} />}
                                    icon={<img src={Images.unchecked} />}
                                    style={{ marginRight: 0 }}
                                    checked={selected}
                                  />
                                </li>
                              );
                            }}
                            renderInput={(params: any) => (
                              <TextField {...params} placeholder={'Select Product'} />
                            )}
                            disabled={!isProductActive}
                          />
                        )}
                        {isProductActive && <p className="error-text">{errors.inputProductIds}</p>}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                    <Typography variant="h4" className="">
                      Duration*
                    </Typography>
                  </Grid>
                  <Grid item xs={5} md={5} mt={1} className="racelistgroup">
                    <Box className="FormGroup" pr={3}>
                      <Box className={`edit-field product-duration ${errors.durationType ? 'Mui-error' : " "}`}>
                        {/* durationType */}
                        <Select
                          MenuProps={{
                            disableScrollLock: true,
                            ...MenuProps
                          }}
                          value={state.durationType === '' ? 'none' : state.durationType}
                          endAdornment={<IconButton sx={{display: state.durationType ? "": "none"}} onClick={() => {setStateValue({...state,durationType: ''})}}><CloseIcon /></IconButton>}
                          onChange={(e: any) => {
                            handleChangeField('durationType', e.target.value);
                          }}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          disabled={
                            checkForNull(convertedCreatedDateValue)
                          }
                          className="filter-slct"
                          defaultValue="none"
                          name="expiredStallion"
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Duration</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Forever">
                            Forever
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Once">
                            Once
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Multiple">
                            Multiple{' '}
                          </MenuItem>
                        </Select>
                      </Box>
                    </Box>
                    {errors.durationType && <p className="error-text">{errors.durationType}</p>}
                  </Grid>
                  <Grid item xs={7} md={7} mt={1} className="racelistgroup">
                    <Grid container spacing={1} mt={0} pl={3}>
                      <Grid item xs={6} md={6} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            name="Name"
                            error={errors.durationNo ? true : false}
                            type={'number'}
                            placeholder="Enter Number"
                            value={state.durationNo}
                            onChange={(e: any) => {
                              handleChangeField('durationNo', e.target.value);
                            }}
                            disabled={state.durationType !== 'Multiple' || checkForNull(dueDateValue)}
                            className="edit-field"
                          />
                        </Box>
                        {errors.duration && state?.durationType === 'Multiple' && (
                          <p className="error-text">{errors.durationNo}</p>
                        )}
                      </Grid>
                      <Grid item xs={6} md={6} className="racelistgroup">
                        <Box className="FormGroup">
                          <Box className={`edit-field ${errors.duration ? 'Mui-error' : " "}`}>
                            <Select
                              MenuProps={{
                                disableScrollLock: true,
                                ...MenuProps
                              }}
                              value={state.duration === '' ? 'none' : state.duration}
                              IconComponent={KeyboardArrowDownRoundedIcon}
                              disabled={
                                state.durationType !== 'Multiple' || checkForNull(dueDateValue)
                              }
                              onChange={(e: any) => {
                                handleChangeField('duration', e.target.value);
                              }}
                              className="filter-slct"
                              defaultValue="none"
                              name="expiredStallion"
                            >
                              <MenuItem className="selectDropDownList" value="none" disabled>
                                <em>Select</em>
                              </MenuItem>
                              <MenuItem className="selectDropDownList" value="Months">
                                Months
                              </MenuItem>
                              <MenuItem className="selectDropDownList" value="years">
                                Years
                              </MenuItem>
                            </Select>
                          </Box>
                          {state?.durationType === 'Multiple' && (
                            <p className="error-text">{errors.duration}</p>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                    <Grid container spacing={5} mt={0}>
                      <Grid item xs={6} md={6} mt={0.5} className="racelistgroup">
                        <Typography variant="h4" className="" mb={1}>
                          Date Range Restrictions
                        </Typography>
                        <Box className="FormGroup">
                          <Box className="calender-wrapper1">
                            <Box className={`edit-field ${errors.startDate ? 'Mui-error' : " "}`}>
                              {/* Date Range Restrictions date picker */}
                              <CustomFilterRangePicker
                                placeholderText="Date Range Eligible"
                                convertedDateRangeValue={convertedCreatedRangeValue}
                                setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                                convertedDateValue={convertedCreatedDateValue}
                                setConvertedYobDateValue={setConvertedCreatedDateValue}
                                disabled={state.durationType !== ''}
                              />
                            </Box>
                          </Box>
                        </Box>
                        {<p className="error-text">{errors.startDate}</p>}
                      </Grid>

                      <Grid item xs={6} md={6} mt={0.5} className="racelistgroup">
                        <Typography variant="h4" className="" mb={1}>
                          Max Redemtions
                        </Typography>
                        <Box className="FormGroup">
                          {/* Max Redemtions */}
                          <TextField
                            name="redemtions"
                            error={errors.redemtions ? true : false}
                            placeholder="Max # Redemtions"
                            value={state.redemtions}
                            onChange={(e: any) => {
                              handleChangeField('redemtions', e.target.value);
                            }}
                            disabled={state.durationType === 'Once' ? true : false}
                            className="edit-field"
                          />
                        </Box>
                        {errors.redemtions && <p className="error-text">{errors.redemtions}</p>}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                    <Typography variant="h4" className="" mb={1}>
                      Restrict to Specific User
                    </Typography>
                    <Box className="FormGroup">
                      <Box className="edit-field">
                        {/* Restrict to Specific User */}
                        {isUserLoaded && (
                          <Autocomplete
                            id="checkboxes-tags-demo user-edit"
                            options={membersListWithoutAdminsList || []}
                            value={defaultList}
                            filterSelectedOptions
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            getOptionLabel={(option: any) =>
                              `${toPascalCase(option?.fullName)?.toString()}`
                            }
                            onChange={(e: any, selectedOptions: any) => {
                              let arr: any = [];
                              selectedOptions?.map((record: any) => {
                                arr.push(record?.id);
                              });
                              setStateValue({
                                ...state,
                                inputUserIds: arr,
                              });
                              setDefaultList(selectedOptions);
                              let idWithPlaceholder = `checkboxes-tags-demo user-edit`;
                              if (
                                selectedOptions.length > 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', '');
                              } else if (
                                selectedOptions.length === 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length === 0
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', 'Restrict to specific user');
                              }
                            }}
                            renderOption={(props: any, option: any, { selected }) => {
                              return (
                                <li {...props} key={`${option?.fullName}-${option?.id}`}>
                                  <span className="autocompleteTitle">
                                    {toPascalCase(option?.fullName)?.toString()}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} />}
                                    icon={<img src={Images.unchecked} />}
                                    style={{ marginRight: 0 }}
                                    checked={selected}
                                  />
                                </li>
                              );
                            }}
                            renderInput={(params: any) => (
                              <TextField {...params} placeholder={'Restrict to specific user'} />
                            )}
                            filterOptions={(option: any, state: any) => {
                              let optionList: any = [];
                              optionList = option?.filter((v: any) => {
                                let countryFullname = v?.fullName?.toLowerCase();
                                let searchCountryName = state?.inputValue?.toLowerCase();
                                if (countryFullname?.startsWith(searchCountryName)) {
                                  return true;
                                }
                                return false;
                              })
                              return optionList;
                            }}
                          />
                        )}
                        {!isUserLoaded && !isEdit && (
                          <Autocomplete
                            id="checkboxes-tags-demo user-new"
                            options={membersListWithoutAdminsList || []}
                            value={defaultList}
                            filterSelectedOptions
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            getOptionLabel={(option: any) =>
                              `${toPascalCase(option?.fullName)?.toString()}`
                            }
                            onChange={(e: any, selectedOptions: any) => {
                              let arr: any = [];
                              selectedOptions?.map((record: any) => {
                                arr.push(record);
                              });
                              setStateValue({
                                ...state,
                                inputUserIds: arr,
                              });
                              setDefaultList(selectedOptions);
                              let idWithPlaceholder = `checkboxes-tags-demo user-new`;
                              if (
                                selectedOptions.length > 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', '');
                              } else if (
                                selectedOptions.length === 0 &&
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.getAttribute('placeholder')?.length === 0
                              ) {
                                document
                                  .getElementById(idWithPlaceholder)
                                  ?.setAttribute('placeholder', 'Restrict to specific user');
                              }
                            }}
                            renderOption={(props: any, option: any, { selected }) => {
                              return (
                                <li {...props} key={`${option?.fullName}-${option?.id}`}>
                                  <span className="autocompleteTitle">
                                    {toPascalCase(option?.fullName)?.toString()}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} />}
                                    icon={<img src={Images.unchecked} />}
                                    style={{ marginRight: 0 }}
                                    checked={selected}
                                  />
                                </li>
                              );
                            }}
                            filterOptions={(option: any, state: any) => {
                              let optionList: any = [];
                              optionList = option?.filter((v: any) => {
                                let countryFullname = v?.fullName?.toLowerCase();
                                let searchCountryName = state?.inputValue?.toLowerCase();
                                if (countryFullname?.startsWith(searchCountryName)) {
                                  return true;
                                }
                                return false;
                              })
                              return optionList;
                            }}
                            renderInput={(params: any) => (
                              <TextField {...params} placeholder={'Restrict to specific user'} />
                            )}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '5px !important' }}>
                    <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                      {/* save and cancel button */}
                      <Grid container spacing={4} className="DrawerBtnBottom">
                        <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                          <LoadingButton
                            fullWidth
                            className="search-btn"
                            type="submit"
                            variant="contained"
                          >
                            {!isEdit ? 'Save' : 'Save'}
                          </LoadingButton>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                          <Button
                            fullWidth
                            type="button"
                            className="add-btn"
                            onClick={isEdit ? handleCloseModal : handleCloseDrawer}
                          >
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                      {/* save and cancel button ends */}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
            {/* form to edit promocode form ends */}
          </Box>
        }

        {/* Runner Eligible WrapperDialog */}
        <RunnerEligibleWrapperDialog
          title="Are you sure?"
          open={openRunnerEligibleWrapper}
          close={handleCloseRunnerEligibleWrapper}
        />
        {/* Merge Farm Accounts WrapperDialog */}
        <MergeFarmAccountsWrapperDialog
          title="Merge Farm Accounts"
          open={openMergeFarmAccountsWrapper}
          close={handleCloseMergeFarmAccountsWrapper}
        />
      </Scrollbar>
    </Drawer>
  );
}
