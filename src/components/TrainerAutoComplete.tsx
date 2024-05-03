
import * as React from 'react';
import CustomAutocomplete from './CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { useRunnersTrainerQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { TextField } from '@mui/material';

export default function TrainerAutoComplete(props: any) {
  // Define state variables
  let [farmFilterData, setFarmFilterData] = React.useState((typeof (props.searchedName) == "string") ? `${props.searchedName}` : '');
  const [isFarm, setIsFarm] = React.useState(false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const placeHolderText = (typeof (props.isEdit) === "boolean") ? props.searchedName : "Select Farm";
  const [selectedFarm, setSelectedFarm] = React.useState({ displayName: '' });

  // Display default value in edit time
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedFarm({ displayName: '' })
      setIsFarm(false);
    }
    if ((props.isEdit) && props.searchedName != undefined) {
      setSelectedFarm({ displayName: props.searchedName })
      setFarmFilterData(props.searchedName);
      setIsFarm(true);
    }
    if (props.searchedName == '') {
      setSelectedFarm({ displayName: '' })
      setIsFarm(false);
    }
  }, [props.isOpen, props.searchedName]);

  // Debounce functionality added to restrict concurrent api call
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

  // Autofilter on input chnage, set the payload for api
  const handleFarmInput = (e: any) => {
    if (!e) return
    setSelectedFarm({
      ...selectedFarm,
      displayName: e.target.value
    })
    if (e && e.target.value) {
      // console.log('calling');
      debouncedFarmName(e.target.value);
    }
  };

  // Runner trainer venue api call
  const { data, error, isFetching, isLoading, isSuccess } = useRunnersTrainerQuery(farmFilterData, { skip: (!isFarm) });
  const farmFilterOptions = (farmFilterData == '') ? [] : data;

  // Set the option from selected race venue options
  const handleFarmSelect = (selectedOptions: any) => {
    if (!selectedOptions) return
    if (props.setFarmId) props.setFarmId(selectedOptions);
    setSelectedFarm(selectedOptions)
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
  }

  // Reset
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete])

  // Reset
  const resetData = () => {
    setFarmFilterData('');
    setIsAutoCompleteClear(true);
  }

  // Handle Reset
  const handlereset = () => {
    props.setStateValueId({
      "id": "",
      "displayName": "",
    })
    setFarmFilterData('');
    setIsAutoCompleteClear(true);
  }

  return (
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={farmFilterOptions || []}
      getOptionLabel={(option: any) => {
        return option?.displayName
      }}
      onInputChange={handleFarmInput}
      onChange={(e: any, selectedOptions: any) => handleFarmSelect(selectedOptions)}
      placeholder={"Trainer"}
      className="filter-at"
      value={selectedFarm.displayName ? selectedFarm : null}
      onBlur={() => resetData()}
      clearIcon={<div onClick={handlereset}><CloseRoundedIcon className='cross-icon' /></div>}
      renderInput={(params: any) => 
      <TextField {...params} error={((props?.isError !== undefined && props?.isError?.length !== 0) && selectedFarm.displayName?.length === 0) ? true : false} placeholder="Trainer" />}
    />

  )
}