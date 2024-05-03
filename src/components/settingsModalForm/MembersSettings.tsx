import { Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider } from "@mui/material";
import {MenuProps} from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {SettingConstants} from 'src/constants/SettingConstants';
import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { useLocation } from "react-router";
import { useForm } from 'react-hook-form';
import { useGetPageSettingQuery, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
import { CircularSpinner } from "../CircularSpinner";

export default function MembersSettings({handleClose}:{handleClose: any}) {  
    const pageId = process.env.REACT_APP_MEMBER_PAGE_ID;  
    const [currentPage, setCurrentPage] = useState<string[]>([]);
    const location = useLocation();
    useEffect(() => {
        if (location) {
            const currentPage1 = location.pathname.split("/");
            setCurrentPage(currentPage1);
        }
    }, [location])

    // Patch settings api call
    const [updatePageSetting] = useUpdateSettingMutation();

    // Get settings api call
    const data:any = useGetPageSettingQuery(pageId);   
    const settingsData: any = (data?.isSuccess) ? data?.data : {};
    const displayColOptionList = SettingConstants.DefaultMemberColumns;    

    // Setting form validation
    const NewFarmSchema = Yup.object().shape({
        displayColname: Yup.string().required('Display column is required'),
    });    

    // Set the default value while loading the modal
    const defaultValues = React.useMemo(() => (
    {
        displayColname: settingsData?.settingsResponse?.defaultDisplay
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

    // Submit form
    const onSubmit = async(data: any) => {
        const finalData = { 
            moduleId: Number(pageId),
            payload: {
                defaultDisplay: data.displayColname,
            }
          }; 
        await updatePageSetting(finalData);
        handleClose();
    };

    return (
        <StyledEngineProvider injectFirst>
        {(data?.isFetching) ?
            <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}><CircularSpinner /></Box> :
            <>
            <Box>
            {/* Member Settings Form */}    
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
            <Box className='FormGroup Save-Btn-settings'>
                <Button type='submit' className="search-btn" fullWidth>Save</Button>
            </Box>
            </form>  
            {/* End Member Settings Form */}           
            </Box> 
            </>          
            }            
        </StyledEngineProvider>
    )
}