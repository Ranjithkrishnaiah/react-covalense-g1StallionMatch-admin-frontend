import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// form
import {
  FormProvider,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';

import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import Scrollbar from 'src/components/Scrollbar';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  Switch,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { ConfirmReportWrapperDialog } from 'src/components/sales-modal/ConfirmReportWrapper';
import { MenuProps } from '../../../constants/MenuProps';
import { useAddSalesMutation, useDownloadSalesTemplateQuery, useEditSalesMutation, useSaleCompanyQuery, useSaleQuery, useSaleStatusQuery, useSaleTypeQuery, useUploadLotsMutation } from 'src/redux/splitEndpoints/salesSplit';
import { DateRange } from 'src/@types/dateRangePicker';
import { dateHypenConvert } from 'src/utils/customFunctions';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { SwitchProps } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { toast } from 'react-toastify';

const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

// IOSSwitch SwitchProps
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: '0px 0px 0px',
    margin: '2px 3px',
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#1D472E',
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
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#B0B6AF' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

type FormValuesProps = any;

type UploadCsvProps = {
  setSalesLotFile: React.Dispatch<React.SetStateAction<any>>;
  setUploadLotsError: React.Dispatch<React.SetStateAction<any>>;
  setUploadLotsSuccess: React.Dispatch<React.SetStateAction<any>>;
  setUploadLotsResponse: React.Dispatch<React.SetStateAction<any>>;
  currentSale?: any;
}

export default function SalesViewDetailsModal(props: any) {

  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg
  } = props;

  const navigate = useNavigate();
  const [addSales] = useAddSalesMutation();
  const [editSales] = useEditSalesMutation();
  const [isDownloadTemplateClicked, setIsDownloadTemplateClicked] = React.useState<any>(true);
  const [createDateValue, setCreateDateValue] = React.useState<DateRange>([null, null]);
  const [formError, setFormErrors] = React.useState<any>({});
  const [openSourceDataURL, setOpenSourceDataURL] = React.useState<any>(false);
  const [salesLotFile, setSalesLotFile] = React.useState<File>();
  const [uploadLotsError, setUploadLotsError] = React.useState<any>('');
  const [uploadLotsSuccess, setUploadLotsSuccess] = React.useState<any>('');
  const [uploadLotsResponse, setUploadLotsResponse] = React.useState<any>(false);
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const avatarRef = React.useRef<HTMLInputElement | null>(null);

  // Api call
  const { data: countriesList } = useCountriesQuery();
  const { data: salesCompanyList } = useSaleCompanyQuery();
  const { data: salesTypeList } = useSaleTypeQuery();
  const { data: salesStatusList } = useSaleStatusQuery();
  const downloadSalesTemplate = useDownloadSalesTemplateQuery({}, { skip: isDownloadTemplateClicked });

  // Handle drawer
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // Close modal
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  // Call edit sales
  const { data: salesData, error, isFetching, isLoading, isSuccess } = useSaleQuery(rowId, { skip: (!isEdit), refetchOnMountOrArgChange: true });
  const currentSale = salesData;

  // Sales form schema
  const NewFarmSchema = Yup.object().shape({
    salesName: Yup.string().required('Sale Name is required'),
    countryId: Yup.string().required('country is required'),
    salesCode: Yup.string().required('Sale Code is required'),
    salesTypeId: Yup.string().required('Sales Type is required'),
    salesCompanyId: Yup.string().required('Sales Company is required'),
    salesfileURL: Yup.string().required('Sales file URL is required'),
    salesfileURLSDX: Yup.string(),
    isHIP: Yup.boolean(),
    isOnlineSales: Yup.boolean(),
    isPublic: Yup.boolean(),
  });

  // Sales form default values
  const defaultValues = React.useMemo(
    () => ({
      salesName: currentSale?.salesName || '',
      countryId: currentSale?.countryId || '',
      salesCode: currentSale?.salesCode || '',
      salesCompanyId: currentSale?.salesCompanyId || '',
      salesTypeId: currentSale?.salesTypeId || '',
      statusId: currentSale?.statusId || '',
      salesfileURL: currentSale?.salesfileURL || '',
      salesfileURLSDX: currentSale?.salesfileURLSDX || '',
      isHIP: currentSale?.isHIP || false,
      isOnlineSales: currentSale?.isOnlineSales || false,
      isPublic: currentSale?.isPublic || false,
      startDate: currentSale?.startDate || null,
      endDate: currentSale?.endDate || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSale]
  );

  // under construction...
  useEffect(() => {
    if (downloadSalesTemplate.currentData && downloadSalesTemplate.isSuccess) {
      // setIsDownloadTemplateClicked(true)
    }
  }, [downloadSalesTemplate.isFetching])

  // Show on edit date value
  useEffect(() => {
    if (isEdit) {
      setCreateDateValue([currentSale?.startDate ? currentSale?.startDate : new Date(), currentSale?.endDate ? currentSale?.endDate : new Date()])
      if (currentSale.startDate && currentSale.endDate) {
        setConvertedCreatedRangeValue(`${dateHypenConvert(currentSale.startDate)} - ${dateHypenConvert(currentSale.endDate)}`)
      }
    }
  }, [currentSale])

  // under construction...
  useEffect(() => {
    if (salesLotFile !== undefined) {
      // console.log(salesLotFile, 'File added')
    };
  }, [salesLotFile])

  // under contruction...
  const handleDownloadTemplate = () => {
    setIsDownloadTemplateClicked(false);
  }

  // form element
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
    defaultValues,
  });

  // form parameters
  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  // console.log(watch(),'defaultValues')

  // Reset the form
  React.useEffect(() => {
    if (isEdit && currentSale) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentSale]);

  // Reset the form on close 
  React.useEffect(() => {
    if (open !== undefined) {
      if (!open) {
        reset(defaultValues);
        setConvertedCreatedDateValue([null, null]);
        setConvertedCreatedRangeValue('');
      }
    }
    if (openAddEditForm !== undefined) {
      if (!openAddEditForm) {
        reset(defaultValues);
        setConvertedCreatedDateValue([null, null]);
        setConvertedCreatedRangeValue('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openAddEditForm]);

  // Validate form
  let validateForm = () => {
    let formIsValid = true;
    let errors: any = {};

    if (!convertedCreatedDateValue[0] && !convertedCreatedDateValue[1]) {
      formIsValid = false;
      errors.dateRange = 'Date Range is Required';
    }
    setFormErrors(errors);
    return formIsValid;
  }

  // Submit form
  const onSubmit = async (data: FormValuesProps) => {

    if (!validateForm()) return

    try {
      const finalData = {
        ...data,
        startDate: dateHypenConvert(convertedCreatedDateValue[0]),
        endDate: dateHypenConvert(convertedCreatedDateValue[1]),
        countryId: parseInt(data.countryId),
        salesCompanyId: parseInt(data.salesCompanyId),
        salesTypeId: parseInt(data.salesTypeId),
        statusId: parseInt(data.statusId),
        ...(isEdit === false && { statusId: 4 }),
      }
      let res: any = isEdit ? await editSales({ ...finalData, id: rowId }) : await addSales(finalData);
      if (res.error) {
        setApiStatusMsg({ 'status': 422, 'message': res?.error?.data?.message });//res?.data?.message
        setApiStatus(true);
        // reset(defaultValues);
        // if (isEdit) {
        //   handleCloseModal()
        // } else {
        //   handleDrawerCloseRow()
        // }
      } else {
        setApiStatusMsg({ 'status': 201, 'message': res?.data?.message });
        setApiStatus(true);
        reset(defaultValues);
        if (isEdit) {
          handleCloseModal()
        } else {
          handleDrawerCloseRow()
        }
      }
      // reset();
    } catch (error) {
      console.error(error);
    }
  };

  const [openConfirmReportWrapper, setOpenConfirmReportWrapper] = useState(false);

  // Close Confirm report modal
  const handleCloseConfirmReportWrapper = () => {
    setOpenConfirmReportWrapper(false);
  };

  // Open Confirm report modal
  const handleOpenConfirmReportWrapper = () => {
    setOpenConfirmReportWrapper(true);
  };

  // Handle date
  const handleDueDate = (value: any) => {
    setCreateDateValue(value);
  };

  // Toggle source url field
  const handleOpenSourceDataURL = () => {
    setOpenSourceDataURL((prev: boolean) => !prev);
  }

  // navigate to open report link in different tab
  const handleOpenReportLink = () => {
    // navigate(PATH_DASHBOARD.horsedetails.addnew(selectedFarm.horseName, 'F'))
    window.open(currentSale?.salesfileURL, "_blank")
  }

  // Parse date
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse)
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, "0")}.${(parsedDate.getMonth() + 1).toString().padStart(2, "0")}.${parsedDate.getFullYear()}`
    return formattedDate;
  }

  // Change image
  const changeImage = () => avatarRef?.current?.click();

  return (
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          // overflow: 'scroll',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root':
        {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className='filter-section DrawerRightModal members-rightbar sales-rightbar'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            // overflow: "scroll",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        {/* Header contains title and close icon */}
        <DrawerHeader className='member-header'>
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
          <Box>
            <Typography variant="h3" pl={1}>Sales Details</Typography>
          </Box>
        </DrawerHeader>

        {/* Sales Add/Edit form */}
        <Box px={2} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box px={1} mt={0}>

              {/* SM PRO Report - Needs to Approval */}
              <Grid container spacing={3} mt={0} pt={0} className='RaceListModalBox'>

                <Grid item xs={12} md={12} mt={2} className='racelistgroup'>
                  <RHFTextField name="salesName" placeholder='Sale Name' className='edit-field' />
                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='edit-field'>
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',

                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left"
                        },
                        ...MenuProps
                      }}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      className="filter-slct"
                      error={(errors?.salesCompanyId && getValues('salesCompanyId') === "") ? true : false}
                      value={watch('salesCompanyId') === '' ? 'none' : getValues('salesCompanyId')}
                      onChange={(e: any) => setValue('salesCompanyId', e.target.value)}
                      defaultValue="none" name="salesCompanyId">
                      <MenuItem className="selectDropDownList" value="none" disabled><em>Company</em></MenuItem>
                      {salesCompanyList?.map((v: any) => {
                        return (
                          <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.salescompanyName}</MenuItem>
                        )
                      })}
                    </Select>
                  </Box>
                  <p className="error-text">{errors?.salesCompanyId?.message}</p>

                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <RHFTextField name="salesCode" placeholder='Code' disabled={isEdit} className='edit-field' />
                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='edit-field'>
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',

                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left"
                        },
                        ...MenuProps
                      }}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      error={(errors?.countryId && getValues('countryId') === "") ? true : false}
                      value={watch('countryId') === '' ? 'none' : getValues('countryId')}
                      onChange={(e: any) => setValue('countryId', e.target.value)}
                      className="filter-slct countryDropdown"
                      defaultValue="none" name="countryId">
                      <MenuItem className="selectDropDownList countryDropdownList" value="none" disabled><em>Country</em></MenuItem>
                      {countriesList?.map((v: any) => {
                        return (
                          <MenuItem className="selectDropDownList countryDropdownList" value={v.id} key={v.id}>{v.countryName}</MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                  <p className="error-text">{errors?.countryId?.message}</p>
                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='edit-field'>
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',

                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left"
                        },
                        ...MenuProps
                      }}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      className="filter-slct"
                      error={(errors?.salesTypeId && getValues('salesTypeId') === "") ? true : false}
                      value={watch('salesTypeId') === '' ? 'none' : getValues('salesTypeId')}
                      onChange={(e: any) => setValue('salesTypeId', e.target.value)}
                      defaultValue="none" name="salesTypeId">
                      <MenuItem className="selectDropDownList" value="none" disabled><em>Sale Type</em></MenuItem>
                      {salesTypeList?.map((v: any) => {
                        return (
                          <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.salesTypeName}</MenuItem>
                        )
                      })}
                    </Select>
                  </Box>
                  <p className="error-text">{errors?.salesTypeId?.message}</p>
                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='calender-wrapper'>
                    <Box className='edit-field'>
                      <CustomRangePicker
                        placeholderText="Sales Dates"
                        convertedDateRangeValue={convertedCreatedRangeValue}
                        setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                        convertedDateValue={convertedCreatedDateValue}
                        setConvertedYobDateValue={setConvertedCreatedDateValue}
                      />
                      {<p className="error-text">{formError?.dateRange}</p>}
                      {/* <DatePicker value={value} placeholder='Sales Dates' handleChange={handleChange} /> */}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} my={1} className='racelistgroup'>
                  <Box className="RFswitch">
                    <Box>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Use Hip
                      </Typography>
                    </Box>
                    <Box>
                      {/* {!isEdit &&
                        <RHFSwitch
                          name="isHIP"
                          value={isEdit && getValues('isHIP')}
                          defaultValue="false"
                          label={''}
                        />
                      } */}
                      {/* <FormControlLabel
                        control={<IOSSwitch checked={getValues('isHIP')}/>}
                        label={''}
                        sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                        {...register(`isHIP`)}
                        labelPlacement="start"
                      /> */}
                      <IOSSwitch checked={watch('isHIP')}
                        onChange={(e: any) => setValue('isHIP', e.target.checked)} />
                    </Box>
                  </Box>
                  <Box className="RFswitch">
                    <Box>
                      <Typography variant="h4">
                        Online Sale
                      </Typography>
                    </Box>
                    <Box>
                      {/* <RHFSwitch
                        name="isOnlineSales"
                        value={isEdit && getValues('isOnlineSales')}
                        label={''}
                        defaultValue="false"

                      /> */}
                      <IOSSwitch checked={watch('isOnlineSales')}
                        onChange={(e: any) => setValue('isOnlineSales', e.target.checked)} />
                    </Box>
                  </Box>
                </Grid>

                {isEdit && <Grid item xs={12} md={12} mb={2} className='racelistgroup'>
                  <Box className='edit-field' sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ display: 'flex', flexDirection: 'row', alignItems: ' center' }}>Source Data URL
                      <i style={{ color: '#007142', fontSize: '22px', marginLeft: '10px', position: 'relative', top: '0px' }} className='icon-Link-green' />
                      <Button sx={{ marginLeft: '23px' }} className='bold-link' type='button' onClick={handleOpenSourceDataURL}>Edit</Button>
                    </Typography>
                  </Box>
                </Grid>}

                {isEdit && <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='edit-field'>
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',

                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left"
                        },
                        ...MenuProps
                      }}
                      disabled={true}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      className="filter-slct"
                      value={watch('statusId') === '' ? 'none' : getValues('statusId')}
                      onChange={(e: any) => setValue('statusId', e.target.value)}
                      defaultValue="none" name="statusId">
                      <MenuItem className="selectDropDownList" value="none" disabled><em>Sale Status</em></MenuItem>
                      {salesStatusList?.map((v: any) => {
                        return (
                          <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.status}</MenuItem>
                        )
                      })}
                    </Select>
                  </Box>
                  <p className="error-text">{errors?.statusId?.message}</p>
                </Grid>}

                {isEdit && <Grid item xs={12} md={12} my={1} className='racelistgroup'>
                  <Box className="RFswitch">
                    <Box>
                      <Typography variant="h4">
                        Use Public
                      </Typography>
                    </Box>
                    <Box>
                      <RHFSwitch
                        name="isPublic"
                        value={isEdit && getValues('isPublic')}
                        disabled={currentSale?.statusId !== 5}
                        label={''}
                        defaultValue="false"
                      />
                    </Box>
                  </Box>
                </Grid>}

                {isEdit && (currentSale?.statusId === 1 || currentSale?.statusId === 5) && <Grid item xs={12} md={12} mb={2} className='racelistgroup'>
                  <Box className='edit-field' sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ display: 'flex', flexDirection: 'row', alignItems: ' center' }}>View Sales Report
                      <i style={{ color: '#007142', fontSize: '22px', marginLeft: '10px', position: 'relative', top: '0px' }} onClick={handleOpenReportLink} className='icon-Link-green' />
                      {/* <Button sx={{ marginLeft: '23px' }} className='bold-link' type='button' ></Button> */}
                    </Typography>
                  </Box>
                  {isEdit && <Box className='sales-filter'>
                    <Typography variant='h5'>Created on {parseDate(currentSale?.createdOn)}</Typography>
                  </Box>
                  }
                </Grid>}

                <Grid item xs={12} md={12} mt={0} className={`racelistgroup ${openSourceDataURL ? '' : isEdit === false ? '' : 'hide'}`}>
                  <RHFTextField name="salesfileURL" placeholder='Source Data URL' className='edit-field' />
                </Grid>

                <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>

                  <Stack sx={{ mt: 0 }} className='DrawerBtnWrapper'>
                    <Grid container spacing={4} className='DrawerBtnBottom'>
                      <Grid item xs={12} md={12} sx={{ paddingTop: '18px !important' }}>
                        <LoadingButton fullWidth className='search-btn' type="submit" variant="contained" loading={isSubmitting}>
                          {!isEdit ? 'Save' : 'Save'}
                        </LoadingButton>

                      </Grid>
                      {currentSale?.statusId === 4 && <Grid item xs={12} md={12} sx={{ paddingTop: '12px !important' }}>
                        <LoadingButton fullWidth type='button' className='search-btn' loading={uploadLotsResponse?.isLoading} disabled={!isEdit} onClick={changeImage}>Upload Lots</LoadingButton>
                        {uploadLotsError && <p>{uploadLotsError}</p>}
                        {uploadLotsSuccess && <p>{uploadLotsSuccess?.message}</p>}
                      </Grid>}
                      {isEdit && currentSale?.statusId !== 4 && <Grid item xs={12} md={12} sx={{ paddingTop: '12px !important' }}>
                        <Button fullWidth type='button' className='search-btn' onClick={() => navigate(`/dashboard/sales/viewlots/${rowId}`)}>View Lots</Button>
                      </Grid>}
                      {isEdit && <Grid item xs={12} md={12} sx={{ paddingTop: '12px !important' }}>
                        <Button fullWidth type='button' className='search-btn' disabled={currentSale?.statusId !== 1} onClick={handleOpenConfirmReportWrapper}>Run Report</Button>
                      </Grid>}
                      <Grid item xs={12} md={12} sx={{ paddingTop: '12px !important' }}>
                        <a href="https://dev-smp-bucket.s3.ap-southeast-2.amazonaws.com/sales/lot-template.csv" target='_blank' download>
                          <Button fullWidth type='button' className='add-btn green' >Download Template</Button>
                        </a>
                      </Grid>
                    </Grid>
                  </Stack>

                </Grid>
              </Grid>
            </Box>
          </FormProvider>
          <UploadCSVFile ref={avatarRef} setSalesLotFile={setSalesLotFile} currentSale={currentSale} setUploadLotsError={setUploadLotsError} setUploadLotsSuccess={setUploadLotsSuccess} setUploadLotsResponse={setUploadLotsResponse} />
        </Box>
        {/* End Sales Add/Edit form */}

        {/* Confirm report modal  */}
        <ConfirmReportWrapperDialog
          title=""
          rowId={rowId}
          open={openConfirmReportWrapper}
          close={handleCloseConfirmReportWrapper}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />

      </Scrollbar>
    </Drawer>
  );
}

export const UploadCSVFile = React.forwardRef<HTMLInputElement | null, UploadCsvProps>(({ currentSale, setSalesLotFile, setUploadLotsError, setUploadLotsSuccess, setUploadLotsResponse }, ref) => {
  const [uploadLots, response] = useUploadLotsMutation();
  const formData = new FormData();

  useEffect(() => {
    if (response.isSuccess) {
      setUploadLotsSuccess(response.data);
      setUploadLotsError('')
    }
    if (response.isError) {
      let res: any = response;
      // setUploadLotsError(response);
      setUploadLotsSuccess('');
      toast.error(res?.error?.data?.message);
    }
    setUploadLotsResponse(response);
  }, [response])

  const handleImageChange = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    var file = e.target.files[0];
    // console.log(file, 'oInput file')

    if (Validate(file)) {
      setSalesLotFile(file);
      setUploadLotsError('');
      formData.append('file', file);
      formData.append('name', file?.name);
      uploadLots([currentSale?.id, formData])
    }
  }

  function Validate(file: any) {
    var _validFileExtensions = ["csv"];
    var arrInputs = document.getElementById("selectLots");
    var oInput: any = arrInputs;
    if (file) {
      // if (oInput?.type == "file") {
      var sFileName = oInput.value;
      let fileType = file?.name?.split('.')?.pop();
      // console.log(sFileName, 'oInput')
      // if (sFileName.length > 0) {
      var blnValid = false;
      for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (fileType == sCurExtension) {
          blnValid = true;
          break;
        }
      }

      if (!blnValid) {
        toast.error("Allowed extensions are: " + _validFileExtensions.join(", "));
        // alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
        return false;
      }
      // }
      // }
    }
    return true;
  }

  return (
    <Box>
      <input
        type='file'
        className='hide'
        id={'selectLots'}
        ref={ref}
        onChange={handleImageChange}
        onClick={(event: any) => {
          event.target.value = null
        }}
        accept=".csv"
      />
    </Box>
  )
})