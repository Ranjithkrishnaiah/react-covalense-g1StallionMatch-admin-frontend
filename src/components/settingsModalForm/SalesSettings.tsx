import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
//form
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
//mui
import { Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
//hook
import useSettings from "src/hooks/useSettings";
// api and component
import { useGetPageSettingQuery, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
import { MenuProps } from 'src/constants/MenuProps';
import { SettingConstants } from 'src/constants/SettingConstants';
import { CircularSpinner } from "../CircularSpinner";

export default function SalesSettings({ handleClose }: { handleClose: any }) {
    const pageId = process.env.REACT_APP_SALES_PAGE_ID;
    const { setSalesSort } = useSettings();
    const [currentPage, setCurrentPage] = useState<string[]>([]);
    const location = useLocation();

    // Get current page path
    useEffect(() => {
        if (location) {
            const currentPage1 = location.pathname.split("/");
            setCurrentPage(currentPage1);
        }
    }, [location])

    // Api calls
    const [updatePageSetting] = useUpdateSettingMutation();
    const data: any = useGetPageSettingQuery(pageId);
    const settingsData: any = (data?.isSuccess) ? data?.data : {};
    const displayColOptionList = SettingConstants.DefaultSaleColumns;

    // Form schema
    const NewFarmSchema = Yup.object().shape({
        displayColname: Yup.string().required('Display column is required'),
    });

    // Form default value
    const defaultValues = React.useMemo(() => (
        {
            displayColname: settingsData?.settingsResponse?.defaultDisplay
        }
    ), [settingsData])

    // form element
    const methods = useForm({
        resolver: yupResolver(NewFarmSchema),
        defaultValues,
    });

    // form parameters
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

    // Submit settings
    const onSubmit = async (data: any) => {
        const finalData = {
            moduleId: 12,
            payload: {
                defaultDisplay: data.displayColname,
            }
        };
        localStorage.setItem("salesSort", data.displayColname);
        setSalesSort(data.displayColname)
        await updatePageSetting(finalData);
        handleClose();
    };

    return (
        <StyledEngineProvider injectFirst>
            {(data?.isFetching) ?
                <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}><CircularSpinner /></Box> :
                <>
                    <Box>
                        {/* Setting form */}
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
                        {/* End Setting form */}
                    </Box>
                </>
            }
        </StyledEngineProvider>
    )
}