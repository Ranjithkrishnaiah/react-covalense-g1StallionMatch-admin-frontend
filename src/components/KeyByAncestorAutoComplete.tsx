import * as React from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useHorseAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { Box, Autocomplete, TextField, InputAdornment, IconButton, Stack, Tooltip, TooltipProps, styled } from '@mui/material';
import { Images } from 'src/assets/images';
import { toPascalCase } from 'src/utils/customFunctions';
import { debounce } from 'lodash';
import { tooltipClasses } from '@mui/material';

export default function KeyByAncestorAutoComplete (props: any){
    const [sireFilterData, setSireFilterData] = React.useState<any>(""); 
    const [sireame, setSireName] = React.useState<any>("abc");    
    const [isSire, setIsSire] = React.useState(false); 
    const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);
    const [isStallionNameExactSearch, setIsStallionNameExactSearch] = React.useState(props?.state?.isKeyAncestorExactSearch);
    const [isStallionToggleClass, setIsStallionToggleClass] = React.useState(true);
    const [isPartialStallionToggleClass, setIsStallionPartialToggleClass] = React.useState(false);
    const [isClearStallion, setIsClearStallion] = React.useState(0);
    
    const handleSireInput = (e: any) => {
      if(!e) return
      setIsClearStallion(0);
      if (e.target.value && isClearStallion === 0) {  
        debouncedKeyAncestor(e.target.value);
      }       
    };
    
    const handleSireSelect = (selectedOptions: any) => {
      props.setKeyAncestor(selectedOptions ? selectedOptions.horseId :'');
      setIsSire(false);  
      setIsAutoCompleteClear(false); 
      setIsClearStallion(0);
      props.setIsClearComplete(false);
      // props.setAutocompleteChoosen({
      //   ...props.isAutocompleteChoosen,
      //   isKeyAncestorChoosen: true,
      // });
    }

    React.useEffect(() => {
      if(!props.isFilterApplied){
        setSireName('')
        props.setKeyAncestor('')
      }
    }, [props.isFilterApplied])

    React.useEffect(() => {
      if(props.isClearAutoComplete){
        setSireFilterData('');
        setIsAutoCompleteClear(true);
      }
    },[props.isClearAutoComplete])

    
    const handleStallionNameToggle = (nameFilterType: string) => {
      setIsStallionNameExactSearch(!isStallionNameExactSearch); 
      props?.setStateValue({
        ...props?.state,
        isKeyAncestorExactSearch: !isStallionNameExactSearch
      });   
      if (nameFilterType === 'exact') {
        setIsStallionToggleClass(!isStallionToggleClass);
        setIsStallionPartialToggleClass(!isPartialStallionToggleClass);
      } else if (nameFilterType === 'partial') {
        setIsStallionToggleClass(!isStallionToggleClass);
        setIsStallionPartialToggleClass(!isPartialStallionToggleClass);
      }
    };
    let stallionToggleClass = (props?.state?.isKeyAncestorExactSearch) ? 'matched-active' : 'matched-inactive';
    let stallionPartialToggleClass = (!props?.state?.isKeyAncestorExactSearch) ? 'matched-active' : 'matched-inactive';
        
    const debouncedKeyAncestor = React.useRef(
      debounce(async (searchedKeyAncestor) => {
        if (searchedKeyAncestor.length >= 3) {
          await setIsSire(true); 
          await setIsAutoCompleteClear(false);  
          await props.setIsClearComplete(false);
          await setSireFilterData({
            horseName: searchedKeyAncestor,
            sex: 'M',
            order: 'ASC',
          });          
          refetch();
        } else {
          setIsSire(false);
        }      
      }, 1000)
    ).current;

    const handleOptionsReset = () => {
      setSireFilterData('');
      setIsSire(false); 
      setIsClearStallion(1);
    };

    const { data, isSuccess, isFetching, refetch, requestId, isLoading } = useHorseAutocompleteSearchQuery({...sireFilterData, isHorseNameExactSearch: isStallionToggleClass}, {skip: (!isSire)}); //
    let sireFilterOptions = (isSire && isClearStallion === 0  && !isFetching) ? data && data : [];
    
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
        popupIcon={<KeyboardArrowDownRoundedIcon/>}
        className="filter-at"
        id="customAutocomplete"
        disablePortal
        options={sireFilterOptions}
        getOptionLabel={(option:any) =>isAutoCompleteClear === true ? '' : option  && toPascalCase(option?.horseName)}
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
        onInputChange={handleSireInput}
        onChange={(e:any, selectedOptions: any) => handleSireSelect(selectedOptions)}
        onBlur={() => handleOptionsReset()}
        renderInput={params => {
          return (
            <TextField
              {...params}
              variant="outlined"
              placeholder={"Key Ancestor"}
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="start" className='matchcase'>
                      <IconButton
                        className={`matchcase-first ${stallionToggleClass}`}
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={() => handleStallionNameToggle('exact')}
                        sx={{ marginRight: '0px', padding: '0px' }}>
                        <img src={Images.Aa} alt='Aa' />
                      </IconButton>

                      <IconButton
                        className={`matchcase-second ${stallionPartialToggleClass}`}
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={() => handleStallionNameToggle('partial')}
                        sx={{ marginRight: '0px', padding: '0px' }}>
                        <img src={Images.ab} alt='ab' />
                      </IconButton>
                    </InputAdornment>
                  </>
                )
              }}
            />
          );
        }}
      />
    )
}