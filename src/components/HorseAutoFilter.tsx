import * as React from 'react';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useHorseAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';

export default function HorseAutoFilter(props: any) {
  const horseData: any = props?.horseName;
  let [horseFilterData, setHorseFilterData] = React.useState<any>({
    horseName: horseData?.horseName ? horseData.horseName : '',
    sex: props?.sex ? props?.sex : '',
  });
  const [isHorse, setIsHorse] = React.useState(horseData.horseName ? true : false);
  const [selectedHorse, setSelectedHorse] = React.useState({ horseName: '' });
  const [isEmpty, setIsEmpty] = React.useState(true);

  // call on set horse data
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedHorse({ horseName: '' });
    }

    if (!props.isOpen) {
      const textArr = document.getElementById('customAutocomplete');
      setTimeout(() => {
        //@ts-ignore
        textArr.value = '';
      }, 0);
    }
    if (horseData?.horseId == '') {
      setSelectedHorse({ horseName: '' });
    }
  }, [props.isOpen, horseData]);
  React.useEffect(() => {
    if (!isEmpty) return;
    if ((props.isEdit || props.isExist) && horseData != undefined) {
      setSelectedHorse(horseData);
    }
  }, [horseData]);

  // debounced Horse Name
  const debouncedHorseName = React.useRef(
    debounce(async (horseName) => {
      if (horseName.length >= 3) {
        setHorseFilterData({
          ...horseFilterData,
          horseName: horseName,
          sex: props?.sex ? props?.sex : '',
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
      horseName: e.target.value,
    });
    if (e && e.target.value) {
      debouncedHorseName(e.target.value);
    }
  };

  // Horse Select handler
  const handleHorseSelect = (selectedOptions: any) => {
    setIsEmpty(false);
    if (!selectedOptions) return;
    setSelectedHorse(selectedOptions);
    props.setHorseId(selectedOptions ? selectedOptions.horseId : '');
    if (props.isEdit) {
      props.setHorseName(selectedOptions ? selectedOptions.horseName : '');
    }
    setIsHorse(false);
  };

  // API call to get horse data
  const { data, error, isFetching, isLoading, isSuccess } = useHorseAutocompleteSearchQuery(
    horseFilterData,
    { skip: !isHorse }
  );
  let horseFilterOptions = isHorse ? data : [];

  return (
    // Select Horse CustomAutocomplete
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={horseFilterOptions || []}
      getOptionLabel={(option: any) => toPascalCase(option?.horseName)?.toString()}
      onInputChange={handleHorseInput}
      onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
      placeholder={'Select Horse'}
      className="filter-at"
      value={selectedHorse?.horseName ? selectedHorse : null}
    />
  );
}
