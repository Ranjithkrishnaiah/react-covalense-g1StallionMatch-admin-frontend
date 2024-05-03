import * as React from 'react';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { useRaceVenueQuery } from 'src/redux/splitEndpoints/raceSplit';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { TextField } from '@mui/material';


export default function VenuAutoFilters(props: any) {
  // Define state variable
  let [farmFilterData, setFarmFilterData] = React.useState(props.displayName ? { displayName: props.displayName } : { displayName: '' });
  const [isFarm, setIsFarm] = React.useState((typeof (props.displayName) == "string") ? true : false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const placeHolderText = (typeof (props.isEdit) === "boolean") ? props.displayName : "Select Farm";
  const [selectedFarm, setSelectedFarm] = React.useState({ displayName: '' });
  const [selectedCountry, setSelectedCountry] = React.useState<any>(props.state.countryId.length !== 0 ? typeof (props.state.countryId) === 'object' ? props.state.countryId.join(',') : '' : '');
  
  // Display default value in edit time
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedFarm({ displayName: '' })
    }
    if ((props.isEdit || props.isExist) && props.displayName != undefined) {
      setSelectedFarm({ displayName: props.displayName })
    }
    if (props?.displayName?.farmId == '') {
      setSelectedFarm({ displayName: '' })
    }
  }, [props.isOpen, props.displayName]);

  React.useEffect(() => {
    setSelectedCountry(props.state.countryId.length !== 0 ? typeof (props.state.countryId) === 'object' ? props.state.countryId.join(',') : props.state.countryId : '')
  }, [props.state])

  // Debounce functionality added to restrict concurrent api call
  const debouncedFarmName = React.useRef(
    debounce(async (displayName) => {
      if (displayName.length >= 3) {
        setFarmFilterData(
          {
            displayName: displayName
          }
        );
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
      debouncedFarmName(e.target.value);
    }
  };
  
  // Race venue api call
  const { data, error, isFetching, isLoading, isSuccess } = useRaceVenueQuery({ ...farmFilterData, country: selectedCountry }, { skip: (!props.isEdit || !(farmFilterData.displayName !== '')) });
  const farmFilterOptions = (farmFilterData.displayName == '') ? [] : data;
  
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
    if (props.pageType === 'stallionForm') {
      setIsFarm(false);
      setIsApiHit(true);
    }
  }

  // Reset
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData({ displayName: '' });
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete])

  // Reset
  const resetData = () => {
    setFarmFilterData({ displayName: '' });
    setIsAutoCompleteClear(true);
  }

  // Handle Reset
  const handlereset = () => {
    props.setStateValueId({
      "id": "",
      "displayName": "",
      "countryId": "",
      "stateId": null,
      "trackTypeId": "none",
      "trackTypeName": ""
    })
    setFarmFilterData({ displayName: '' });
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
      placeholder={"Venue"}
      className="filter-at venue-filter"
      value={selectedFarm.displayName ? selectedFarm : null}
      onBlur={() => resetData()}
      clearIcon={<div onClick={handlereset}><CloseRoundedIcon className='cross-icon' /></div>}
      renderInput={(params: any) => 
      <TextField {...params} error={((props?.isError !== undefined && props?.isError?.length !== 0) && selectedFarm.displayName?.length === 0) ? true : false} placeholder="Venue" />}
    />

  )
}