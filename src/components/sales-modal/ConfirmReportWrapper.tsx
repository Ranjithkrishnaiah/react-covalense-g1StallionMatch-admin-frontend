import { Dialog, DialogTitle, DialogContent, IconButton, TextField, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Grid,
  Modal,
  StyledEngineProvider,
  Card,
  Stack,
  Button,
  InputLabel,
  Typography,
} from '@mui/material';
import { Images } from "src/assets/images";
import 'src/components/wrapper/wrapper.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from '../../constants/MenuProps';
import { useImpactAnalysisTypeListQuery, useLotListsQuery, useReportSettingMutation } from 'src/redux/splitEndpoints/salesSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { CloseIcon } from 'src/theme/overrides/CustomIcons';
import { Autocomplete } from '@mui/material';
import { Checkbox } from '@mui/material';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

interface InviteModal {
  name: string;
  email: string;
}

const drawerWidth = 360;
type FormValuesProps = InviteModal;

export const ConfirmReportWrapperDialog = (props: any) => {
  const { open, close, rowId,apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg } = props;

  const { data: impactAnalysisTypeList } = useImpactAnalysisTypeListQuery();
  const { data: salesLotList, error, isFetching, isLoading, isSuccess } = useLotListsQuery(rowId, { skip: !rowId, refetchOnMountOrArgChange: true });
  const [reportSettings, response] = useReportSettingMutation<any>();
  const [selectedLotlist, setSelectedLotlist] = useState<any>([]);
  const [impactAnalysisType, setImpactAnalysisType] = useState<any>('');

  useEffect(() => {
    // console.log(response,'response')
    if(response) {
      if(response?.data?.statusCode === 200) {
        setApiStatusMsg({ 'status': 201, 'message': response?.data?.message });
        setApiStatus(true);
        close();
      }
      if (response?.error) {
        setApiStatusMsg({ 'status': 422, 'message': response?.error?.data?.message });
        setApiStatus(true);
      }
    }
  },[response])

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let obj: any = {};
    obj.impactAnalysisTypeId = parseInt(impactAnalysisType)
    obj.isSelectedForSetting = true

    if (selectedLotlist.length) {
      obj.selectedLots = selectedLotlist
    } else {
      let arr = salesLotList.map((v: any) => v.Id);
      obj.selectedLots = arr;
      // console.log(arr, 'ARR11')
    }
    reportSettings([rowId, obj])
    // console.log(impactAnalysisType, selectedLotlist, obj, 'DATALIST')
  }

  return (
    <StyledEngineProvider injectFirst>
      <Dialog
        open={props.open}
        className="dialogPopup confirmReportWrapperModal"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        {/* <CustomDialogTitle className='confirmReportHeading'>
          {props.title}

          <IconButton
            onClick={close}
            sx={{
              position: 'absolute',
              right: 12,
              width: 36,
              height: 36,
              top: 18,
              color: (theme) => '#1D472E',
            }}
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle> */}

        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box sx={{ display: { xs: 'flex', lg: 'flex' } }} className="edit-section stallion-settings-popover">
            <Stack className='st-setting-text'>
              <Typography variant='h6'>Confirm Report Settings</Typography>
              <IconButton className='closeBtn'
                onClick={() => { close(); setImpactAnalysisType('') }}>
                <i className="icon-Cross" />
              </IconButton>
            </Stack>


            <Box>
              <form onSubmit={handleSubmit}>
                <Box className='FormGroup'>
                  <InputLabel>Select Lots (leave blank for all)</InputLabel>
                  <Box className='edit-field'>
                    {/* <Select
                      MenuProps={MenuProps}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      className="filter-slct"
                      defaultValue="none" name="expiredStallion">
                      <MenuItem className="selectDropDownList" value="none" disabled><em>Select Lots</em></MenuItem>
                      <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                      <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                    </Select> */}
                    <Autocomplete
                      id="checkboxes-tags-demo new"
                      options={salesLotList || []}
                      // defaultValue={productDefaultList}
                      filterSelectedOptions
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      ChipProps={{ deleteIcon: <CloseIcon /> }}
                      disablePortal
                      multiple
                      disableCloseOnSelect
                      // onInputChange={(e) => setInputValue(e)}
                      className="AutoCompleteBox"
                      sx={{ margin: '0px', padding: '0px' }}
                      getOptionLabel={(option: any) => `${toPascalCase(option?.horseName)?.toString()}`}
                      onChange={(e: any, selectedOptions: any) => {
                        let arr: any = [];
                        selectedOptions?.map((record: any) => {
                          arr.push(record.Id);
                        });
                        // console.log(arr, 'selectedOptions')
                        setSelectedLotlist(arr);
                        let idWithPlaceholder = `checkboxes-tags-demo new`;
                        if (selectedOptions.length > 0 && document.getElementById(idWithPlaceholder)?.getAttribute("placeholder")?.length) {
                          document.getElementById(idWithPlaceholder)?.setAttribute("placeholder", "");
                        } else if (selectedOptions.length === 0 && document.getElementById(idWithPlaceholder)?.getAttribute("placeholder")?.length === 0) {
                          document.getElementById(idWithPlaceholder)?.setAttribute("placeholder", 'Select Product')
                        }
                      }}
                      renderOption={(props: any, option: any, { selected }) => {
                        return (
                          <li {...props}>
                            <span className='autocompleteTitle'>
                              {toPascalCase(option?.horseName)?.toString()}
                            </span>
                            <Checkbox
                              checkedIcon={<img src={Images.checked} />}
                              icon={<img src={Images.unchecked} />}
                              style={{ marginRight: 0 }}
                              checked={selected}
                            />
                          </li>
                        );
                      }}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={'Select Lots'} />
                      )}
                    />
                  </Box>
                </Box>



                <Box className='FormGroup'>
                  <InputLabel>Impact Analysis Type</InputLabel>
                  {/* <TextField placeholder='Choose Type' className='edit-field'></TextField> */}
                  <Select
                    MenuProps={MenuProps}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    onChange={(e: any) => { setImpactAnalysisType(e.target.value) }}
                    defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Choose Type</em></MenuItem>
                    {impactAnalysisTypeList?.map((v: any) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.impactAnalysisType}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>

                <Box className='FormGroup Save-Btn-settings'>
                  <Button type='submit' className="search-btn" disabled={!impactAnalysisType || !salesLotList.length} fullWidth>Begin Generating</Button>
                </Box>
              </form>
            </Box>


          </Box>
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
