import React, { useEffect, useState } from "react";
import { Box, InputLabel, MenuItem, Select, Button, Stack, TextField, StyledEngineProvider } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { useGetPageSettingQuery, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
import { useLocation } from "react-router";
import {MenuProps} from 'src/constants/MenuProps';
import {SettingConstants} from 'src/constants/SettingConstants';
import { CircularSpinner } from "../CircularSpinner";

export default function StallionsSettings({handleClose}:{handleClose: any}) {
    const pageId = process.env.REACT_APP_STALLION_PAGE_ID;  
    const [currentPage, setCurrentPage] = useState<string[]>([]);
    const location = useLocation();
    useEffect(() => {
        if (location) {
            const currentPage1 = location.pathname.split("/");
            setCurrentPage(currentPage1);
        }
    }, [location])
    
    const [state, setStateValue] = useState(
    {
        displayColname: "",
        expiredClassification: "",
        // gracePeriod: "",
    });

    // Patch settings api call
    const [updatePageSetting] = useUpdateSettingMutation();

    // Get settings api call
    const data:any = useGetPageSettingQuery(pageId);   
    const settingsData: any = (data?.isSuccess) ? data?.data : {};
    const displayColOptionList = SettingConstants.DefaultStallionColumns;
    
    // Setting form validation
    const NewFarmSchema = Yup.object().shape({
        displayColname: Yup.string().required('Display column is required'),
        expiredClassification: Yup.number().required('Expired classification is required'),
        // gracePeriod: Yup.number().required('Grace period is required'),
    });
   
    // Set the default value while loading the modal
    const defaultValues = React.useMemo(() => (
      {
          displayColname: settingsData?.settingsResponse?.defaultDisplay || '',
          expiredClassification: settingsData?.settingsResponse?.recentlyExpiredClassification || 0,
          // gracePeriod: settingsData?.settingsResponse?.promotedGracePeriod || 0,
      }
    ), [settingsData])

    // Form element
    const methods = useForm({
        resolver: yupResolver(NewFarmSchema),
        defaultValues,
    });
    
    // Form parameters
    const {
        reset,
        watch,
        control,
        setValue,
        getValues,
        handleSubmit,
        register,
        formState: { isSubmitting, errors },
    } = methods;

    React.useEffect(() => {
        if (settingsData) {
          setStateValue({
            ...state,
            displayColname: settingsData?.settingsResponse?.defaultDisplay || '',
            expiredClassification: settingsData?.settingsResponse?.recentlyExpiredClassification || 0,
            // gracePeriod: settingsData?.settingsResponse?.promotedGracePeriod || 0,
          })
        }    
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [settingsData]);

      // update state variable to capture settings value
      const handleChangeField = (type: any, targetValue: any) => {
        setStateValue({
          ...state,
          [type]: targetValue
        })
      }

    // Validation
    const [customErrors, setErrors] = React.useState<any>({});
    let validateForm = () => {
    /*eslint-disable */
    let fields = state;  
    let errors = {};
    let formIsValid = true;
    
    //@ts-ignore
    if (!fields["displayColname"]) {
      formIsValid = false;  //@ts-ignore
      errors["displayColname"] = `Default display column is required`;
    }
    if (!fields["expiredClassification"]) {
      formIsValid = false;  //@ts-ignore
      errors["expiredClassification"] = `Recently expired classification is required`;
    }    
    // if (!fields["gracePeriod"]) {
    //   formIsValid = false;  //@ts-ignore
    //   errors["gracePeriod"] = `Promoted grace period is required`;
    // }
    setErrors(errors)
    return formIsValid
    /*eslint-enable */
  }

  // Reset state variable
  const resetData = () => {
    setStateValue({
        displayColname: "",
        expiredClassification: "",
        // gracePeriod: "",
    })
    setErrors({})
  }

  // remove validation
  useEffect(() => {
    let temp = { ...errors }
    if (state.displayColname) {
      delete temp.displayColname;
    }
    if (state.expiredClassification) {
      delete temp.expiredClassification;
    }
    // if (state.gracePeriod) {
    //   delete temp.gracePeriod;
    // }
    setErrors(temp)
  }, [state]); 
  
  // Submit form
  const onSubmit = async(data: any) => {    
    const updateData = state;    
    const finalData = { 
      moduleId: Number(pageId),
        payload: {
            defaultDisplay: updateData.displayColname,
            recentlyExpiredClassification: updateData.expiredClassification,
            // promotedGracePeriod: updateData.gracePeriod
        }
      }; 
    await updatePageSetting(finalData);
    handleClose();
};

    return (  
        <StyledEngineProvider injectFirst>      
        <Box>
        {(data?.isFetching) ?
            <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}><CircularSpinner /></Box> :
            <>
            {/* Stallion Settings Form */}   
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box className='FormGroup'>
                    <InputLabel>Default Display Column</InputLabel>
                    <Box className='edit-field'>
                    <Select
                        MenuProps={MenuProps}
                        placeholder="Select Display Column"
                        {...register("displayColname")}
                        name="displayColname"
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        defaultValue={defaultValues.displayColname !== '' ? defaultValues.displayColname : "''"}
                        onChange={(e) => handleChangeField("displayColname", e.target.value)}
                        className="filter-slct">
                        <MenuItem className="selectDropDownList" value="''" disabled selected><em>Name</em></MenuItem>
                        {displayColOptionList?.map((v: any, i: number) => {
                            return (
                                <MenuItem className="selectDropDownList" key={v.id} value={v.value}>{v.name}</MenuItem>
                            )
                        })}
                    </Select>
                    {errors.displayColname && <div className="errorMsg">{errors.displayColname.message}</div>}
                </Box>
                </Box>

                <Box className='FormGroup'>
                    <InputLabel>Recently Expired Classification</InputLabel>
                    <Stack className='half-box-settings'>
                        <TextField type="number" placeholder='Enter days' className='edit-field' value={state.expiredClassification} onChange={(e) => handleChangeField("expiredClassification", e.target.value)}/>
                        <span className='days-text'>days</span>
                    </Stack>
                    {errors.expiredClassification && <div className="errorMsg">{errors.expiredClassification.message}</div>}
                </Box>

                {/* <Box className='FormGroup'>
                    <InputLabel>Promoted Grace Period</InputLabel>
                    <Stack className='half-box-settings'>
                        <TextField type="number" placeholder='Enter days' className='edit-field' value={state.gracePeriod} onChange={(e) => handleChangeField("gracePeriod", e.target.value)}/>
                        <span className='days-text'>days</span>
                    </Stack>
                    {errors.gracePeriod && <div className="errorMsg">{errors.gracePeriod.message}</div>}
                </Box> */}

                <Box className='FormGroup Save-Btn-settings'>
                <Button type='submit' className="search-btn" fullWidth>Save</Button>
                </Box>
                </form>
                {/* End Stallion Settings Form */}  
                </>           
            }
        </Box>
        </StyledEngineProvider>
    )
}