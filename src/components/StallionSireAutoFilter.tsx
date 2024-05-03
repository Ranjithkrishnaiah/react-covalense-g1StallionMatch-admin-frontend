import * as React from 'react';
import { useStallionSireAutocompleteQuery} from 'src/redux/splitEndpoints/stallionsSplit';
import CustomAutocomplete from '../components/CustomAutocomplete';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { toPascalCase } from 'src/utils/customFunctions';
import { Autocomplete, TextField, Box, Stack, Tooltip, TooltipProps, styled } from '@mui/material';
import { debounce } from 'lodash';
import { tooltipClasses } from '@mui/material';

export default function StallionSireAutoFilter (props: any){
    // Define state variable
    const [sireFilterData, setSireFilterData] = React.useState<any>("");  
    const [isSire, setIsSire] = React.useState(false);
    const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
    const [isClearSire, setIsClearSire] = React.useState(0);
    const [selctedHorse, setSelctedHorse] = React.useState<any>(null);

    // On sire input text changed
    const handleSireInput = (e: any) => {
      setIsClearSire(0);
      if (e?.target?.value && isClearSire === 0) {
        debouncedSireName(e?.target?.value);
      } else {
        setSelctedHorse(null);
      }
      if(e?.target?.value && e?.target?.value?.length === 1) {
        setIsAutoCompleteClear(false);
      }
    };

    // Debounce functionality to restrict concurrent call
    const debouncedSireName = React.useRef(
      debounce(async (typedStallionName) => {
        if (typedStallionName?.length >= 3 && isClearSire === 0) {
          await setSireFilterData(typedStallionName);
          await setIsSire(true);
          refetch();
        } else {
          setIsSire(false);
        }
      }, 1000)
    ).current;

    // Reset
    const handleSireOptionsReset = (blurVal: number, selectedOptions: any) => {
      setSireFilterData('');
      setIsSire(false);
      setIsClearSire(blurVal);
    };

    // Sire search auto complete api call
    const { data, error, isFetching, refetch, isLoading, isSuccess } = useStallionSireAutocompleteQuery({sireName :sireFilterData}, {skip: (!isSire)}); //
    let sireFilterOptions = isSire && isClearSire === 0 && !isFetching ? data : [];

    // On selecting the sire from the search list
    const handleSireSelect = (selectedOptions: any) => {
      props.setSireId(selectedOptions ? selectedOptions.horseName:'');
      setIsSire(false);
      handleSireOptionsReset(0, selectedOptions);
      // props.setAutocompleteChoosen({
      //   ...props.isAutocompleteChoosen,
      //   isSireChoosen: true,
      // });
    }

    React.useEffect(() => {
      if(!props.isFilterApplied){
        setSireFilterData('')
        props.setSireId('');
      }
    }, [props.isFilterApplied])

    React.useEffect(() => {
      if(props.isClearAutoComplete){
        setSireFilterData('');
        setIsAutoCompleteClear(true);
      }
    },[props.isClearAutoComplete])

    const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
      <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }: any) => ({
      [`& .${tooltipClasses.tooltip}`]: {
        background: 'none',
        fontSize: theme.typography.pxToRem(12),
        fontFamily: 'Synthese-Regular !important',
      },
    }));

    return(    
    <Autocomplete                  
      disablePortal
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      options={sireFilterOptions || []}                  
      onInputChange={handleSireInput}
      getOptionLabel={(option: any) =>
        isAutoCompleteClear === true ? '' : `${toPascalCase(option?.horseName)?.toString()}`
      }
      renderOption={(props, option: any) => (
        <HtmlTooltip
          className="tableTooltip"
          placement='left'
          title={
            <React.Fragment>
              <Box className='tooltipPopoverBody HorseDetailsPopover keyancestor-details' sx={{width:"380px !important"}}>
                <Stack className="stallionListBoxHead">
                  {toPascalCase(option.horseName)} ({option.yob},{' '}
                  <span>{option.countryCode}</span>)
                </Stack>
                <Stack className="stallionListBoxpara">
                  <strong>X</strong>
                  <p>
                    {toPascalCase(option.sireName)} (<span>{option.sireCountryCode}</span>){' '}
                    {option.sireYob} - {toPascalCase(option.damName)} (
                    <span>{option.damCountryCode}</span>) {option.damYob}
                  </p>
                </Stack>
              </Box>
            </React.Fragment>
          }
        >

          <li className="searchstallionListBox" {...props} key={`${option?.horseId}${option?.horseName}`}>
            <Stack className="stallionListBoxHead">
              {toPascalCase(option.horseName)} ({option.yob},{' '}
              <span>{option.countryCode}</span>)
            </Stack>
            <Stack className="stallionListBoxpara">
              <strong>X</strong>
              <p>
                {toPascalCase(option.sireName)} (<span>{option.sireCountryCode}</span>){' '}
                {option.sireYob} - {toPascalCase(option.damName)} (
                <span>{option.damCountryCode}</span>) {option.damYob}
              </p>
            </Stack>
          </li>
        </HtmlTooltip>
      )}
      renderInput={(params) => (
        <TextField {...params} placeholder={`Select Sire`} />
      )}
      onChange={(e:any, selectedOptions: any) => handleSireSelect(selectedOptions)}
      onBlur={() => handleSireOptionsReset(1, '')}
      className="directory-arrow stallionBlockInput"
      sx={{ justifyContent: 'center', flexGrow: 1, minWidth: '100px' }}
    /> 
    )
}