import * as React from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { FormProvider, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import * as Yup from 'yup';
// redux
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import { v4 as uuid } from 'uuid';

import { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { RunnerEligibleWrapperDialog } from 'src/components/runner-modal/RunnerEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import { useCategoriesQuery } from 'src/redux/splitEndpoints/categoriesSplit';
import { useAddProductMutation, useProductListQuery } from 'src/redux/splitEndpoints/productSplit';
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
// FormValuesProps type
type FormValuesProps = any;
// Props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function ProductsNewEditModal(props: any) {
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
    if (valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS')) {
      setUserModuleAccess(true);
    }
  }, [valuesExist]);

  // close Drawer handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // close modal handler
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
    reset(defaultValues);
  };

  // close Drawer handler and set values
  const handleCloseDrawer = () => {
    handleDrawerCloseRow();
    reset(defaultValues);
    setValue('categoryName', 'none');
    setValue('productName', 'none');
    setValue('isActive', false);
    setPricingList('');
  };

  // API call to get currencies List
  const { data: currencyList } = useCurrenciesQuery();
  // API call to get categories List
  const { data: categoriesList } = useCategoriesQuery();
  // API call to get products List
  const { data: productList } = useProductListQuery();
  // API call to add Product
  const [addProduct, addProductResponse] = useAddProductMutation();
  const [pricingList, setPricingList] = useState<any>([]);
  const [isDuplicateCurrency, setisDuplicateCurrency] = useState<any>(false);

  // New farm Schema for form
  const NewFarmSchema = Yup.object().shape({
    categoryName: Yup.string().required('category Name is required'),
    productName: Yup.string().required('product Name is required'),
    isActive: Yup.boolean(),
  });

  // defaultValues
  const defaultValues = React.useMemo(
    () => ({
      categoryName: 'none',
      productName: 'none',
      isActive: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // methods for form
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
    defaultValues,
  });

  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // on not edit call this hook to reset
  React.useEffect(() => {
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

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

  // price change handler
  const handlePriceChange = (e: any, v: any, type: string) => {
    let event = Number(e?.target?.value);
    let newState = pricingList.map((element: any) => {
      if (element.id === v.id) {
        if (watch('categoryName') === 4) {
          return { ...element, [type]: event !== 0 ? event : null }
        } else {
          return { ...element, price: event !== 0 ? event : null };
        }
      }
      return element;
    });
    setPricingList(newState);
  };

  // Currency change handler
  const handleCurrency = (e: any, v: any) => {
    let code: any = currencyList?.filter((curr, i) => e?.target?.value === curr.id)[0];
    let flag = false;
    let count = setisDuplicateCurrency(false);
    for (let index = 0; index < pricingList.length; index++) {
      const element = pricingList[index];
      if (element.currencyId === code.id) {
        flag = true;
        setisDuplicateCurrency(true);
        break;
      }
    }
    let newState = pricingList.map((element: any) => {
      if (element.id === v.id) {
        return {
          ...element,
          currencyId: Number(e?.target?.value),
          currencyCode: code.currencyCode,
          currencySymbol: code.currencySymbol,
          currencyName: code.currencyName,
        };
      }
      return element;
    });
    setPricingList(newState);
    if (flag) alert('duplicate currency selected');
  };

  // pricing slider action handler
  const handleAction = (v: any) => {
    let newState = pricingList.map((element: any) => {
      if (element.id === v.id) {
        return { ...element, isActive: !v.isActive };
      }
      return element;
    });
    setPricingList(newState);
  };

  // add pricing handler
  const handleAddPricing = () => {
    let newState = {
      id: uuid(),
      currencyId: 'none',
      price: '',
      isActive: true,
      currencyName: '',
      currencyCode: '',
      currencySymbol: '',
      isNew: true,
      ...(watch('categoryName') === 4 && { tier1: null }),
      ...(watch('categoryName') === 4 && { tier2: null }),
      ...(watch('categoryName') === 4 && { tier3: null }),
      ...(watch('categoryName') === 4 && { range1: null }),
      ...(watch('categoryName') === 4 && { range2: null }),
    };
    setPricingList([...pricingList, newState]);
  };

  // check validation handler
  const checkValidation = () => {
    let flag = true;
    for (let index = 0; index < pricingList.length; index++) {
      const element = pricingList[index];
      if (watch('categoryName') === 4) {
        if (
          element.currencyId === '' ||
          element.currencyId === 'none' ||
          element.tier1 === null || element.tier1 === 0 || element.tier1 === '' ||
          element.tier2 === null || element.tier2 === 0 || element.tier2 === '' ||
          element.tier3 === null || element.tier3 === 0 || element.tier3 === '' ||
          element.range1 === null || element.range1 === 0 || element.range1 === '' ||
          element.range2 === null || element.range2 === 0 || element.range2 === ''
        ) {
          flag = false;
          break;
        }
      } else {
        if (
          element.currencyId === '' ||
          element.currencyId === 'none' ||
          element.price === null ||
          element.price === 0 ||
          element.price === ''
        ) {
          flag = false;
          break;
        }
      }
    }
    if (isDuplicateCurrency) flag = false;
    if (!pricingList.length) flag = false;
    if (watch('productName') === 'none') flag = false;
    if (watch('categoryName') === 'none') flag = false;
    return flag;
  };

  // on Submit form add product
  const onSubmit = async (data: FormValuesProps) => {
    let duplicatePriceList = JSON.parse(JSON.stringify(pricingList));

    for (let index = 0; index < duplicatePriceList.length; index++) {
      const element: any = duplicatePriceList[index];
      for (let index = 0; index < pricingList.length; index++) {
        const pricingElement = pricingList[index];
        if (element.currencyId === pricingElement.currencyId) {
          if (pricingElement.range1 <= pricingElement.range2) {
            element.studFeeRange = `${pricingElement.range1},${pricingElement.range2}`;
          } else {
            element.studFeeRange = `${pricingElement.range2},${pricingElement.range1}`;
          }
        }
      }
    }

    for (let index = 0; index < duplicatePriceList.length; index++) {
      const element = duplicatePriceList[index];

      for (var key in element) {
        if (element.hasOwnProperty(key)) {
          //Now, element[key] is the current value
          if (element.isNew) {
            delete element.id;
          }
          if (watch('categoryName') === 4) {
            delete element?.range1;
            delete element?.range2;
          }
        }
      }
    }

    let prodObj = {
      categoryId: data.categoryName,
      productName: data.productName,
      price: 0,
      currencyId: 0,
      isActive: data.isActive,
      pricingTable: duplicatePriceList,
    };
    // console.log(prodObj, 'duplicatePriceList new');
    let res: any = await addProduct({ ...prodObj });
    if (res?.error) {
      setApiStatusMsg({ status: 422, message: res?.error?.data?.message });
      setApiStatus(true);
    } else {
      setApiStatusMsg({ status: 201, message: 'success' });
      setApiStatus(true);
      handleDrawerCloseRow();
    }
  };

  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-2px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
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
      className="DrawerRightModal RaceEditModal ProductEditModal"
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
        <DrawerHeader className="DrawerHeader">
          <IconButton className="closeBtn" onClick={isEdit ? handleCloseModal : handleCloseDrawer}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>

        {!userModuleAccess ? <UnAuthorized /> :
          <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
            {/* form to add product */}
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Box px={0}>
                <Typography variant="h4" className="ImportedHeader">
                  Products
                </Typography>
                <Grid container spacing={3} mt={0} pt={0} className="RaceListModalBox">
                  <Grid item xs={8} md={8} mt={0} className="racelistgroup">
                    <Box className="FormGroup">
                      <Box className="edit-field">
                        <Select
                          {...register(`productName`)}
                          MenuProps={{
                            className: 'common-scroll-lock',

                            disableScrollLock: true,
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            ...MenuPropss,
                          }}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          className="filter-slct"
                          //defaultValue={defaultValues.productName}
                          value = {getValues('productName')}
                          name="productName"
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Product Name</em>
                          </MenuItem>
                          {productList?.map((v: any, i: number) => {
                            return (
                              <MenuItem
                                className="selectDropDownList"
                                value={v.productName}
                                key={v.id}
                              >
                                {v.productName}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>
                      <Box className="edit-field">
                        {/* Product Category */}
                        <Select
                          {...register(`categoryName`)}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          className="filter-slct"
                          //defaultValue={defaultValues.categoryName}
                          value = {getValues('categoryName')}
                          MenuProps={{
                            className: 'common-scroll-lock',

                            disableScrollLock: true,
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            ...MenuPropss,
                          }}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Product Category</em>
                          </MenuItem>
                          {categoriesList?.map((v: any, i: number) => {
                            return (
                              <MenuItem className="selectDropDownList" value={v.id} key={v.id}>
                                {v.categoryName}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={4} md={4} mt={0} className="racelistgroup RawDataGroup">
                    <Box className="FormGroup">
                      <List className="RawDataList" sx={{ padding: '0px', paddingBottom: '0px' }}>
                        <ListItem>
                          <ListItemText primary="Created:" secondary="--" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Updated:" secondary="--" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="MRR:" secondary="--" />
                        </ListItem>
                      </List>
                      <Box className="FormGroup">
                        <RHFSwitch
                          checked={getValues('isActive')}
                          className="RHF-Switches product-switch"
                          name="isActive"
                          labelPlacement="start"
                          label={
                            <>
                              <Typography variant="h4" sx={{ m: 0 }}>
                                Active
                              </Typography>
                            </>
                          }
                          sx={{ mx: 0, width: 1, mt: 0, mb: 0, justifyContent: 'space-between' }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={1} className="racelistgroup">
                    {/* Pricing Table */}
                    <Typography variant="h4" className="">
                      Pricing Table
                    </Typography>
                    <Box className="FormGroup" mt={1.5}>
                      <Scrollbar>
                        <TableContainer className="pricing-table">
                          <Table
                            sx={{ borderCollapse: 'separate', borderSpacing: '0 0px' }}
                            stickyHeader
                            aria-label="sticky table"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell align="left">Currency</TableCell>
                                <TableCell align="left">Currency Code</TableCell>
                                <TableCell align="left">Display Code</TableCell>
                                <TableCell align="left">Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {pricingList &&
                                pricingList.map((v: any, i: number) => {
                                  return (
                                    <TableRow hover key={i}>
                                      <TableCell align="left">
                                        {v.isActive ? (
                                          <Box className="edit-field selectCurrencyField">
                                            <Select
                                              MenuProps={{
                                                anchorOrigin: {
                                                  vertical: 'bottom',
                                                  horizontal: 'left',
                                                },
                                                transformOrigin: {
                                                  vertical: 'top',
                                                  horizontal: 'left',
                                                },

                                                disableScrollLock: 'true',
                                                getContentAnchorEl: null,
                                                ...MenuPropss,
                                              }}
                                              IconComponent={KeyboardArrowDownRoundedIcon}
                                              className="filter-slct"
                                              onChange={(e) => handleCurrency(e, v)}
                                              defaultValue={v.currencyId}
                                              name="currencySelect"
                                            >
                                              <MenuItem
                                                className="selectDropDownList selectCurrencyList"
                                                value="none"
                                                disabled
                                              >
                                                <em>Select Currency</em>
                                              </MenuItem>
                                              {currencyList?.map(({ id, currencyName }) => {
                                                return (
                                                  <MenuItem
                                                    className="selectDropDownList selectCurrencyList"
                                                    value={id}
                                                    key={id}
                                                  >
                                                    {currencyName}
                                                  </MenuItem>
                                                );
                                              })}
                                            </Select>
                                          </Box>
                                        ) : (
                                          v.currencyName
                                        )}
                                      </TableCell>
                                      <TableCell align="left">{v.currencyCode}</TableCell>
                                      <TableCell align="left">{v.currencySymbol}</TableCell>
                                      {watch('categoryName') !== 4 && <TableCell align="left">
                                        <Box className="FormPricetextWrp">
                                          <Box className="FormPricetextWrpIn">
                                            {v.isActive ? (
                                              <Box className="FormPricetext">
                                                <RHFTextField
                                                  name="price"
                                                  type={'number'}
                                                  defaultValue={v.price}
                                                  onChange={(event) => handlePriceChange(event, v, '')}
                                                  placeholder="Price"
                                                  className="edit-field"
                                                />
                                              </Box>
                                            ) : (
                                              v.price
                                            )}
                                          </Box>
                                          <Button
                                            type="button"
                                            className="disable-btn-green"
                                            onClick={() => handleAction(v)}
                                          >
                                            {v.isActive ? 'Disable' : 'Enable'}
                                          </Button>
                                        </Box>
                                      </TableCell>}
                                      {watch('categoryName') === 4 && <TableCell align="left">
                                        <Box className="FormPricetextWrp">
                                          <Box className="FormPricetextWrpIn">
                                            {v.isActive ? (
                                              <>
                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      <RHFTextField
                                                        name="tier1"
                                                        type={'number'}
                                                        value={v.tier1}
                                                        onChange={(event) =>
                                                          handlePriceChange(event, v, 'tier1')
                                                        }
                                                        placeholder="Tier 1"
                                                        className="edit-field"
                                                      />
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      <RHFTextField
                                                        name="range1"
                                                        type={'number'}
                                                        value={v.range1}
                                                        onChange={(event) =>
                                                          handlePriceChange(event, v, 'range1')
                                                        }
                                                        placeholder="Range 1"
                                                        className="edit-field"
                                                      />
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      <RHFTextField
                                                        name="tier2"
                                                        type={'number'}
                                                        value={v.tier2}
                                                        onChange={(event) =>
                                                          handlePriceChange(event, v, 'tier2')
                                                        }
                                                        placeholder="Tier 2"
                                                        className="edit-field"
                                                      />
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      <RHFTextField
                                                        name="range2"
                                                        type={'number'}
                                                        value={v.range2}
                                                        onChange={(event) =>
                                                          handlePriceChange(event, v, 'range2')
                                                        }
                                                        placeholder="Range 2"
                                                        className="edit-field"
                                                      />
                                                    </Box>
                                                  </Grid>
                                                </Grid>

                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      <RHFTextField
                                                        name="tier3"
                                                        type={'number'}
                                                        value={v.tier3}
                                                        onChange={(event) =>
                                                          handlePriceChange(event, v, 'tier3')
                                                        }
                                                        placeholder="Tier 3"
                                                        className="edit-field"
                                                      />
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {/* <RHFTextField
                                                          name="range3"
                                                          type={'number'}
                                                          value={null}
                                                          onChange={(event) =>
                                                            handlePriceChange(event, v, 'range3')
                                                          }
                                                          placeholder="Range 3"
                                                          className="edit-field"
                                                        /> */}
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                              </>
                                            ) : (
                                              <>
                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {v.tier1}
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {v.range1}
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {v.tier2}
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {v.range2}
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                                <Grid container spacing={0.5} mt={0} pt={0}>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">
                                                      {v.tier3}
                                                    </Box>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Box className="FormPricetext">

                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                              </>
                                            )}
                                          </Box>
                                          <Box>
                                            <Button
                                              disableFocusRipple
                                              disableRipple
                                              disableElevation
                                              type="button"
                                              className="disable-btn-green"
                                              onClick={() => handleAction(v)}
                                            >
                                              {v.isActive ? 'Disable' : 'Enable'}
                                            </Button>
                                          </Box>
                                        </Box>
                                      </TableCell>}
                                    </TableRow>
                                  );
                                })}

                              <TableRow className="add-table-wrapper">
                                <TableCell align="left" scope="row">
                                  <Button
                                    type="button"
                                    className="disable-btn-green"
                                    onClick={handleAddPricing}
                                  >
                                    Add +
                                  </Button>
                                </TableCell>
                                <TableCell align="left"></TableCell>
                                <TableCell align="left"></TableCell>
                                <TableCell align="left"></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Scrollbar>
                    </Box>
                    {/* Pricing Table ends */}
                  </Grid>

                  <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '10px !important' }}>
                    <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                      {/* save and cancel buttons */}
                      <Grid container spacing={4} className="DrawerBtnBottom">
                        <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                          <LoadingButton
                            fullWidth
                            className="search-btn"
                            type="submit"
                            variant="contained"
                            disabled={!checkValidation()}
                            loading={isSubmitting}
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
                      {/* save and cancel buttons ends */}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </FormProvider>
            {/* form to add product ends */}
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
