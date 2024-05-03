import * as React from 'react';
import CustomAutocomplete from './CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { useRunnersHorseNameQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';

export default function HorseRunnerAutoComplete(props: any) {
  let [farmFilterData, setFarmFilterData] = React.useState(
    typeof props.searchedName == 'string' ? `${props.searchedName}` : ''
  );
  const [isFarm, setIsFarm] = React.useState(false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const placeHolderText = typeof props.isEdit === 'boolean' ? props.searchedName : 'Select Farm';
  const [selectedFarm, setSelectedFarm] = React.useState({ horseName: '' });
  // call on searchedName
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

  // debounced FarmName
  const debouncedFarmName = React.useRef(
    debounce(async (farmName) => {
      if (farmName.length >= 3) {
        setFarmFilterData(farmName);
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  // Farm Input handler
  const handleFarmInput = (e: any) => {
    if (!e) return;
    setSelectedFarm({
      ...selectedFarm,
      horseName: e.target.value,
    });
    if (e && e.target.value) {
      debouncedFarmName(e.target.value);
    }
  };

  // API to get runners data
  const { data, error, isFetching, isLoading, isSuccess } = useRunnersHorseNameQuery(
    farmFilterData,
    { skip: !isFarm }
  );
  const farmFilterOptions = farmFilterData == '' ? [] : data;

  // Farm Select handler
  const handleFarmSelect = (selectedOptions: any) => {
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

  // reset on clear
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete]);

  return (
    // Select Horse CustomAutocomplete
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={farmFilterOptions || []}
      getOptionLabel={(option: any) => {
        return option?.horseName;
      }}
      onInputChange={handleFarmInput}
      onChange={(e: any, selectedOptions: any) => handleFarmSelect(selectedOptions)}
      placeholder={'Select Horse'}
      className="filter-at"
      value={selectedFarm.horseName ? selectedFarm : { horseName: '' }}
    />
  );
}
