import { Grid, Box, InputLabel, MenuItem, Select, Button, StyledEngineProvider } from "@mui/material";
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import React, { useEffect, useState, useMemo } from "react";
import {
  useRoleSettingsQuery,
  useAdminModulePermissionAccessLevelQuery,
  useRoleBasedAccessLevelQuery,
  useUpdateRoleBasedPermissionAccessLevelMutation,
} from 'src/redux/splitEndpoints/usermanagementSplit';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'src/sections/@dashboard/css/list.css';
import 'src/sections/@dashboard/system/usermanagement/dropdown.css'
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";


export default function UserManagementSettings({ handleClose }: { handleClose: any }) {


  const [changedRoleAcessLevel, setChangedRoleAcessLevel] = useState<any>([]);
  const [isRoleChanged, setIsRoleChanged] = React.useState<boolean>(false);
  const [roleID, setRoleID] = React.useState("");
  const { data: roleList } = useRoleSettingsQuery();
  const { data: adminAccessLevelList } = useAdminModulePermissionAccessLevelQuery();
  const [updateRoleBasedPermission, updateRoleBasedPermissionResponse] = useUpdateRoleBasedPermissionAccessLevelMutation();
  const { data: adminRoleBasedAccessLevelList } = useRoleBasedAccessLevelQuery(roleID, { skip: (!isRoleChanged), refetchOnMountOrArgChange: true });
  const [moduleAccessData, setModuleAccessData] = useState<any>([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const treeDropdownRef = React.useRef<any>();

  useEffect(() => {
    if (updateRoleBasedPermissionResponse.isSuccess) {
      toast.success('Settings updated successfully!')
      setIsRoleChanged(false);
      handleClose();
    }
  }, [updateRoleBasedPermissionResponse.isLoading])

  useEffect(() => {
    let list: any = [];
    if (adminAccessLevelList) {
      adminAccessLevelList?.map((record: any, index: number) => {
        list.push({
          label: record.label,
          value: record.value,
          children: record.children,
          id: index
        });

      })
      setModuleAccessData(list);
    }
  }, [adminAccessLevelList])

  useEffect(() => {
    let list: any = [];
    if (adminRoleBasedAccessLevelList) {
      adminRoleBasedAccessLevelList?.map((record: any, index: number) => {
        list.push({
          label: record.label,
          value: record.value,
          children: record.children,
          id: index,
          checked: record.checked
        });
      })
      setModuleAccessData(list);
    }
  }, [adminRoleBasedAccessLevelList])

  //stores the selected options
  const onChange = async (currentNode: any, selectedNodes: any) => {
    const selectedList: any = [];
    console.log(selectedNodes, 'selectedList')
    selectedNodes?.map(async (selectedRecord: any, index: number) => {
      if (Array.isArray(selectedRecord?.value)) {
        await selectedRecord?.value.reduce(async (promise: any, rec: any) => {
          await promise
          selectedList.push(rec.value);
        }, Promise.resolve());
      } else {
        selectedList.push(selectedRecord.value);
      }
      setChangedRoleAcessLevel(selectedList);
    });
    if (selectedNodes.length === 0) {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', 'Permission Settings');
    } else {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', '  ');
    }
  }
  const onFocus = async () => {
    treeDropdownRef.current.searchInput.setAttribute('style', 'display:block');
  }

  //custome Dropdown Tree Select component
  const DropDownTreeSelect = useMemo(() => {
    return (
      <DropdownTreeSelect
        data={moduleAccessData || []}
        className={'mdl-demo '}
        onChange={onChange}
        onFocus={onFocus}
        texts={{ placeholder: 'Permission Settings' }}
        ref={treeDropdownRef}
        showDropdown='always'
      />
    );
  }, [moduleAccessData]);

  //Updates Role Id
  const handleRoleBasedPermission = (roleId: string) => {
    setIsRoleChanged(true);
    setRoleID(roleId);
  }

  //updates the roles 
  const handleSubmit = async () => {
    const finalData = {
      roleId: roleID,
      permissions: changedRoleAcessLevel
    }
    if (changedRoleAcessLevel?.length > 0) {
      setSaveLoader(true);
      await updateRoleBasedPermission(finalData);
      setSaveLoader(false);
    } else {
      toast.error('Please Update the settings');
    }
  };

  return (
    <StyledEngineProvider injectFirst>

      <Grid container spacing={0}>
        {/* Permission Role Dropdown  */}
        <Grid item xs={5.5}>
          <Box className='FormGroup'>
            <InputLabel>Permission Role</InputLabel>
            <Box className='edit-field'>
              <Select
                MenuProps={MenuProps}
                IconComponent={KeyboardArrowDownRoundedIcon}
                defaultValue="none"
                onChange={(e) => handleRoleBasedPermission(e.target.value)}
                className='filter-slct'>
                <MenuItem className="selectDropDownList" value="none" disabled><em>Select Role</em></MenuItem>
                {roleList?.map((v: any, i: any) => {
                  return (
                    <MenuItem className="selectDropDownList" key={v.Id} value={v.Id}>{v.RoleName}</MenuItem>
                  )
                })}
              </Select>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} className='racelistgroup'>
          {/* Drop down tree select component  */}
          <Box className='FormGroup settingsDropdown col-6'>
            <Box className='edit-field'>
              <Box className="SDmultiselect CountrySDmultiselect">{DropDownTreeSelect}</Box>
            </Box>
          </Box>
        </Grid>
        {/* save Button  */}
        <Grid item xs={6}>
          <Box pt={2} className='FormGroup Save-Btn-settings'>
            {/* <Button className="search-btn" fullWidth disabled={!isRoleChanged} onClick={handleSubmit}>Save</Button> */}
            <LoadingButton
              fullWidth
              variant="contained"
              className="search-btn"
              type="button"
              loading={saveLoader}
              disabled={!isRoleChanged} onClick={handleSubmit}
            >
              Save
            </LoadingButton>
          </Box>
        </Grid>

      </Grid>

    </StyledEngineProvider>
  )
}