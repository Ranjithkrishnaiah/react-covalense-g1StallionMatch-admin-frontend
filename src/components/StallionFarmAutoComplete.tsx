import * as React from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import { useFarmAutocompleteQuery } from 'src/redux/splitEndpoints/farmAutocompleteSplit';
import { Autocomplete, TextField, Stack } from '@mui/material';

export default function StallionFarmAutoComplete(props: any) {
  // states
  let [horseFilterData, setHorseFilterData] = React.useState({});
  const [selectedHorse, setSelectedHorse] = React.useState<any>(null);
  const [isClearFarm, setIsClearFarm] = React.useState(0);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(false);
  const [farmNameSearch, setFarmNameSearch] = React.useState<any>(false);
  const [isFarmSearch, setIsFarmSearch] = React.useState(false);

  React.useEffect(() => {
    if(props.farmName){
      setHorseFilterData({
        farmName: props.farmName,
      })
      setIsFarmSearch(true);
    }
  }, [props.farmName])

  // debounced Horse Name
  const debouncedHorseName = React.useRef(
    debounce(async (farmName) => {
      if (farmName.length >= 3 && isClearFarm === 0) {
        setHorseFilterData({
          farmName: farmName,
        });
        setIsFarmSearch(true);
      } else {
        setIsFarmSearch(false);
      }
    }, 1000)
  ).current;

  // Horse Input handler
  const handleHorseInput = (e: any) => {
    if (!e) return;
    setIsClearFarm(0)
    if (e && e.target.value && isClearFarm === 0) {
      debouncedHorseName(e.target.value);
    }
  };

  // Horse Select handler
  const handleHorseSelect = (selectedOptions: any) => {
    if (!selectedOptions) return;
    if (selectedOptions) setSelectedHorse({ farmName: selectedOptions?.farmName });
    setFarmNameSearch(true);
    setIsFarmSearch(false);
    let horseObj: any = JSON.parse(JSON.stringify(selectedOptions));
    horseObj.farmName = toPascalCase(selectedOptions?.farmName);
    props.setStateValueId(horseObj);
  };

  // API call to get farm auto complete data
  const { data, error, isFetching, isLoading, isSuccess } = useFarmAutocompleteQuery(
    { ...horseFilterData, isFarmNameExactSearch: false },
    { skip: !isFarmSearch }
  );
  const farmFilterOptions = isFarmSearch ? data : [];

  
  // Farm Options Reset handler
  const handleFarmOptionsReset = (blurVal: number, selectedOptions: any) => {
    setSelectedHorse(null);
    props.setStateValueId({
      farmId: '',
      farmName: '',
    });
    setHorseFilterData({ farmName: '' });
    setIsFarmSearch(false);
    setIsClearFarm(blurVal);    
  };

  return (    
    <Autocomplete
      disablePortal
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={farmFilterOptions || []}
      onInputChange={handleHorseInput}
      getOptionLabel={(option: any) =>
        isAutoCompleteClear === true ? '' : `${toPascalCase(option?.farmName)?.toString()}`
      }
      renderOption={(props, option: any) => (
        <li
          className="searchstallionListBox"
          {...props}
          key={`${option?.farmId}${option?.farmName}`}
        >
          <Stack className="stallionListBoxHead">{toPascalCase(option.farmName)}</Stack>
        </li>
      )}
      renderInput={(params) => <TextField {...params} placeholder={`Select Farm`} />}
      onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
      // onBlur={() => handleFarmOptionsReset(1, '')}
      value={
        props?.farmName && isFarmSearch && !farmNameSearch
          ? { farmName: props?.farmName }
          : selectedHorse
      }
      className="directory-arrow stallionBlockInput"
      sx={{ justifyContent: 'center', flexGrow: 1, minWidth: '100px' }}
    />
  );
}
