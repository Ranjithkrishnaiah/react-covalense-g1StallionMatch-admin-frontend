import * as React from 'react';
import { useHorseAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { toPascalCase } from 'src/utils/customFunctions';
import { Autocomplete, TextField, Stack, Box, Button, Tooltip, TooltipProps, styled } from '@mui/material';
import { debounce } from 'lodash';
import { tooltipClasses } from '@mui/material';

export default function StallionHorseAutoFilter(props: any) {
  const horseData: any = props?.horseName;
  let [horseFilterData, setHorseFilterData] = React.useState<any>({});
  const [isHorse, setIsHorse] = React.useState(false);
  const [selectedHorse, setSelectedHorse] = React.useState<any>(null);
  const [isEmpty, setIsEmpty] = React.useState(true);
  const [isClearHorse, setIsClearHorse] = React.useState(0);
  const [horseName, setHorseName] = React.useState<any>('');

  // call on set horse data
  React.useEffect(() => {
    if (horseData.horseName) {
      setHorseFilterData({
        horseName: horseData.horseName,
        sex: props?.sex ? props?.sex : '',
      })
      setIsHorse(true);
    }
  }, [horseData])

  // call on set horse data
  React.useEffect(() => {
    if (!props.isOpen && !props.isEdit) {
      setSelectedHorse({ horseName: '' });
    }
  }, [props.isOpen, horseData]);

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
        setHorseName(horseName);
      } else {
        setIsHorse(false);
      }
    }, 1000)
  ).current;

  // Horse Input handler
  const handleHorseInput = (e: any) => {
    if (!e) return;
    setIsClearHorse(0);
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
    // setSelectedHorse(selectedOptions);
    if (selectedOptions) setSelectedHorse(
      {
        horseName: selectedOptions?.horseName,
        yob: selectedOptions?.yob,
        sireCountryCode: selectedOptions?.sireCountryCode,
        damName: selectedOptions?.damName,
        sireName: selectedOptions?.sireName,
      });
    props.setHorseId(selectedOptions ? selectedOptions.horseId : '');
    props.setYob(selectedOptions ? selectedOptions.yob : 0);
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

  // Reset
  const handleHorseOptionsReset = (blurVal: number, selectedOptions: any) => {
    setHorseFilterData('');
    setHorseName('');
    setIsHorse(false);
    setIsClearHorse(blurVal);
  };

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
    <>
      <Box className={`tooltipPopoverbox ${props.className || ''}`}>
        {props.isEdit ?
          <>
            <HtmlTooltip
              className="tableTooltip"
              title={
                <React.Fragment>
                  <Box className='tooltipPopoverBody HorseDetailsPopover '>
                    <p>Stallion Name: {toPascalCase(props?.currentStallion?.horseName)}</p>
                    <p>YOB:{props?.currentStallion?.yob} </p>
                    <p>COB: {props?.currentStallion?.sireCountryCode}</p>
                    <p>Mare: {toPascalCase(props?.currentStallion?.damName)}</p>
                    <p>Sire: {toPascalCase(props?.currentStallion?.sireName)} </p>
                  </Box>
                </React.Fragment>
              }
            >
              <Autocomplete
                popupIcon={<KeyboardArrowDownRoundedIcon />}
                className="filter-at"
                id="customAutocomplete"
                disablePortal
                freeSolo
                disableClearable
                disabled
                options={horseFilterOptions || []}
                value={
                  props?.isEdit
                    ? { horseName: horseData.horseName }
                    : selectedHorse
                }
                onInputChange={handleHorseInput}
                getOptionLabel={(option: any) => `${toPascalCase(option?.horseName)?.toString()}`}
                renderOption={(props, option: any) => (
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
                )}
                noOptionsText={
                  horseName !== '' &&
                  isClearHorse === 0 && (
                    <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                      <span className="fw-bold sorry-message">
                        {isFetching
                          ? 'Loading...'
                          : `Sorry, we couldn't find any matches for "${horseName}"`}
                      </span>
                    </Box>
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder={`Select Horse`}  className={props.className || ''}/>
                )}
                onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
                onBlur={() => handleHorseOptionsReset(1, '')}
                sx={{ justifyContent: 'center', flexGrow: 1, minWidth: '100px' }}
              />
            </HtmlTooltip>
          </> :
          <>
          <Box className='keyancestor'>
            <Autocomplete
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              className="filter-at"
              id="customAutocomplete"
              disablePortal
              // freeSolo
              disableClearable
              options={horseFilterOptions || []}
              value={
                props?.isEdit
                  ? { horseName: horseData.horseName }
                  : selectedHorse
              }
              onInputChange={handleHorseInput}
              getOptionLabel={(option: any) => `${toPascalCase(option?.horseName)?.toString()}`}
              renderOption={(props, option: any) => (
                <HtmlTooltip
                  className="tableTooltip"
                  placement='left'
                  title={
                    <React.Fragment>
                      <Box className='tooltipPopoverBody HorseDetailsPopover'>
                        <p>Stallion Name: {toPascalCase(option?.horseName)}</p>
                        <p>YOB:{option?.yob ? option?.yob : '--'} </p>
                        <p>COB: {option?.sireCountryCode ? option?.sireCountryCode : '--'}</p>
                        <p>Mare: {option?.damName ? toPascalCase(option?.damName) : '--'}</p>
                        <p>Sire: {option?.sireName ? toPascalCase(option?.sireName) : '--'} </p>
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
              noOptionsText={
                horseName !== '' &&
                isClearHorse === 0 && (
                  <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                    <span className="fw-bold sorry-message">
                      {isFetching
                        ? 'Loading...'
                        : `Sorry, we couldn't find any matches for "${horseName}"`}
                    </span>
                  </Box>
                )
              }
              renderInput={(params) => (
                <TextField {...params} placeholder={`Select Horse`} />
              )}
              onChange={(e: any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
              onBlur={() => handleHorseOptionsReset(1, '')}
              sx={{ justifyContent: 'center', flexGrow: 1, minWidth: '100px' }}
            />
            </Box>
          </>
        }
      </Box>
    </>

  )
}