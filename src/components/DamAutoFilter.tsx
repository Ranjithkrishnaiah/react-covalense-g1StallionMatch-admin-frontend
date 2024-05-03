import * as React from 'react';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDamAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';

export default function DamAutoFilter(props: any) {
  const [damName, setDamName] = React.useState<any>('abc');
  const [isDam, setIsDam] = React.useState(false);
  // Dam Input handler
  const handleDamInput = (e: any) => {
    if (e.target.value && e.target.value.length >= 5) {
      setDamName(e.target.value);
      setIsDam(true);
    }
  };
  // dam Filter Data
  const damFilterData: any = {
    damName: damName,
  };
  // API call to get dam auto search data
  const { data, error, isFetching, isLoading, isSuccess } = useDamAutocompleteSearchQuery(
    damFilterData,
    { skip: !isDam }
  );
  const damFilterOptions = damFilterData == '' ? [] : data;
  // Dam Select handler
  const handleDamSelect = (selectedOptions: any) => {
    props.setDamId(selectedOptions ? selectedOptions.horseId : '');
    setIsDam(false);
  };
  return (
    // Dam CustomAutocomplete
    <CustomAutocomplete
      popupIcon={<KeyboardArrowDownIcon />}
      options={damFilterOptions || []}
      getOptionLabel={(option: any) => option?.horseName}
      onInputChange={handleDamInput}
      onChange={(e: any, selectedOptions: any) => handleDamSelect(selectedOptions)}
      placeholder={'Enter Dam'}
      className="filter-at"
    />
  );
}
