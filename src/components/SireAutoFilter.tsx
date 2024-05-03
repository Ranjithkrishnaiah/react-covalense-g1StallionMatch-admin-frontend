import * as React from 'react';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import CustomAutocomplete from '../components/CustomAutocomplete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSireAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';

export default function SireAutoFilter (props: any){
    // Define state variables
    const [sirFilterData, setSireFilterData] = React.useState<any>("");    
    const [isSire, setIsSire] = React.useState(false); 
    const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);

    // On search input chnage event
    const handleSireInput = (e: any) => {
      if (e?.target?.value && e?.target?.value?.length >= 3) {
        setSireFilterData(e?.target?.value);
        setIsSire(true);              
      }
      if(e?.target?.value && e?.target?.value?.length === 1) {
        setIsAutoCompleteClear(false);
      }        
    };
    
    // Sire autocomplete api call
    const { data, error, isFetching, isLoading, isSuccess } = useSireAutocompleteSearchQuery({sireName :  sirFilterData}, {skip: (!isSire)}); //
    const sireFilterOptions = (sirFilterData == '') ? [] : data;
    
    // On sire selection event
    const handleSireSelect = (selectedOptions: any) => {
      props.setSireId(selectedOptions ?selectedOptions.horseId : '');
      setIsSire(false);   
    }
    
    // Reset
    React.useEffect(() => {
      if(props.isClearAutoComplete){
        setSireFilterData('');
        setIsAutoCompleteClear(true);
      }
    },[props.isClearAutoComplete])

    return(
    <CustomAutocomplete
        popupIcon={<KeyboardArrowDownIcon/>}
        options={sireFilterOptions || []} 
        getOptionLabel={(option:any) => isAutoCompleteClear === true ? '' : option?.horseName}
        onInputChange={handleSireInput}
        onChange={(e:any, selectedOptions: any) => handleSireSelect(selectedOptions)}
        placeholder = {"Enter Sire"} 
        className="filter-at"
    /> 
    )
}