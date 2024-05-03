import * as React from 'react';
import { useStallionGrandSireAutocompleteQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { toPascalCase } from 'src/utils/customFunctions';
import { Autocomplete, TextField, Box, Stack, Tooltip, TooltipProps, styled } from '@mui/material';
import { debounce } from 'lodash';
import { tooltipClasses } from '@mui/material';

export default function GrandSireAutoFilter(props: any) {
  // states
  const [isSire, setIsSire] = React.useState(false);
  const [sireFilterData, setSireFilterData] = React.useState<any>('');
  const [sireame, setSireName] = React.useState<any>('');
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
  const [isClearGrandSire, setIsClearGrandSire] = React.useState(0);
  const [selctedHorse, setSelctedHorse] = React.useState<any>(null);

  // Sire Input handler
  const handleSireInput = (e: any) => {
    setIsClearGrandSire(0);
    if (e?.target?.value && isClearGrandSire === 0) {
      debouncedGrandSireName(e?.target?.value);
    } else {
      setSelctedHorse(null);
    }
    if (e?.target?.value && e?.target?.value?.length === 1) {
      setIsAutoCompleteClear(false);
    }
  };

  // debounce GrandSire Name
  const debouncedGrandSireName = React.useRef(
    debounce(async (typedStallionName) => {
      if (typedStallionName?.length >= 3 && isClearGrandSire === 0) {
        await setSireFilterData(typedStallionName);
        await setIsSire(true);
        refetch();
      } else {
        setIsSire(false);
      }
    }, 1000)
  ).current;

  // GrandSire Options Reset handler
  const handleGrandSireOptionsReset = (blurVal: number, selectedOptions: any) => {
    setSireFilterData('');
    setIsSire(false);
    setIsClearGrandSire(blurVal);
  };

  // API call to get Stallion GrandSire data
  const { data, error, isFetching, refetch, isLoading, isSuccess } =
    useStallionGrandSireAutocompleteQuery({ sireName: sireFilterData }, { skip: !isSire }); //
  let sireFilterOptions = isSire && isClearGrandSire === 0 && !isFetching ? data : [];

  // Sire Select handler
  const handleSireSelect = (selectedOptions: any) => {
    props.setGrandSireName(selectedOptions ? selectedOptions.horseName : '');
    setIsSire(false);
    handleGrandSireOptionsReset(0, selectedOptions);
    // props.setAutocompleteChoosen({
    //   ...props.isAutocompleteChoosen,
    //   isGrandSireNameChoosen: true,
    // });
  };

  // call on isFilterApplied
  React.useEffect(() => {
    if (!props.isFilterApplied) {
      setSireFilterData('');
      props.setGrandSireName('');
    }
  }, [props.isFilterApplied]);

  // call on isClearAutoComplete to reset
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setSireFilterData('');
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete]);

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }: any) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      background: 'none',
      fontSize: theme.typography.pxToRem(12),
      fontFamily: 'Synthese-Regular !important',
    },
  }));
  
  return (
    // Autocomplete
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
      renderInput={(params) => <TextField {...params} placeholder={`Select Grand Sire`} />}
      onChange={(e: any, selectedOptions: any) => handleSireSelect(selectedOptions)}
      onBlur={() => handleGrandSireOptionsReset(1, '')}
      className="directory-arrow stallionBlockInput"
      sx={{ justifyContent: 'center', flexGrow: 1, minWidth: '100px' }}
    />
  );
}
