
import * as React from 'react';
import CustomAutocomplete from './CustomAutocomplete'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useByRaceNameQuery } from 'src/redux/splitEndpoints/raceSplit';
import { TextField } from '@mui/material';


export default function RaceNameAutoComplete(props: any) {
  let [farmFilterData, setFarmFilterData] = React.useState((typeof (props.searchedName) == "string") ? `${props.searchedName}` : '');
  const [isFarm, setIsFarm] = React.useState(false);
  const [isApiHit, setIsApiHit] = React.useState(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const placeHolderText = (typeof (props.isEdit) === "boolean") ? props.searchedName : "Select Farm";
  const [selectedFarm, setSelectedFarm] = React.useState({ displayName: '' });
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

  const { data, error, isFetching, isLoading, isSuccess } = useByRaceNameQuery(farmFilterData, { skip: (!isFarm) });
  const farmFilterOptions = (farmFilterData == '') ? [] : data;

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
    if (props.pageType === 'RaceName') {
      setIsFarm(false);
      setIsApiHit(true);
    }
  }

  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setFarmFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete])

  const resetData = () => {
    setFarmFilterData('');
    setIsAutoCompleteClear(true);
  }

  const handlereset = () => {
    props.setStateValueId({
      "id": "",
      "displayName": "",
      "isEligible": true,
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
      placeholder={"Race Name"}
      className="filter-at"
      value={selectedFarm.displayName ? selectedFarm : null}
      onBlur={() => resetData()}
      clearIcon={<div onClick={handlereset}><CloseRoundedIcon className='cross-icon' /></div>}
      renderInput={(params: any) => <TextField {...params} error={((props?.isError !== undefined && props?.isError?.length !== 0) && selectedFarm.displayName?.length === 0) ? true : false} placeholder="Race Name" />}
    />

  )
}