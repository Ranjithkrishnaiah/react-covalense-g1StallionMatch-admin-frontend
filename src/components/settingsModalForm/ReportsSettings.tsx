import { Box, InputLabel, MenuItem, Select, Button, FormControlLabel, SwitchProps, styled, Switch } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from '../../constants/MenuProps';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "src/api/apiPaths";
import { useSnackbar } from "notistack";
import { useUpdateReportSettingMutation } from "src/redux/splitEndpoints/smSettingsSplit";
import { TextField } from "@mui/material";

export default function ReportsSettings({ handleClose }: { handleClose: any }) {

  const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 46,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
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
        color:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
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
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));
  const selectedReportsSettings = {
    defaultDisplayColumn: 'createdOn',
    sendFrom: 'none',
    replyTo: 'none',
    approvalAutomation: true,
    deliveryAutomation: true,
  };

  const { enqueueSnackbar } = useSnackbar();
  const [updatePageSetting, response] = useUpdateReportSettingMutation();

  const dispatch = useDispatch()
  const [pageSettingsUuid, setPageSettingsUuid] = useState('')
  const [reportsTable, setReportsTable] = useState<{ name: string, value: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter]: any = useState({
    defaultDisplayColumn: '',
    sendFrom: null,
    replyTo: null,
    approvalAutomation: false,
    deliveryAutomation: false,
  })

  useEffect(() => {
    handleGetData()
  }, [])

  useEffect(() => {
    if (response.isSuccess) {
      enqueueSnackbar('Saved successfully!');
      handleGetData()
    }
  }, [response.isSuccess])

  const handleGetData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response: any = await axios.get(api.baseUrl + `/page-settings/${8}`, {
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      })
      const data = response.settingsResponse.defaultDisplay.options
      const approvalAutomation = response.settingsResponse.approvalAutomation
      const deliveryAutomation = response.settingsResponse.deliveryAutomation
      setReportsTable(data)
      setPageSettingsUuid(response?.pageSettingsUuid)
      setStateFilter({
        defaultDisplayColumn: response.settingsResponse.defaultDisplay.selectedOption.value,
        sendFrom: response.settingsResponse.sendFrom,
        replyTo: response.settingsResponse.replyTo,
        approvalAutomation: approvalAutomation == 0 ? false : true,
        deliveryAutomation: deliveryAutomation === 0 ? false : true,
      })
      setLoading(false)

    } catch (e) {
      setLoading(false)
      return e;
    }
  }

  const handleChangeFilter = (value: string, key: string) => {
    if (key === "defaultDisplayColumn") {
      const selectedItem = reportsTable.find(item => item.value === value);
      const defaultDisplay = {
        name: selectedItem ? selectedItem.name : "",
        value: selectedItem ? selectedItem.value : ""
      }
      setStateFilter({
        ...stateFilter,
        defaultDisplay,
        [key]: value
      });
    } else {
      setStateFilter({
        ...stateFilter,
        [key]: value
      });
    }
  }

  const passDefaultDisplayKey = (key: any) => {
    console.log(key,'KEYY')
    let value: any = key?.defaultDisplay?.value;
    if (key?.defaultDisplay?.value === "Order Id" || key?.defaultDisplayColumn === "OrderId") {
      value = "OrderId";
    }
    if (key?.defaultDisplay?.value === "Date" || key?.defaultDisplayColumn === "createdOn") {
      value = "createdOn";
    }
    if (key?.defaultDisplay?.value === "Client Name" || key?.defaultDisplayColumn === "Name") {
      value = "Name";
    }
    let obj: any = {
      "name": key?.defaultDisplay?.name || key?.defaultDisplayColumn,
      "value": value || key?.defaultDisplayColumn
    }
    return obj;
  }

  console.log(stateFilter,'KEYY  > stateFilter')
  const handleSave = async () => {
    // console.log(stateFilter, "stateFilterstateFilter")

    const accessToken = localStorage.getItem('accessToken');
    let finalData = {
      id: pageSettingsUuid,
      defaultDisplay: passDefaultDisplayKey(stateFilter),
      sendFrom: stateFilter.sendFrom,
      replyTo: stateFilter.replyTo,
      approvalAutomation: stateFilter.approvalAutomation ? 1 : 0,
      deliveryAutomation: stateFilter.deliveryAutomation ? 1 : 0,
    }
    console.log(finalData,'KEYY final')
    await updatePageSetting(finalData);
    handleClose();
    // try {
    //   const response: any = await axios.post(api.baseUrl + `/page-settings/report`, {
    //     id: pageSettingsUuid,
    //     defaultDisplay: stateFilter.defaultDisplay,
    //     sendFrom: "",
    //     replyTo: "",
    //     approvalAutomation: stateFilter.approvalAutomation ? 1 : 0,
    //     deliveryAutomation: stateFilter.deliveryAutomation ? 1 : 0,
    //   }, {
    //     headers: {
    //       'Authorization': 'Bearer ' + accessToken,
    //       'Content-Type': 'application/json'
    //     }
    //   })
    //   enqueueSnackbar('Saved successfully!');
    //   handleGetData()
    // } catch (e) {
    //   return e;
    // }
    // handleClose()
  }

  const getDefaultColValue = (val: any) => {
    let value: any = val;
    if (val === "OrderId") {
      value = "Order Id";
    }
    if (val === "createdOn") {
      value = "Date";
    }
    if (val === "Name") {
      value = "Client Name";
    }
    return value;
  }

  return (
    <Box>
      <Box className='FormGroup'>
        <InputLabel>Default Display Column</InputLabel>
        <Box className='edit-field'>
          <Select
            MenuProps={MenuProps}
            IconComponent={KeyboardArrowDownRoundedIcon}
            defaultValue="none"
            className='filter-slct'
            value={getDefaultColValue(stateFilter.defaultDisplayColumn)}
            onChange={(e) => handleChangeFilter(e.target.value, "defaultDisplayColumn")}
          >
            <MenuItem className="selectDropDownList" value="none" disabled><em>Name</em></MenuItem>
            {reportsTable.map((column, index) => (
              <MenuItem key={index} value={column.value as string} disabled={(column.name === 'PDF' || column.name === 'Status') ? true : false}>{column.name}</MenuItem>

            ))}
          </Select>
        </Box>
      </Box>
      <Box className='FormGroup'>
        <InputLabel>Send From</InputLabel>
        <Box className='edit-field'>
          {/* <Select
            MenuProps={MenuProps}
            value={stateFilter.sendFrom}
            disabled={true}
            IconComponent={KeyboardArrowDownRoundedIcon}
            defaultValue="none"
            className='filter-slct'
            onChange={(e) => handleChangeFilter(e.target.value, "sendFrom")}
          >
            <MenuItem className="selectDropDownList" value="none" disabled><em>Enter Email Address</em></MenuItem>
            <MenuItem className="selectDropDownList" value={1} key={1}>Admin</MenuItem>
            <MenuItem className="selectDropDownList" value={2} key={1}>Admin 1</MenuItem>
          </Select> */}
          <TextField
            id="input-with-icon-textfield"
            placeholder='Enter Email Address'
            variant="outlined"
            fullWidth
            value={(stateFilter.sendFrom)}
            onChange={(e) => handleChangeFilter(e.target.value, "sendFrom")}
          />
        </Box>
      </Box>
      {/* <Box className='FormGroup'>
        <InputLabel>Reply To</InputLabel>
        <Box className='edit-field'> */}
          {/* <Select
            disabled={true}
            MenuProps={MenuProps}
            value={stateFilter.replyTo}
            IconComponent={KeyboardArrowDownRoundedIcon}
            defaultValue="none"
            className='filter-slct'
            onChange={(e) => handleChangeFilter(e.target.value, "replyTo")}
          >
            <MenuItem className="selectDropDownList" value="none" disabled><em>Enter Email Address</em></MenuItem>
            <MenuItem className="selectDropDownList" value={1} key={1}>Admin</MenuItem>
            <MenuItem className="selectDropDownList" value={2} key={1}>Admin 1</MenuItem>
          </Select> */}
          {/* <TextField
            id="input-with-icon-textfield"
            placeholder='Enter Email Address'
            variant="outlined"
            fullWidth
            value={(stateFilter.replyTo)}
            onChange={(e) => handleChangeFilter(e.target.value, "replyTo")}
          />
        </Box>
      </Box> */}


      <Box className='FormGroup'>
        <Box className='RHF-Switches setting-switch'>
          <FormControlLabel
            control={<IOSSwitch
              checked={stateFilter.approvalAutomation}
            />}
            label="Approval Automation"
            name="Approval Automation"
            labelPlacement="start"
            onChange={(e: any) => handleChangeFilter(e.target.checked, 'approvalAutomation')}
          />
        </Box>
        <Box className='RHF-Switches'>
          <FormControlLabel
            control={<IOSSwitch
              checked={stateFilter.deliveryAutomation}
            />}
            label="Delivery Automation"
            name="Delivery Automation"
            labelPlacement="start"
            onChange={(e: any) => handleChangeFilter(e.target.checked, 'deliveryAutomation')}
          />
        </Box>
      </Box>

      <Box pt={1} className='FormGroup Save-Btn-settings'>
        <Button onClick={handleSave} className="search-btn" fullWidth>Save</Button>
      </Box>
    </Box>
  )
}