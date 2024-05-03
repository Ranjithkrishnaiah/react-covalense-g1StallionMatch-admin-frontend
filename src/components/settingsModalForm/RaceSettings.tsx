import { Stack, Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider, Checkbox } from "@mui/material";
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { SettingConstants } from 'src/constants/SettingConstants';
import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useRaceStakeCategoryQuery, useRaceStakeQuery, useRaceTypeQuery } from 'src/redux/splitEndpoints/raceSplit';
import { toPascalCase, formatDate } from 'src/utils/customFunctions';
import { useGetPageSettingQuery, useUpdateRaceSettingMutation, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
import { CircularSpinner } from "../CircularSpinner";
import CustomDatePicker from 'src/components/customDatePicker/CustomDatePicker';
import { useCountriesQuery } from "src/redux/splitEndpoints/countriesSplit";
import { ListItemText } from "@mui/material";
import { Images } from "src/assets/images";

export default function RaceSettings({ handleClose }: { handleClose: any }) {
    const pageId = process.env.REACT_APP_RACE_PAGE_ID;

    const displayColOptionList = SettingConstants.DefaultRaceColumns;
    const { data: raceStakeList } = useRaceStakeCategoryQuery();
    const { data: raceTypeList } = useRaceTypeQuery();
    const [updatePageSetting] = useUpdateRaceSettingMutation();
    const { data: countriesList } = useCountriesQuery();
    const { data: pageSettingsData, isSuccess, isFetching } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });
    const settingsData: any = (isSuccess) ? pageSettingsData : {};
    // Setting state
    const [state, setStateValue] = useState<any>({
        // countryId: "",
        defaultDisplay: "",
        stakeId: "",
        raceDate: null,
    })

    // Form schema
    const NewFarmSchema = Yup.object().shape({
        defaultDisplay: Yup.string().required('Display column is required'),
        // countryId: Yup.string().required('Country is required'),
        stakeId: Yup.string().required('Stake level is required'),
    });

    // Set default value
    const defaultValues = React.useMemo(
        () => ({
            defaultDisplay: settingsData?.settingsResponse?.defaultDisplay || '',
            stakeId: settingsData?.settingsResponse?.minimumStakesLevelIncluded || '',
            raceDate: settingsData?.settingsResponse?.raceDate || null,
            eligibleRaceCountries: settingsData?.settingsResponse?.eligibleRaceCountries || [],
            eligibleRaceTypes: settingsData?.settingsResponse?.eligibleRaceTypes || [],
        }), [isFetching]);

    // Form element
    const methods = useForm({
        resolver: yupResolver(NewFarmSchema),
        defaultValues,
    });

    useEffect(() => {
        if (settingsData) {
            setValue('defaultDisplay', settingsData?.settingsResponse?.defaultDisplay);
            setValue('stakeId', settingsData?.settingsResponse?.minimumStakesLevelIncluded);
            setValue('eligibleRaceCountries', settingsData?.settingsResponse?.eligibleRaceCountries);
            setValue('eligibleRaceTypes', settingsData?.settingsResponse?.eligibleRaceTypes);
        }
    }, [settingsData]);

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

    // console.log(defaultValues, 'watch')

    // Submit form
    const onSubmit = async (data: any) => {
        const updateData = state;
        const finalData = {
            payload: {
                defaultDisplay: data?.defaultDisplay,
                eligibleRaceStartDate: updateData.raceDate,
                minimumStakesLevelIncluded: data.stakeId,
                eligibleRaceCountries: data.eligibleRaceCountries,
                eligibleRaceTypes: data.eligibleRaceTypes,
                settingId: settingsData?.pageSettingsUuid
            }
        };
        await updatePageSetting(finalData.payload);
        handleClose();
    };

    // Set form data on edit
    React.useEffect(() => {
        if (settingsData) {
            let raceDate = (settingsData?.settingsResponse?.eligibleRaceStartDate) ? (settingsData?.settingsResponse?.eligibleRaceStartDate) : null
            setStateValue({
                ...state,
                displayColname: settingsData?.settingsResponse?.defaultDisplay || '',
                stakeId: settingsData?.settingsResponse?.minimumStakesLevelIncluded || 0,
                raceDate: raceDate,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsData]);

    // Handle form state
    const handleChangeField = (type: any, targetValue: any) => {
        setStateValue({
            ...state,
            [type]: targetValue
        });
    };

    const getCountryListByComma = (selected: any) => {
        let arr: any = [];
        countriesList?.forEach((v: any) => {
            selected?.forEach((sel: any) => {
                if (v?.id === sel) {
                    arr.push(v?.countryName);
                }
            })
        })
        return arr?.join(', ');
    }

    const getRaceTypeListByComma = (selected: any) => {
        let arr: any = [];
        raceTypeList?.forEach((v: any) => {
            selected?.forEach((sel: any) => {
                if (v?.id === sel) {
                    arr.push(v?.displayName);
                }
            })
        })
        return arr?.join(', ');
    }

    return (
        <StyledEngineProvider injectFirst>
            {(isFetching) ?
                <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}><CircularSpinner /></Box> :
                <>
                    <Box>
                        {/* Race Settings Form */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box className='FormGroup'>
                                <InputLabel>Default Display Column</InputLabel>
                                <Box className='edit-field'>
                                    <Select
                                        MenuProps={MenuProps}
                                        IconComponent={KeyboardArrowDownRoundedIcon}
                                        {...register("defaultDisplay")}
                                        name="defaultDisplay"
                                        defaultValue={(defaultValues?.defaultDisplay === '') ? '' : defaultValues?.defaultDisplay}
                                        className='filter-slct'>
                                        {/* <MenuItem className="selectDropDownList" value="''" disabled><em>Name</em></MenuItem> */}
                                        {displayColOptionList?.map((v: any, i: number) => {
                                            return (
                                                <MenuItem className="selectDropDownList" key={v.id} value={v.value}>{v.name}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                    {errors.defaultDisplay && <div className="errorMsg">{errors.defaultDisplay.message}</div>}
                                </Box>
                            </Box>

                            <Box className='FormGroup'>
                                <InputLabel>Eligible Race Countries</InputLabel>
                                <Stack>
                                    <Box className='edit-field'>
                                        <Select
                                            MenuProps={MenuProps}
                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                            {...register("eligibleRaceCountries")}
                                            name="eligibleRaceCountries"
                                            multiple
                                            displayEmpty
                                            renderValue={(selected: any) => {
                                                if (selected?.length === 0) {
                                                    return <em>Select Countries</em>;
                                                }
                                                return <em>View Selected Countries</em>;

                                            }}
                                            defaultValue={(defaultValues?.eligibleRaceCountries?.length === 0) ? [] : defaultValues?.eligibleRaceCountries}
                                            className='filter-slct'>
                                            <MenuItem className="selectDropDownList reportSelectCountry" value="''" disabled><em>Select Countries</em></MenuItem>
                                            {countriesList?.map((v: any, i: number) => {
                                                return (
                                                    <MenuItem className="selectDropDownList reportSelectCountry settingDropDown" key={v.id} value={v.id}>
                                                        {/* {(v.countryName)} */}
                                                        <ListItemText primary={v.countryName} />
                                                        <Checkbox
                                                            checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                                            checked={watch('eligibleRaceCountries')?.indexOf(v.id) > -1}
                                                            disableRipple
                                                        />
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                        {errors.eligibleRaceCountries && <div className="errorMsg">{errors.eligibleRaceCountries.message}</div>}
                                    </Box>
                                </Stack>
                            </Box>

                            <Box className='FormGroup'>
                                <InputLabel>Eligible Race Type</InputLabel>
                                <Stack>
                                    <Box className='edit-field'>
                                        <Select
                                            MenuProps={MenuProps}
                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                            {...register("eligibleRaceTypes")}
                                            name="eligibleRaceTypes"
                                            multiple
                                            displayEmpty
                                            renderValue={(selected: any) => {
                                                if (selected?.length === 0) {
                                                    return <em>Select Race Type</em>;
                                                }
                                                return <em>View Selected Race Type</em>;
                                                // return getRaceTypeListByComma(selected);

                                            }}
                                            defaultValue={(defaultValues?.eligibleRaceTypes?.length === 0) ? [] : defaultValues?.eligibleRaceTypes}
                                            className='filter-slct'>
                                            {/* <MenuItem className="selectDropDownList" value="''" disabled><em>Select Race Type</em></MenuItem> */}
                                            {raceTypeList?.map((v: any, i: number) => {
                                                return (
                                                    <MenuItem className="selectDropDownList  reportSelectCountry settingDropDown" key={v.id} value={v.id}>
                                                        <ListItemText primary={v.displayName} />
                                                        <Checkbox
                                                            checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                                            checked={watch('eligibleRaceTypes')?.indexOf(v.id) > -1}
                                                            disableRipple
                                                        />
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                        {errors.eligibleRaceTypes && <div className="errorMsg">{errors.eligibleRaceTypes.message}</div>}
                                    </Box>
                                </Stack>
                            </Box>

                            <Box className='FormGroup'>
                                <InputLabel>Eligible Race Start Date</InputLabel>
                                <CustomDatePicker
                                    placeholderText='Start Date'
                                    value={state?.raceDate ? state?.raceDate : ''}
                                    handleChange={(newValue: any) => { handleChangeField("raceDate", newValue) }}
                                />
                                {errors.raceDate && <div className="errorMsg">{errors.raceDate.message}</div>}
                            </Box>

                            <Box className='FormGroup'>
                                <InputLabel>Minimum Stakes Levels included</InputLabel>
                                <Stack>
                                    <Box className='edit-field'>
                                        <Select
                                            MenuProps={MenuProps}
                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                            {...register("stakeId")}
                                            name="stakeId"
                                            defaultValue={(defaultValues?.stakeId === '') ? '' : defaultValues?.stakeId}
                                            className='filter-slct'>
                                            <MenuItem className="selectDropDownList" value="''" disabled><em>Select Stakes Level</em></MenuItem>
                                            {raceStakeList?.map((v: any, i: number) => {
                                                return (
                                                    <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                        {errors.stakeId && <div className="errorMsg">{errors.stakeId.message}</div>}
                                    </Box>
                                </Stack>
                            </Box>

                            <Box className='FormGroup Save-Btn-settings' pt={2}>
                                <Button type='submit' className="search-btn" fullWidth>Save</Button>
                            </Box>
                        </form>
                        {/* End Race Settings Form */}
                    </Box>
                </>
            }
        </StyledEngineProvider>
    )
}