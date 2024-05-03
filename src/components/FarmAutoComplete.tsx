import * as React from 'react';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useFarmAutocompleteQuery } from 'src/redux/splitEndpoints/farmAutocompleteSplit';

export default function FarmAutoComplete(props: any) {
  // states
  let [horseFilterData, setHorseFilterData] = React.useState({
    farmName: typeof props.farmName == 'string' ? props.farmName : '',
  });
  const [selectedHorse, setSelectedHorse] = React.useState({ farmName: '' });

  // call when data avaliable
  React.useEffect(() => {
    setHorseFilterData({
      farmName: typeof props.farmName == 'string' ? props.farmName : '',
    });
    if (!props.isOpen) {
      const textArr = document.getElementById('customAutocomplete');

      setTimeout(() => {
        //@ts-ignore
        textArr.value = '';
      }, 0);
    }
    if (!props.isOpen) {
      setSelectedHorse({ farmName: '' });
    }
    if (props.isEdit || props.isExist) {
      if (props.runnersModuele) {
        setSelectedHorse({ farmName: props?.farmName });
      } else {
        setSelectedHorse(props?.farmName);
      }
    }
    if (props?.farmName?.horseId == '') {
      setSelectedHorse({ farmName: '' });
    }
  }, [props.isOpen, props?.farmName]);

  const [isHorse, setIsHorse] = React.useState(
    typeof props.farmName === 'undefined' ? false : true
  );

  // debounced Horse Name
  const debouncedHorseName = React.useRef(
    debounce(async (farmName) => {
      if (farmName.length >= 3) {
        setHorseFilterData({
          farmName: farmName,
        });
        setIsHorse(true);
      } else {
        setIsHorse(false);
      }
    }, 1000)
  ).current;

  // Horse Input handler
  const handleHorseInput = (e: any) => {
    if (!e) return;
    setSelectedHorse({
      ...selectedHorse,
      farmName: e.target.value,
    });

    if (e && e.target.value) {
      debouncedHorseName(e.target.value);
    }
  };

  // Horse Select handler
  const handleHorseSelect = (selectedOptions: any) => {
    if (!selectedOptions) return;
    let horseObj: any = JSON.parse(JSON.stringify(selectedOptions));
    horseObj.farmName = toPascalCase(selectedOptions?.farmName);
    setSelectedHorse(horseObj);
    props.setStateValueId(horseObj);
  };

  // API call to get farm auto complete data
  const { data, error, isFetching, isLoading, isSuccess } = useFarmAutocompleteQuery(
    { ...horseFilterData, isFarmNameExactSearch: false },
    { skip: !isHorse }
  );
  const horseFilterOptions = isHorse ? data : [];

  //   reset handler
  const handlereset = () => {
    props.setStateValueId({
      farmId: '',
      farmName: '',
    });
    setHorseFilterData({ farmName: '' });
  };

  return (
    // Select Farm CustomAutocomplete
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={horseFilterOptions || []}
      getOptionLabel={(option: any) => option?.farmName}
      onInputChange={handleHorseInput}
      onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
      placeholder={'Select Farm'}
      className="filter-at"
      clearIcon={
        <div onClick={handlereset}>
          <CloseRoundedIcon className="cross-icon" />
        </div>
      }
    />
  );
}
