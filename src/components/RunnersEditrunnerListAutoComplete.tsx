
import * as React from 'react';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useRunnerHorseMatchedMaresQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, TextField } from '@mui/material';
import { Stack } from '@mui/material';

export default function RunnersEditrunnerListAutoComplete(props: any) {
  let [horseFilterData, setHorseFilterData] = React.useState({
    name: typeof props.horseName == 'string' ? props.horseName : '',
  });
  const [selectedHorse, setSelectedHorse] = React.useState({ horseName: '' });
  const [isClearStallion, setIsClearStallion] = React.useState(0);
  const [stallionname, setStallionName] = React.useState<any>('');

  React.useEffect(() => {
    setHorseFilterData({
      name: typeof props.horseName == 'string' ? props.horseName : '',
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
      if (horseName.length >= 3) {
        setHorseFilterData({
          name: horseName,
        });
        setStallionName(horseName)
        setIsHorse(true);
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

  const { data, error, isFetching, isLoading, isSuccess } = useRunnerHorseMatchedMaresQuery(
    { ...horseFilterData },
    { skip: !isHorse, refetchOnMountOrArgChange: true }
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
    setHorseFilterData({ name: '' });
    setTimeout(() => {
    }, 500);
  }

  return (
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={horseFilterData?.name ? horseFilterOptions?.map((v:any) => ({...v,horseName:toPascalCase(v?.horseName)})) || [] : []}
      getOptionLabel={(option: any) => option?.horseName}
      onInputChange={handleHorseInput}
      onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
      placeholder={'Matched Horse Name'}
      className="filter-at"
      value={selectedHorse?.horseName ? selectedHorse : null}
      clearIcon={<div onClick={handlereset}><CloseRoundedIcon className='cross-icon' /></div>}
      onBlur={() => { setHorseFilterData({ name: '' });setIsClearStallion(1);setStallionName('') }}
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
      renderInput={(params: any) => 
        <TextField {...params} error={((props?.isError !== undefined && props?.isError?.length !== 0) && selectedHorse?.horseName?.length === 0) ? true : false} placeholder='Matched Horse Name' />}
    />
  );
}