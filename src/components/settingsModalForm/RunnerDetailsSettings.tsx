import React, { useEffect, useState } from "react";
//mui
import { Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider, Stack, ListItemText } from "@mui/material";
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
//form
import { useForm } from 'react-hook-form';
import { SettingConstants } from 'src/constants/SettingConstants';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
// Api's
import { useGetPageSettingQuery, useUpdateRunnersDetailsSettingMutation, useUpdateSettingMutation } from 'src/redux/splitEndpoints/smSettingsSplit'
// Component
import { CircularSpinner } from "../CircularSpinner";
import { useCountriesQuery } from "src/redux/splitEndpoints/countriesSplit";
import { Images } from "src/assets/images";
import { Checkbox } from "@mui/material";

export default function RunnerDetailsSettings({ handleClose }: { handleClose: any }) {
  const pageId = process.env.REACT_APP_RUNNER_PAGE_ID;

  const [state, setStateValue] = useState<any>({
    eligibleRunnerCOBCountries: []
  })
  const displayColOptionList = SettingConstants.DefaultRunnerColumns;
  const [updatePageSetting] = useUpdateRunnersDetailsSettingMutation();
  const { data: pageSettingsData, isSuccess, isFetching } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });
  const { data: countriesList } = useCountriesQuery();
  const settingsData: any = (isSuccess) ? pageSettingsData : {};

  // Form schema
  const NewFarmSchema = Yup.object().shape({
    defaultDisplay: Yup.string().required('Display column is required'),
    // countryId: Yup.string().required('Country is required'),
  });

  // default state
  const defaultValues = React.useMemo(
    () => ({
      defaultDisplay: settingsData?.settingsResponse?.defaultDisplay || '',
      eligibleRunnerCOBCountries: settingsData?.settingsResponse?.eligibleRunnerCOBCountries || [],
    }), [isFetching]);

  // Form element
  const methods = useForm({
    resolver: yupResolver(NewFarmSchema),
    defaultValues,
  });

  useEffect(() => {
    if (settingsData) {
      setValue('defaultDisplay', settingsData?.settingsResponse?.defaultDisplay);
      setStateValue({ 'eligibleRunnerCOBCountries': settingsData?.settingsResponse?.eligibleRunnerCobCountries });
    }
  }, [settingsData, isFetching]);

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

  // console.log(state, 'DDDDD')

  // Submit form
  const onSubmit = async (data: any) => {
    const finalData = {
      payload: {
        defaultDisplay: data.defaultDisplay,
        eligibleRunnerCOBCountries: state.eligibleRunnerCOBCountries,
        settingId: settingsData?.pageSettingsUuid
      }
    };
    await updatePageSetting(finalData.payload);
    handleClose();
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

  // Handle form state
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue?.target?.value
    });
  };

  return (
    <StyledEngineProvider injectFirst>
      {(isFetching) ?
        <Box mt={'15px'} alignItems={"center"} justifyContent={'center'} display={'flex'}><CircularSpinner /></Box> :
        <>
          <Box>
            {/* Runners Setting form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className='FormGroup'>
                <InputLabel>Default Display Column</InputLabel>
                <Box className='edit-field'>
                  <Select
                    MenuProps={MenuProps}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    {...register("defaultDisplay")}
                    name="defaultDisplay"
                    defaultValue={defaultValues.defaultDisplay !== '' ? defaultValues.defaultDisplay : "''"}
                    className='filter-slct'>
                    {/* <MenuItem className="selectDropDownList" value="" disabled><em>Name</em></MenuItem> */}
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
                <InputLabel>Eligible Runner (COB) Countries</InputLabel>
                <Stack>
                  <Box className='edit-field'>
                    <Select
                      MenuProps={MenuProps}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      // {...register("eligibleRunnerCOBCountries")}
                      // name="eligibleRunnerCOBCountries"
                      multiple
                      displayEmpty
                      onChange={(newValue: any) => { handleChangeField("eligibleRunnerCOBCountries", newValue) }}
                      renderValue={(selected: any) => {
                        if (selected?.length === 0) {
                          return <em>Select Countries</em>;
                        }
                        return <em>View Selected Countries</em>;

                      }}
                      // defaultValue={(state?.eligibleRunnerCOBCountries?.length === 0) ? [] : state?.eligibleRunnerCOBCountries}
                      value={(state?.eligibleRunnerCOBCountries?.length === 0) ? [] : state?.eligibleRunnerCOBCountries}
                      className='filter-slct'>
                      <MenuItem className="selectDropDownList reportSelectCountry" value="''" disabled><em>Select Countries</em></MenuItem>
                      {countriesList?.map((v: any, i: number) => {
                        return (
                          <MenuItem className="selectDropDownList reportSelectCountry settingDropDown" key={v.id} value={v.id}>
                            {/* {(v.countryName)} */}
                            <ListItemText primary={v.countryName} />
                            <Checkbox
                              checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                              checked={state?.eligibleRunnerCOBCountries?.indexOf(v.id) > -1}
                              disableRipple
                            />
                          </MenuItem>
                        )
                      })}
                    </Select>
                    {errors.eligibleRunnerCOBCountries && <div className="errorMsg">{errors.eligibleRunnerCOBCountries.message}</div>}
                  </Box>
                </Stack>
              </Box>
              <Box className='FormGroup Save-Btn-settings' pt={2}>
                <Button type='submit' className="search-btn" fullWidth>Save</Button>
              </Box>
            </form>
            {/* End Runners Setting form */}
          </Box>
        </>
      }
    </StyledEngineProvider>
  )
}