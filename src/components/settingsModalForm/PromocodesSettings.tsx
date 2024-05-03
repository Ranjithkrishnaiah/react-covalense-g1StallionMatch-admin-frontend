import { Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider } from '@mui/material';
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { SettingConstants } from 'src/constants/SettingConstants';
import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import {
  useGetPageSettingQuery,
  useUpdateSettingMutation,
} from 'src/redux/splitEndpoints/smSettingsSplit';
import { CircularSpinner } from '../CircularSpinner';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';

export default function PromocodesSettings({ handleClose }: { handleClose: any }) {
  const pageId = process.env.REACT_APP_PROMOCODE_PAGE_ID;
  const [currentPage, setCurrentPage] = useState<string[]>([]);
  const location = useLocation();
  // set current page based on location
  useEffect(() => {
    if (location) {
      const currentPage1 = location.pathname.split('/');
      setCurrentPage(currentPage1);
    }
  }, [location]);

  let params = {
    id: currentPage[2],
  };

  // API call for update page settings
  const [updatePageSetting] = useUpdateSettingMutation();
  const data: any = useGetPageSettingQuery(pageId);
  const settingsData: any = data?.isSuccess ? data?.data : {};
  const displayColOptionList = SettingConstants.DefaultPromocodeColumns;

  // NewFarm Schema
  const NewFarmSchema = Yup.object().shape({
    displayColname: Yup.string().required('Display column is required'),
  });

  // default Values
  const defaultValues = React.useMemo(
    () => ({
      displayColname: settingsData?.settingsResponse?.defaultDisplay,
    }),
    [settingsData]
  );

  // methods for form
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

  // onSubmit handler for update settings
  const onSubmit = async (data: any) => {
    const finalData = {
      moduleId: Number(pageId),
      payload: {
        defaultDisplay: data.displayColname,
      },
    };
    await updatePageSetting(finalData);
    handleClose();
  };

  return (
    <StyledEngineProvider injectFirst>
      {data?.status === 'rejected' ? (
        <UnAuthorized />
      ) : data?.isFetching ? (
        <Box mt={'15px'} alignItems={'center'} justifyContent={'center'} display={'flex'}>
          {/* spinner */}
          <CircularSpinner />
        </Box>
      ) : (
        <>
          <Box>
            {/* form for settings popup */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className="FormGroup">
                <InputLabel>Default Display Column</InputLabel>
                <Box className="edit-field">
                  <Select
                    MenuProps={MenuProps}
                    placeholder="Select Display Column"
                    {...register('displayColname')}
                    name="displayColname"
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    defaultValue={
                      defaultValues.displayColname !== '' ? defaultValues.displayColname : "''"
                    }
                    className="filter-slct"
                  >
                    <MenuItem className="selectDropDownList" value="''" disabled selected>
                      <em>Name</em>
                    </MenuItem>
                    {displayColOptionList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.value}>
                          {v.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {errors.displayColname && (
                    <div className="errorMsg">{errors.displayColname.message}</div>
                  )}
                </Box>
              </Box>
              {/* save button for update settings */}
              <Box className="FormGroup Save-Btn-settings">
                <Button type="submit" className="search-btn" fullWidth>
                  Save
                </Button>
              </Box>
            </form>
            {/* form for settings popup end */}
          </Box>
        </>
      )}
    </StyledEngineProvider>
  );
}
