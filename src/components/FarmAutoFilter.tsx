import * as React from 'react';
import { useFarmAutocompleteQuery } from 'src/redux/splitEndpoints/farmAutocompleteSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import { Autocomplete, TextField, InputAdornment, IconButton } from '@mui/material';
import { Images } from 'src/assets/images';

export default function FarmAutoFilter(props: any) {
  const [isStallionNameExactSearch, setIsStallionNameExactSearch] = React.useState(true);
  const farmData = props.farmName;
  // states
  let [farmFilterData, setFarmFilterData] = React.useState(farmData ? farmData : '');
  const [isFarm, setIsFarm] = React.useState(farmData?.farmName != '' ? true : false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const [selectedFarm, setSelectedFarm] = React.useState({
    farmName: '',
    isFarmNameExactSearch: isStallionNameExactSearch,
  });
  const [typedFarmName, setTypedFarmName] = React.useState('');
  // set selected farms based on farmName and farmId
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedFarm({ farmName: '', isFarmNameExactSearch: isStallionNameExactSearch });
      setIsFarm(false);
    }
    if ((props.isEdit || props.isExist) && farmData != undefined) {
      setSelectedFarm(farmData);
    }
    if (farmData?.farmId == '') {
      setSelectedFarm({ farmName: '', isFarmNameExactSearch: isStallionNameExactSearch });
      setIsFarm(false);
    }
    if (farmData?.farmName == '') {
      setSelectedFarm({ farmName: '', isFarmNameExactSearch: isStallionNameExactSearch });
      setIsFarm(false);
    }
  }, [props.isOpen, farmData]);

  // debounced FarmName
  const debouncedFarmName = React.useRef(
    debounce(async (farmName, isStallionNameExactSearch) => {
      if (farmName.length >= 3) {
        setFarmFilterData({
          farmName: farmName,
          isFarmNameExactSearch: isStallionNameExactSearch,
        });
        setIsFarm(true);
        setTypedFarmName(farmName);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;
  const [idFarm, setIdFarm] = React.useState(false);

  // FarmInput handler
  const handleFarmInput = (e: any) => {
    if (!e) {
      setIdFarm(true);
      return;
    }
    if (e.target.value < 3) {
      setIdFarm(true);
    }
    setSelectedFarm({
      ...selectedFarm,
      farmName: e.target.value,
    });
    if (e && e.target.value) {
      setIdFarm(false);
      debouncedFarmName(e.target.value, isStallionNameExactSearch);
    }
  };

  // FarmSelect handler
  const handleFarmSelect = (selectedOptions: any) => {
    if (!selectedOptions) return;
    props.setFarmId({
      farmName: selectedOptions.farmName,
      farmId: selectedOptions ? selectedOptions.farmId : '',
      countryId: props.pageType === 'farmForm' ? 11 : selectedOptions?.countryId,
      stateId: selectedOptions.stateId,
    });
    setSelectedFarm(selectedOptions);
    setIsAutoCompleteClear(false);

    
    if (props.pageType === 'farmForm') {
      setIsFarm(false);
      setIsApiHit(true);
    }
    if (props.pageType === 'stallionForm') {
      setIsFarm(false);
      setIsApiHit(true);
    }
    if (props.pageType === 'farmMerge') {
      setIsFarm(false);
      setIsApiHit(true);
    }
  };
  // clear autocomplete
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete]);

  //stallionName exact/partial search
  const [isStallionToggleClass, setIsStallionToggleClass] = React.useState(true);
  const [isPartialStallionToggleClass, setIsStallionPartialToggleClass] = React.useState(false);
  const handleStallionNameToggle = async (nameFilterType: string) => {
    setIsStallionNameExactSearch(!isStallionNameExactSearch);
    debouncedFarmName(typedFarmName, !isStallionNameExactSearch);
    setIsStallionToggleClass(!isStallionToggleClass);
    setIsStallionPartialToggleClass(!isPartialStallionToggleClass);
  };
  let stallionToggleClass = isStallionToggleClass ? 'matched-active' : 'matched-inactive';
  let stallionPartialToggleClass = isPartialStallionToggleClass
    ? 'matched-active'
    : 'matched-inactive';
  // API call to get farm data
  const { data, error, isFetching, isLoading, isSuccess } =
    useFarmAutocompleteQuery(farmFilterData);
  const farmFilterOptions = idFarm ? [] : data;

  return (
    // Autocomplete
    <Autocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      className={`filter-at ${props.className}`}
      // className={`filter-at farm-autocomplete ${props.className}`} 
      id="customAutocomplete"
      disablePortal
      options={farmFilterOptions || []}
      getOptionLabel={(option: any) => option && toPascalCase(option?.farmName)}
      onInputChange={handleFarmInput}
      onChange={(e: any, selectedOptions: any) => handleFarmSelect(selectedOptions)}
      value={toPascalCase(selectedFarm?.farmName) ? selectedFarm : null}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            placeholder={'Select Farm'}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  <InputAdornment position="start" className="matchcase">
                    <IconButton
                      className={`matchcase-first ${stallionToggleClass}`}
                      aria-label="toggle password visibility"
                      edge="end"
                      onClick={() => handleStallionNameToggle('exact')}
                      sx={{ marginRight: '0px', padding: '0px' }}
                    >
                      <img src={Images.Aa} alt="Aa" />
                    </IconButton>

                    <IconButton
                      className={`matchcase-second ${stallionPartialToggleClass}`}
                      aria-label="toggle password visibility"
                      edge="end"
                      onClick={() => handleStallionNameToggle('partial')}
                      sx={{ marginRight: '0px', padding: '0px' }}
                    >
                      <img src={Images.ab} alt="ab" />
                    </IconButton>
                  </InputAdornment>
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}
