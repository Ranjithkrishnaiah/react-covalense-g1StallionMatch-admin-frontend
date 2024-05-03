import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Autocomplete, TextField, Box, StyledEngineProvider, InputLabel, Button, Typography, Avatar, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import 'src/components/wrapper/wrapper.css';
import * as React from 'react';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import { useHorseMergeExistsQuery, useMergeHorseMutation } from 'src/redux/splitEndpoints/horseSplit';
import { ExistsHorse } from 'src/@types/existsHorse';
import { CustomButton } from 'src/components/CustomButton';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import { Images } from 'src/assets/images';
/////////////////////////////////////////////////////////////////////
// Custom Dialog Title
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const MergeHorseWrapper = (props: any) => {
  const {
    open,
    close,
    stateMerge,
    setStateMerge,
    pageType,
    setHorseId,
    horseName,
    state,
    setStateValue,
    isEdit,
    isExist,
    horseId,
    currentHorse,
    existingHorseList,
    setExistingHorseList,stateMergeResponse, setStateMergeResponse
  } = props;

  // Post merge horse api call
  const [mergeHorse] = useMergeHorseMutation();

  const [searchValue, setSearchValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<ExistsHorse[]>([]);
  const [visibleResults, setVisibleResults] = React.useState(4);
  let [horseFilterData, setHorseFilterData] = React.useState<any>({horseId: horseId, name: currentHorse?.horseName});
  const [isHorse, setIsHorse] = React.useState(false);
  const autocompleteRef = React.useRef(null);

  // const [stateMergeResponse, setStateMergeResponse] = React.useState({
  //   status: "Not Started",
  //   statusCode: 100,
  // });

  // Get all merge horse list
  const { data: existHorseData, isFetching: isMergeFetching, isSuccess: isMergeSuccess } = useHorseMergeExistsQuery(horseFilterData, { skip: (!isEdit), refetchOnMountOrArgChange: true });

  // const [existingHorseList, setExistingHorseList] = React.useState<any>([]);
  // Check after stallion is exist or not after post call
  React.useEffect(() => {
    if (isMergeSuccess) {      
      setExistingHorseList(existHorseData);
    }
  }, [isMergeFetching]);  

  // debounced Horse Name
  const debouncedHorseName = React.useRef(
    debounce(async (horseName) => {
      if (horseName.length >= 3) {
        setHorseFilterData({
          ...horseFilterData,
          name: horseName,
          horseId: horseId,
        });
        setIsHorse(true);
        setSearchValue(horseName);
        setVisibleResults(4);
      } else {
        setIsHorse(false);
      }
    }, 1000)
  ).current;

  // Horse Input handler
  const handleHorseInput = (e: any, newValue: string) => {
    if (!e) return;    
    if (e && e.target.value) {
      debouncedHorseName(newValue);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleResults(prevVisibleResults => prevVisibleResults + 4);
  };

  // Handle close
  const closeExists = () => {
    setHorseFilterData({horseId: horseId, name: currentHorse?.horseName});
    setVisibleResults(4);
    setSearchValue(''); // Clear the search value
    setSearchResults([]); // Clear the search results
    close();
  }

  const navigate = useNavigate();

  // Handle create new horse navigation
  const handleNewHorse = () => {
    close();
    navigate(PATH_DASHBOARD.horsedetails.new);
  }

  // Handle cancel
  const handleReset = () => {
    setHorseFilterData({horseId: horseId, name: currentHorse?.horseName});
    setVisibleResults(4);
    setSearchValue(''); // Clear the search value
    setSearchResults([]); // Clear the search results
    // if (autocompleteRef.current) {
    //   autocompleteRef.current.clear(); // Clear the Autocomplete input
    // }
  }

  // Handle on merge click
  const handleExistsStallion = async(slaveId: any) => {
    let mergeRequest: any = {masterHorseId: horseId, slaveHorseId: slaveId};
    let response: any = await mergeHorse(mergeRequest);
    setStateMergeResponse({
        status: response?.data?.message,
        statusCode: response?.data?.statusCode,
        errorType: response?.data?.errorType,
        title: response?.data?.title,
    });
    closeExists();
  }  
  
  return (
    <StyledEngineProvider injectFirst>
      {/* Dialog starts */}
      <Dialog
        open={props.open}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={closeExists}
            sx={{
              position: 'absolute',
              right: 12,
              width: 36,
              height: 36,
              top: 18,
              color: (theme) => '#1D472E',
            }}
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>

        {/* DialogContent starts */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          <Box className='select-favourite-pop-box' mt={3}>
             <InputLabel>
             This horse possibly exists. Please review below list and click a horse to merge or create new by clicking button below. 
             </InputLabel>

            <Box className='select-favourite-pop-inner' pt={1}>
              <List component="nav" aria-label="" className='select-favourite-list'>
                {
                  (existingHorseList?.length > 0 && existingHorseList?.slice(0, visibleResults).map((fsData: any) => 
                  // <ExistsHorseList
                  //   key={fsData.horseId}
                  //   data={fsData}  
                  //   open={open}                  
                  //   rowId={state.id}
                  //   horseId={horseId}
                  //   isEdit={isEdit}                    
                  //   close={closeExists}
                  //   stateMergeResponse={stateMergeResponse} 
                  //   setStateMergeResponse={setStateMergeResponse}
                  // />
                  <ListItemButton key={fsData.horseId} onClick={() => handleExistsStallion(fsData.horseId)}>
                    <ListItemIcon>
                        <Avatar className='pedegree-user' src={Images?.HorseProfile} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={
                          <React.Fragment>
                              {`${toPascalCase(fsData.horseName)} (${fsData.yob}, ${fsData.countryCode}, `}
                              <span style={{ color: fsData.sex === 'Male' ?'#8BBAF0' : '#ED8AC5' }}>{fsData.sex}</span>
                              {`)`}
                          </React.Fragment>
                        }    
                        secondary={
                            <React.Fragment>
                            <Typography
                                sx={ { display: 'inline' } }
                                component="span"
                                variant="body2"
                                color="#007142;"
                            >
                                X 
                            </Typography>
                            {`  ${toPascalCase(fsData.sireName)} (${fsData.sireYob}, ${fsData.sireCountryCode})`}, {`${toPascalCase(fsData.damName)} (${fsData.damYob}, ${fsData.damCountryCode})`}
                            </React.Fragment>
                        }
                    />                     
                  </ListItemButton>
                  ))
                }
              </List>
              {visibleResults < existingHorseList.length && (
                <CustomButton type="button" className="ShowMore" onClick={handleLoadMore}>
                Show more{' '}
                </CustomButton>
              )}
            </Box>

            <Box className="mergefarm-account-modal" mt={4}>
              <InputLabel>Search for a Existing Horse</InputLabel>
              <Box className="edit-field search-autocomplete horse-merge">
                <Autocomplete
                  freeSolo
                  disablePortal
                  options={searchResults.map(result => result?.horseName)} // Adjust this based on your API response structure
                  value={searchValue} // Controlled value
                  ref={autocompleteRef}
                  onInputChange={handleHorseInput}
                  renderInput={(params) => (
                    <TextField {...params} placeholder={`Select Horse`} />
                  )}
                />

              </Box>
              <Box className='favourite-bottom-button'>
                <Button type='button' fullWidth className='lr-btn' onClick={handleNewHorse}>Create New</Button>
                <Button type='button' fullWidth className='lr-btn lr-btn-outline' onClick={handleReset}>Cancel</Button>
              </Box>
            </Box>
          </Box>          
        </DialogContent>
        {/* DialogContent ends */}
      </Dialog>
      {/* Dialog ends */}
    </StyledEngineProvider>
  );
};