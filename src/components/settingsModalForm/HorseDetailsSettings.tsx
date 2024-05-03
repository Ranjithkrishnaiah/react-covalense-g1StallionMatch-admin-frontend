import { Box, InputLabel, MenuItem, Select, Button, Stack, ListItemText } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { MenuProps } from '../../constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DatePicker from 'src/components/DatePicker';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useHorseTypesQuery } from "src/redux/splitEndpoints/horseTypesSplit";
import { Checkbox } from "@mui/material";
import axios from "axios";
import { api } from "src/api/apiPaths";
import { setHorseColumnData } from "src/redux/slices/settings";
import { setHorseGenerationData } from "src/redux/slices/settings";
import { setHorseSourceData } from "src/redux/slices/settings";
import { setHorseVerifiedStatusData } from "src/redux/slices/settings";
import { setHorseBreedStatusData } from "src/redux/slices/settings";
import { CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { setFarmFilterSettings } from "src/redux/slices/settings";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { dateHypenConvert } from "src/utils/customFunctions";
import { useGetPageSettingQuery, useUpdateHorseSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Images } from "src/assets/images";
export default function HorseDetailsSettings({ handleClose }: { handleClose: any }) {
    const pageId = process.env.REACT_APP_HORSE_PAGE_ID;
    const { data: horseTypeList } = useHorseTypesQuery();

    // const { 
    //     horseColumnData, 
    //     horseGenerationData,
    //     horseSourceData,
    //     horseVerifiedStatusData,
    //     horseBreedStatusData
    // } = useSelector(user => user.filterSettings)

    const horseColumnData = [
        {
            value: 'horseName',
            numeric: false,
            disablePadding: true,
            name: 'Horse',
        },
        {
            value: 'sex',
            numeric: false,
            disablePadding: true,
            name: 'Sex',
        },
        {
            value: 'yob',
            numeric: true,
            disablePadding: true,
            name: 'YOB',
        },
        {
            value: 'countryName',
            numeric: false,
            disablePadding: true,
            name: 'Country',
        },
        {
            value: 'breeding',
            numeric: false,
            disablePadding: true,
            name: 'Breeding',
        },
        {
            value: 'createdOn',
            numeric: false,
            disablePadding: true,
            name: 'Created',
        },
        {
            value: 'runner',
            numeric: false,
            disablePadding: true,
            name: 'Runner',
        },
        {
            value: 'stakes',
            numeric: false,
            disablePadding: true,
            name: 'Stakes',
        },
        {
            value: 'isVerified',
            numeric: false,
            disablePadding: true,
            name: 'Verified',
        },
        {
            value: 'progeny',
            numeric: false,
            disablePadding: true,
            name: 'Progeny',
        },
    ];
    const horseGenerationData = [
        { id: 1, name: 'Internal', value: 'internal' },
        { id: 2, name: 'DB', value: 'db' },
    ];
    const horseSourceData = [
        { id: 1, name: 'Internal', value: 'internal' },
        { id: 2, name: 'DB', value: 'db' },
    ];
    const horseVerifiedStatusData = [
        { id: 1, name: 'Verified', value: 'verified' },
        { id: 2, name: 'Unverified', value: 'unverified' },
    ];
    const horseBreedStatusData = [
        { id: 1, name: 'Breed1', value: 'breed1' },
        { id: 2, name: 'Breed2', value: 'bree2' },
    ];

    const dispatch = useDispatch()
    const { enqueueSnackbar } = useSnackbar();

    const [stateFilter, setStateFilter]: any = useState({
        defaultDisplay: '',
        generation: '',
        source: [],
        verifyStatus: [],
        breed: [],
        startDate: ''
    })
    const [pageSettingsUuid, setPageSettingsUuid] = useState('');
    const [verifiedStatusList, setVerifiedStatusList] = useState<any>([]);
    const [horseBreedStatusDataList, setHorseBreedStatusData] = useState<any>([]);
    const [loading, setLoading] = useState(true)
    const [updateHorsePageSetting] = useUpdateHorseSettingMutation();
    useEffect(() => {

        // if(selectedFarmSettings){
        //     setStateFilter({...selectedFarmSettings})
        // }
        getSelectedOptions()
    }, [])

    const getSelectedOptions = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response: any = await axios.get(api.baseUrl + `/page-settings/${3}`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            })
            const data = response.settingsResponse

            setLoading(false)

            setPageSettingsUuid(response?.pageSettingsUuid)

            dispatch(setHorseColumnData(data.defaultDisplay.options))
            dispatch(setHorseGenerationData(data.generation.options))
            dispatch(setHorseSourceData(data.source.options))
            dispatch(setHorseVerifiedStatusData(data.verifyStatus.options))
            setVerifiedStatusList(data.verifyStatus.options);
            // setHorseBreedStatusData(data.breed);
            setStateFilter({
                ...stateFilter,
                defaultDisplay: data?.defaultDisplay?.selectedOption?.value || 'HorseName',
                breed:data.breed
            })
            // dispatch(setHorseBreedStatusData(data.breed.options))

            // setStateFilter({
            //     defaultDisplay: data?.defaultDisplay?.selectedOption?.value || 'HorseName',
            //     generation: data?.generation?.selectedOption?.value,
            //     source: data?.source?.selectedOption?.map((val: any) => val?.value) || [],
            //     verifyStatus: data?.verifyStatus?.selectedOption?.value,
            //     breed: data?.breed?.selectedOption?.value,
            //     startDate: data?.startDate
            // })

        } catch (e) {
            setLoading(false)
            return e;
        }
    }

    const handleChangeSettings = async (dataToSend: any) => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            // await axios.post(api.baseUrl + `/page-settings/horse`, 
            // {
            //     ...dataToSend,
            //     id: pageSettingsUuid,
            // }
            // ,{
            //     headers: {
            //         'Authorization': 'Bearer ' + accessToken,
            //         'Content-Type': 'application/json'
            //     }
            // })
            const finalData = {
                ...dataToSend,
                id: pageSettingsUuid,
            };
            // console.log(finalData, 'FFFF')
            await updateHorsePageSetting(finalData);
            getSelectedOptions()
        } catch (e) {
            return e;
        }
    }

    const handleChangeDate = (panel: any) => {
        setStateFilter(
            {
                ...stateFilter,
                ['startDate']: panel
            }
        )
    };

    const handleChangeFilter = (value: string, key: string) => {
        setStateFilter(
            {
                ...stateFilter,
                [key]: value
            }
        )
    }

    const handleVerifyStatus = (value: any) => {
        // console.log(value, 'VVVV');
        let list = JSON.parse(JSON.stringify(verifiedStatusList));
        for (let index = 0; index < list?.length; index++) {
            const element = list[index];
            // console.log(value?.indexOf(element.name), element, 'ELEMENT');
            if (value?.indexOf(element.name) > -1) {
                element.isSelected = 1;
            } else {
                element.isSelected = 0;
            }
        }
        // console.log(list, 'LISTTT');
        setVerifiedStatusList(list);
    }

    const handleChangeSource = (value: string, key: string) => {
        setStateFilter(
            {
                ...stateFilter,
                [key]: value
            }
        )
    }

    const handleSave = () => {
        const keys = Object.keys(stateFilter).filter(val => stateFilter[val])

        const sourceArr: any = horseSourceData.filter((element: any) => {
            return stateFilter?.source.includes(element.value)
        })

        const generatedData: any = {
            defaultDisplay: horseColumnData.find((val: any) => val.value === stateFilter?.defaultDisplay),
            generation: horseGenerationData.find((val: any) => val.value === stateFilter?.generation),
            source: sourceArr,
            verifyStatus: { options: verifiedStatusList },
            breed: stateFilter?.breed,
            startDate: stateFilter?.startDate
        }

        const filteredData = keys.reduce((obj: any, key: string) => {
            if (generatedData.hasOwnProperty(key)) {
                obj[key] = generatedData[key];
            }
            return obj;
        }, {});
        // console.log('filteredData>>>', filteredData);
        enqueueSnackbar('Saved successfully!');
        handleChangeSettings(filteredData)
        handleClose()
    }

    const returnVerifiedSelectedList = () => {
        let arr: any = [];
        verifiedStatusList?.forEach((v: any) => {
            if (v.isSelected) {
                arr.push(v.name);
            }
        })
        // console.log(arr, 'ARRR');
        return arr;
    }

    const data: any = useGetPageSettingQuery(pageId);
    const settingsData: any = data?.isSuccess ? data?.data : {};


    //Setting form Validation
    const NewFarmSchema = Yup.object().shape({
        displayColname: Yup.string().required('Display Column is required'),
    })
    //set the default value while loading the modal
    const defaultValues = React.useMemo(
        () => ({
            displayColname: settingsData?.settingsResponse?.defaultDisplay?.selectedOption?.value
        }), [settingsData]
    );

    // Form element
    const methods = useForm({
        resolver: yupResolver(NewFarmSchema),
        defaultValues,
    })

    if (loading) {
        return <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}>
            <CircularProgress />
        </Box>
    }

    // console.log(stateFilter, 'stateFilter')

    return (
        <Box>
            <Box className='FormGroup'>
                <InputLabel>Default Display Column</InputLabel>
                <Box className='edit-field'>
                    <Select
                        MenuProps={MenuProps}
                        name="displayColname"
                        onChange={(e) => handleChangeFilter(e.target.value, 'defaultDisplay')}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        defaultValue={defaultValues.displayColname !== '' ? defaultValues.displayColname : "''"}
                        className='filter-slct'
                        placeholder="Name"
                    >
                        <MenuItem className="selectDropDownList" disabled={true} value={'none'}>Name</MenuItem>
                        {horseColumnData?.map((v: any, i: number) => {
                            return (
                                <MenuItem className="selectDropDownList" key={v.id} value={v.value}>{v.name}</MenuItem>
                            )
                        })}
                    </Select>
                </Box>
                <Box className='edit-field horse-setting-field'>
                    <Select
                        MenuProps={MenuProps}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        // {...register("eligibleRaceCountries")}
                        onChange={(e) => handleChangeFilter(e.target.value, 'breed')}
                        name="eligibleRaceCountries"
                        multiple
                        displayEmpty
                        renderValue={(selected: any) => {
                            if (selected?.length === 0) {
                                return <em>Select breed</em>;
                            }
                            return <em>Breed</em>;

                        }}
                        value={(stateFilter?.breed?.length === 0) ? [] : stateFilter?.breed}
                        className='filter-slct'>
                        <MenuItem className="selectDropDownList reportSelectCountry" value="''" disabled><em>Select Countries</em></MenuItem>
                        {horseTypeList?.map((v: any, i: number) => {
                            return (
                                <MenuItem className="selectDropDownList reportSelectCountry settingDropDown" key={v.id} value={v.id}>
                                    <ListItemText primary={v.horseTypeName} />
                                    <Checkbox
                                        checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                        checked={stateFilter?.breed?.indexOf(v.id) > -1}
                                        disableRipple
                                    />
                                </MenuItem>
                            )
                        })}
                    </Select>
                </Box>
            </Box>
            <Box className='FormGroup Save-Btn-settings'>
                <Button className="search-btn" onClick={handleSave} fullWidth>Save</Button>
            </Box>
        </Box>
    )
}