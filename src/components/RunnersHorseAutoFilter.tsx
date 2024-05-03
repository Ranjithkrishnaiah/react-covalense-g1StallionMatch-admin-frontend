import * as React from 'react';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useHorseAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { boolean } from 'yup';
import { text } from 'stream/consumers';
import { toPascalCase } from 'src/utils/customFunctions';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box, TextField
} from '@mui/material';
import { Stack } from '@mui/material';

export default function RunnersHorseAutoFilter(props: any) {
  let [horseFilterData, setHorseFilterData] = React.useState({
    horseName: typeof props.horseName == 'string' ? props.horseName : '',
  });
  const [selectedHorse, setSelectedHorse] = React.useState({ horseName: '' });
  const [isClearStallion, setIsClearStallion] = React.useState(0);
  const [stallionname, setStallionName] = React.useState<any>('');

  React.useEffect(() => {
    setHorseFilterData({
      horseName: typeof props.horseName == 'string' ? props.horseName : '',
    });
    if (!props.isOpen) {
      const textArr = document.getElementById('customAutocomplete');

      setTimeout(() => {
        //@ts-ignore
        textArr.value = '';
      }, 0);
    }
    if (!props.isOpen) {
      setSelectedHorse({ horseName: '' })
    }
    if (props.isEdit || props.isExist) {
      if (props.runnersModuele) {
        setSelectedHorse({ horseName: props?.horseName })
      } else {
        setSelectedHorse(props?.horseName)
      }
    }
    if (props?.horseName?.horseId == '') {
      setSelectedHorse({ horseName: '' })
    }
  }, [props.isOpen, props?.horseName]);
  const [isHorse, setIsHorse] = React.useState(
    typeof props.horseName === 'undefined' ? false : true
  );
  const debouncedHorseName = React.useRef(
    debounce(async (horseName) => {
      if (horseName.length >= 3 && isClearStallion === 0) {
        setHorseFilterData({
          horseName: horseName,
        });
        setIsHorse(true);
        setStallionName(horseName)
      } else {
        setIsHorse(false);
      }
    }, 1000)
  ).current;

  const handleHorseInput = (e: any) => {
    if (!e) return
    setIsClearStallion(0);
    setSelectedHorse({
      ...selectedHorse,
      horseName: e.target.value
    })

    if (e && e.target.value && isClearStallion === 0) {
      debouncedHorseName(e.target.value);
    }
  };

  const handleHorseSelect = (selectedOptions: any) => {
    let horseObj: any = JSON.parse(JSON.stringify(selectedOptions));
    horseObj.horseName = toPascalCase(selectedOptions?.horseName);
    setSelectedHorse(horseObj)
    props.setStateValueId(horseObj)
  };

  const { data, error, isFetching, isLoading, isSuccess } = useHorseAutocompleteSearchQuery(
    horseFilterData,
    { skip: !isHorse }
  );
  const horseFilterOptions = isHorse ? data : [];

  const handlereset = () => {
    props.setStateValueId({
      "horseId": "",
      "horseName": "",
      "yob": '',
      "sex": "",
      "countryCode": "",
      "horseUuid": ""
    })
    setHorseFilterData({ horseName: '' });
    setSelectedHorse({ horseName: '' });
  }
  // console.log(props?.isError,selectedHorse,'selectedHorse')

  return (
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={horseFilterData.horseName ? horseFilterOptions?.map((v: any) => ({ ...v, horseName: toPascalCase(v?.horseName) })) || [] : []}
      getOptionLabel={(option: any) => option?.horseName}
      onInputChange={handleHorseInput}
      onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
      placeholder={'Matched Horse Name'}
      className="filter-at"
      value={selectedHorse?.horseName ? selectedHorse : null}
      clearIcon={<div onClick={handlereset}><CloseRoundedIcon className='cross-icon' /></div>}
      onBlur={() => { setHorseFilterData({ horseName: '' }); setStallionName(''); setIsClearStallion(1); }}
      renderOption={(props:any, option: any) => (
        <li className="searchstallionListBox" {...props}>
          <Stack className="stallionListBoxHead">
            {toPascalCase(option.horseName)} ({option.yob},{' '}
            <span>{option.countryCode}</span>){' '}
          </Stack>
          <Stack className="stallionListBoxpara">
            <strong>X</strong>
            <p>
              {toPascalCase(option.sireName)} ({option.sireYob},{' '}
              <span>{option.sireCountryCode}</span>),{' '}{toPascalCase(option.damName)} (
              {option.damYob}, <span>{option.damCountryCode}</span>)
            </p>
          </Stack>
        </li>
      )}
      noOptionsText={
        stallionname != '' &&
        isClearStallion === 0 && (
          <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
            <span className="fw-bold sorry-message">
              {isFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${stallionname}"`}
            </span>
          </Box>
        )
      }
      renderInput={(params: any) => 
        <TextField {...params} error={((props?.isError !== undefined && props?.isError?.length !== 0) && selectedHorse?.horseName?.length === 0) ? true : false} placeholder='Matched Horse Name' />}
    />
  );
}