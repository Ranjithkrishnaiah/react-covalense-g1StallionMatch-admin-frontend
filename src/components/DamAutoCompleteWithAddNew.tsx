import * as React from 'react';
import CustomAutocomplete from './CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { Box, Stack, StyledEngineProvider } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useDamAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PATH_DASHBOARD } from 'src/routes/paths';
import '../sections/@dashboard/horse/pedegree.css';
import { toPascalCase } from 'src/utils/customFunctions';

export default function DamAutoCompleteWithAddNew(props: any) {
  let [farmFilterData, setFarmFilterData] = React.useState(
    typeof props.searchedName == 'string' ? `${props.searchedName}` : ''
  );
  const [isFarm, setIsFarm] = React.useState(false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const [selectedFarm, setSelectedFarm] = React.useState({ horseName: '' });

  // Handle set and reset form
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedFarm({ horseName: '' });
      setIsFarm(false);
    }
    if (props.isEdit && props.searchedName != undefined) {
      setSelectedFarm({ horseName: props.searchedName });
      setFarmFilterData(props.searchedName);
      setIsFarm(true);
    }
    if (props.searchedName == '') {
      setSelectedFarm({ horseName: '' });
      setIsFarm(false);
    }
  }, [props.isOpen, props.searchedName]);

  // Debaounce
  const debouncedDamName = React.useRef(
    debounce(async (damName) => {
      if (damName.length >= 3) {
        setFarmFilterData(damName);
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  // Handle on search dam state
  const handleDamInput = (e: any) => {
    if (!e) return;
    setSelectedFarm({
      ...selectedFarm,
      horseName: e.target.value,
    });
    if (e && e.target.value) {
      debouncedDamName(e.target.value);
    }
  };

  // Api call to get dam autocomplete data
  const { data, error, isFetching, isLoading, isSuccess } = useDamAutocompleteSearchQuery(
    { damName: farmFilterData },
    { skip: !isFarm }
  );
  const farmFilterOptions = farmFilterData == '' ? [] : data;

  // Select particular dam on search
  const handleDamSelect = (selectedOptions: any) => {
    if (!selectedOptions) return;
    if (props.setFarmId) props.setFarmId(selectedOptions);
    setSelectedFarm(selectedOptions);
    setIsAutoCompleteClear(false);
    props.setStateValueId(selectedOptions);
    if (props.pageType === 'farmForm') {
      setIsFarm(false);
      setIsApiHit(true);
    }
    if (props.pageType === 'Jockey') {
      setIsFarm(false);
      setIsApiHit(true);
    }
  };

  // Reset autocomplete field
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete]);

  const resetData = () => {};

  // handle reset
  const handlereset = () => {
    props.setStateValueId({
      id: '',
      horseName: '',
    });
    setFarmFilterData('');
    setIsAutoCompleteClear(true);
  };

  // navigate to horse details page
  const handleOpenCreateStallionModal = () => {
    window.open(PATH_DASHBOARD.horsedetails.addnew(selectedFarm.horseName, 'F'), '_blank');
  };

  return (
    <StyledEngineProvider injectFirst>
      <Box className="search-stallion-pop-box">
        <Box className="search-stallion-pop-box-inner">
          {/* Dam CustomAutocomplete */}
          <CustomAutocomplete
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            options={farmFilterOptions || []}
            getOptionLabel={(option: any) => {
              return toPascalCase(option?.horseName);
            }}
            onInputChange={handleDamInput}
            onChange={(e: any, selectedOptions: any) => handleDamSelect(selectedOptions)}
            placeholder={'Dam'}
            className="filter-at"
            value={selectedFarm.horseName ? (isAutoCompleteClear ? null : selectedFarm) : null}
            onBlur={() => resetData()}
            clearIcon={
              <div onClick={handlereset}>
                <CloseRoundedIcon className="cross-icon" />
              </div>
            }
            renderOption={(props:any, option: any) => (
                            <li className="searchstallionListBox" {...props}>
                              <Stack className="stallionListBoxHead">
                                {toPascalCase(option?.horseName)} ({option?.yob},{' '}
                                <span>{option.countryCode}</span>){' '}
                              </Stack>
                              <Stack className="stallionListBoxpara">
                                <strong>X</strong>
                                <p>
                                  {toPascalCase(option.sireName)} ({option.sireyob},{' '}
                                  <span>{option.sirecountry}</span>),{' '}{toPascalCase(option.damName)} (
                                  {option.damyob}, <span>{option.damcountry}</span>)
                                </p>
                              </Stack>
                            </li>
                          )}
            noOptionsText={
              farmFilterData != 'abc' && (
                <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                  <span className="fw-bold sorry-message">
                    {isLoading
                      ? 'loading...'
                      : farmFilterData?.length < 3
                      ? 'Please Enter minimum 3 words'
                      : `Sorry, we couldn't find any matches for ${
                          (farmFilterData) && toPascalCase(`${farmFilterData}`)
                        }`}
                  </span>
                  {farmFilterData.length > 0 && (
                    <Box className="submit-new-bg">
                      <Button
                        variant="text"
                        className="lr-btn lr-btn-outline"
                        color="primary"
                        type="button"
                        onClick={() => handleOpenCreateStallionModal()}
                      >
                        Add New
                      </Button>
                    </Box>
                  )}
                </Box>
              )
            }
          />
        </Box>
      </Box>
      <Box py={2} mt={1}>
        <LoadingButton
          type="button"
          fullWidth
          className="lr-btn"
          disabled={isAutoCompleteClear ? isAutoCompleteClear : !selectedFarm.horseName}
          onClick={props.handleSelectNew}
        >
          Select
        </LoadingButton>
      </Box>
    </StyledEngineProvider>
  );
}
