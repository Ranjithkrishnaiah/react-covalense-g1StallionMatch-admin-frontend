import { Box, InputLabel, Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from 'src/api/apiPaths';
import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function MessagesSettings({ handleClose }: { handleClose: any }) {
  const pageId = process.env.REACT_APP_MESSAGE_PAGE_ID;
  const { enqueueSnackbar } = useSnackbar();
  // react states
  const [pageSettingsUuid, setPageSettingsUuid] = useState('');
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter]: any = useState({
    retainTrashPeriod: '',
    expirylength: '',
  });

  // on page load call handleGetData()
  useEffect(() => {
    handleGetData();
  }, []);

  // get dat from API handler
  const handleGetData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response: any = await axios.get(api.baseUrl + `/page-settings/${pageId}`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      });
      const data = response.settingsResponse;
      setStateFilter({
        retainTrashPeriod: data.retainTrashPeriod,
        expirylength: data.boostExpiryLength,
      });
      setPageSettingsUuid(response?.pageSettingsUuid);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      return e;
    }
  };

  // onChange field handler
  const handleChangeFilter = (value: string, key: string) => {
    setStateFilter({
      ...stateFilter,
      [key]: value,
    });
  };

  // save handler
  const handleSave = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response: any = await axios.post(
        api.baseUrl + `/page-settings/messages`,
        {
          id: pageSettingsUuid,
          retainTrashPeriod: stateFilter.retainTrashPeriod,
          boostExpiryLength: stateFilter.expirylength,
        },
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
        }
      );
      enqueueSnackbar('Saved successfully!');
      handleGetData();
    } catch (e) {
      return e;
    }
    handleClose();
  };

  // loader
  if (loading) {
    return (
      <Box mt={'15px'} alignItems={'center'} justifyContent={'center'} display={'flex'}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* text fields */}
      <Box className="FormGroup">
        <InputLabel>Retain Trash Period (Days)</InputLabel>
        <TextField
          value={stateFilter.retainTrashPeriod}
          onChange={(e) => handleChangeFilter(e.target.value, 'retainTrashPeriod')}
          placeholder="Select Days"
          className="edit-field"
        />
      </Box>

      <Box className="FormGroup">
        <InputLabel>Boost Expiry Length (Days)</InputLabel>
        <TextField
          value={stateFilter.expirylength}
          onChange={(e) => handleChangeFilter(e.target.value, 'expirylength')}
          placeholder="Select Days"
          className="edit-field"
        />
      </Box>

      {/* save button */}
      <Box pt={2} className="FormGroup Save-Btn-settings">
        <Button onClick={handleSave} className="search-btn" fullWidth>
          Save
        </Button>
      </Box>
    </Box>
  );
}
