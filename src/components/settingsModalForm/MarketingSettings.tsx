import { Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider } from "@mui/material";
import {MenuProps} from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {SettingConstants} from 'src/constants/SettingConstants';
import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { useLocation } from "react-router";
import { useForm } from 'react-hook-form';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useGetPageSettingQuery, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
import { CircularSpinner } from "../CircularSpinner";

export default function MarketingSettings({handleClose}:{handleClose: any}) {
    const pageId = process.env.REACT_APP_MARKETING_PAGE_ID;

    // Get all country api call
    const { data: countriesList } = useCountriesQuery();

    // Get all currency api call
    const { data: currencyList } = useCurrenciesQuery();

    // Patch call for marketing setting api call
    const [updatePageSetting] = useUpdateSettingMutation();

    // Get marketing page setting api call
    const data:any = useGetPageSettingQuery(pageId);   
    const settingsData: any = (data?.isSuccess) ? data?.data : {};

    const displayColOptionList = SettingConstants.DefaultMemberColumns;
    const [currentPage, setCurrentPage] = useState<string[]>([]);
    const location = useLocation();
    useEffect(() => {
        if (location) {
            const currentPage1 = location.pathname.split("/");
            setCurrentPage(currentPage1);
        }
    }, [location])

    let params = {
        id: currentPage[2]
    }

    // Validation
    const NewFarmSchema = Yup.object().shape({
        countryId: Yup.string().required('Country is required'),
        currencyId: Yup.string().required('Official currency is required'),
        smCurrencyId: Yup.string().required('SM CurrencyId is required'),
    });

    // Set the default values
    const defaultValues = React.useMemo(() => (
        {
            countryId: settingsData?.settingsResponse?.country,
            currencyId: settingsData?.settingsResponse?.currencyId,
            smCurrencyId: settingsData?.settingsResponse?.smCurrencyId
        }
    ), [settingsData])

    const methods = useForm({
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
        register,
        formState: { isSubmitting, errors },
    } = methods;

    // On save button, caputure the post pageload
    const onSubmit = async(data: any) => {        
        const finalData = { 
            moduleId: Number(pageId),
            payload: {
                country: data.countryId,
                currencyId: data.currencyId,
                smCurrencyId: data.smCurrencyId
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
            <form onSubmit={handleSubmit(onSubmit)}>
            <Box className='FormGroup'>
                <InputLabel>Country</InputLabel>
                <Box className='edit-field'>
                    <Select
                        MenuProps={MenuProps}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        {...register("countryId")}
                        name="countryId"
                        defaultValue={defaultValues.countryId !== '' ? defaultValues.countryId : "none"}
                        className='filter-slct'>
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Select Country</em></MenuItem>
                        {countriesList?.map(({ id, countryName }) => {
                            return (
                                <MenuItem className="selectDropDownList countryDropdownList" value={countryName} key={id}>
                                {countryName}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    {errors.countryId && <div className="errorMsg">{errors.countryId.message}</div>}
                </Box>
            </Box>
            <Box className='FormGroup'>
                <InputLabel>Official Currency</InputLabel>
                <Box className='edit-field'>
                    <Select
                        MenuProps={MenuProps}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        {...register("currencyId")}
                        name="currencyId"
                        defaultValue={defaultValues.currencyId !== '' ? defaultValues.currencyId : "none"}
                        className='filter-slct'>
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Select Currency</em></MenuItem>
                        {currencyList?.map(({ currencyCode, currencyName }) => {
                            return (
                                <MenuItem className="selectDropDownList" value={currencyCode} key={currencyCode}>
                                {currencyName}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    {errors.currencyId && <div className="errorMsg">{errors.currencyId.message}</div>}
                </Box>
            </Box>
            <Box className='FormGroup'>
                <InputLabel>SM Display Currency</InputLabel>
                <Box className='edit-field'>
                    <Select
                        MenuProps={MenuProps}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        {...register("smCurrencyId")}
                        name="smCurrencyId"
                        defaultValue={defaultValues.smCurrencyId !== '' ? defaultValues.smCurrencyId : "none"}
                        className='filter-slct'>
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Select Currency</em></MenuItem>
                        {currencyList?.map(({ currencyCode, currencyName }) => {
                            return (
                                <MenuItem className="selectDropDownList" value={currencyCode} key={currencyCode}>
                                {currencyName}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    {errors.smCurrencyId && <div className="errorMsg">{errors.smCurrencyId.message}</div>}
                </Box>
            </Box>

            <Box pt={1} className='FormGroup Save-Btn-settings'>
                <Button type='submit' className="search-btn" fullWidth>Save</Button>
            </Box>
            </form>
        </Box>
        </>          
            }            
        </StyledEngineProvider>
    )
}