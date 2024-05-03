import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { 
    Box, 
    Typography, 
    FormControlLabel, 
    TextField, 
    InputLabel, 
    Button,
    IconButton,
    FormControl,
    RadioGroup,
    Radio,
    Popper,
    Select,
    MenuItem,
    Stack
} from '@mui/material';
import { Images } from "src/assets/images";
import 'src/components/wrapper/wrapper.css';
import { 
  useHorseNameAliasQuery,   
  useCreateHorseNameAliasMutation,
  useDeleteHorseNameAliasMutation,
  useChangeVisibilityHorseNameAliasMutation,
  useHorseCOBAliasQuery,
  useCreateHorseCoBAliasMutation,
  useDeleteHorseCoBAliasMutation,
  useChangeVisibilityHorseCoBAliasMutation,
  useUpdateHorseCoBAliasMutation,
  useUpdateHorseNameAliasMutation,
  useHorseNameDefaultAliasQuery,
  useHorseCoBDefaultAliasQuery
 } from 'src/redux/splitEndpoints/horseSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { CircularSpinner } from '../CircularSpinner';

const ITEM_HEIGHT = 35;
const ITEM_PADDING_TOP = 8;

const MenuPropss : any =  {
      PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            marginTop:'-1px',
            boxShadow: 'none',
            border: 'solid 1px #161716',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            boxSizing: 'border-box',
          },
        },  
  }

export const HorseNameAlias = (props: any) => {
    const {
        popperId, openPopper, hidePopover, enterhorsename, anchorEl, horseId,
        isNameAliasClicked, setIsNameAliasClicked, isCOBAliasClicked, setIsCOBAliasClicked,
        countryId, horseDefaultNameAlias, horseDefaultCoBAlias,
        horseModuleAccess, setHorseModuleAccess, clickedPopover, setClickedPopover,
        apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg
      } = props;
      
      const [state, setStateValue] = useState({
        newAliasName: "",
        pageLimit: 2,
      });

      const [cobState, setCobStateValue] = useState({
        aliasCountryName: "",
        aliasCountryId: 0,
        pageLimit: 2,
      });

      let newState = {
        page: 1,
        limit: state.pageLimit,
        order: "ASC"
      };
    const { data: countriesList } = useCountriesQuery();   
    const { data: horseNameAliasList, isLoading: isNameAliadLoading } = useHorseNameAliasQuery({...newState, horseId: horseId}, {skip: (!isNameAliasClicked)}); 
    // const { data: horseNameDefaultAliasList, isSuccess: isNameDefaultSuccess } = useHorseNameDefaultAliasQuery({...newState, horseId: horseId}, {skip: (!isNameAliasClicked)}); 
    const [addHorseNameAlias, nameAliasResponse] = useCreateHorseNameAliasMutation();
    const [deleteHorseNameAlias] = useDeleteHorseNameAliasMutation();
    const [changeVisibilityHorseNameAlias] = useChangeVisibilityHorseNameAliasMutation();
    const [changeDefaultHorseNameAlias] = useUpdateHorseNameAliasMutation();

    const { data: horseCOBAliasList, isLoading: isCoBAliadLoading } = useHorseCOBAliasQuery({...newState, horseId: horseId}, {skip: (!isCOBAliasClicked)});
    // const { data: horseCOBDefaultAliasList, isSuccess: isCoBDefaultSuccess } = useHorseCoBDefaultAliasQuery({...newState, horseId: horseId}, {skip: (!isCOBAliasClicked)}); 
    const [addHorseCoBAlias, cobAliasResponse] = useCreateHorseCoBAliasMutation();
    const [deleteHorseCoBAlias] = useDeleteHorseCoBAliasMutation();
    const [changeVisibilityHorseCoBAlias] = useChangeVisibilityHorseCoBAliasMutation();
    const [changeDefaultHorseCoBAlias] = useUpdateHorseCoBAliasMutation();
    
    const horseAliasList = (isCOBAliasClicked) ? horseCOBAliasList?.data : horseNameAliasList?.data;
    const horseAliasLoading = (isCOBAliasClicked) ? isCoBAliadLoading : isNameAliadLoading;
    const handleDeleteAliasName = async (aliasHorseName: any) => {  
      if (!horseModuleAccess?.horse_delete_alias) {
        // setClickedPopover(true);
        setApiStatusMsg({
          status: 422,
          message: '<b>You do not have sufficient privileges to access this module!</b>',
        });
        setApiStatus(true);
      } else {      
        await deleteHorseNameAlias({horseName: aliasHorseName, horseId: horseId});
      }
    };

    const handleDeleteAliasCoB = async (horseId: any, aliasCountryId: any) => {
      if (!horseModuleAccess?.horse_delete_alias) {
        // setClickedPopover(true);
        setApiStatusMsg({
          status: 422,
          message: '<b>You do not have sufficient privileges to access this module!</b>',
        });
        setApiStatus(true);
      } else {  
        await deleteHorseCoBAlias({horseId: horseId, countryId: aliasCountryId});
      }
    };
    
    const handleChangeVisibilityAliasName = async (aliasHorseName: any, isActive: boolean) => {       
      await changeVisibilityHorseNameAlias({horseName: aliasHorseName, horseId: horseId, isActive: !isActive});
    };

    const handleChangeVisibilityAliasCoB = async (horseId: any, aliasCountryId: any, isActive: boolean) => {       
      await changeVisibilityHorseCoBAlias({horseId: horseId, countryId: aliasCountryId, isActive: !isActive})
    };

    const [selectedValue, setSelectedValue] = React.useState(isCOBAliasClicked ? horseDefaultCoBAlias : horseDefaultNameAlias);

    const handleRadioChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
      const radioFieldVal = (event.target as HTMLInputElement).value;
      const radioFieldValArr = radioFieldVal.split("_");
      
      setSelectedValue((event.target as HTMLInputElement).value);
      if(isCOBAliasClicked) {
        await changeDefaultHorseCoBAlias({horseId: horseId, countryId: parseInt(radioFieldValArr[1])}) ;
      } 
      if(isNameAliasClicked) {
        await changeDefaultHorseNameAlias({horseId: horseId, horseName: radioFieldVal});
      }
    };

    useEffect(() => {
      if(isCOBAliasClicked){
        setSelectedValue(horseDefaultCoBAlias);
      } 
    }, [isCOBAliasClicked]);

    useEffect(() => {
      if(isNameAliasClicked){
        setSelectedValue(horseDefaultNameAlias);
      } 
    }, [isNameAliasClicked]);

    const [validateAliasOnly, setValidateAliasOnly] = useState(false);
    const handleCreateAlias = (horseId: any, horseAliasName: any) => {
      let horseAliasNames = horseAliasName.replace(/[^a-zA-Z]/g, '')
      setValidateAliasOnly((horseAliasName.length>3) ? true : false);
      setStateValue({
        ...state,
        ['newAliasName']: horseAliasNames
      })
    }
    const handleCreateCoBAlias = (horseCoBAliasId: any, horseCoBAliasName: any) => {
      setValidateAliasOnly(true);
      setCobStateValue({
        ...state,
        ['aliasCountryName']: horseCoBAliasName,
        ['aliasCountryId']: horseCoBAliasId
      })
    }
    const [isAliasExists, setIsAliasExists] = useState(false);
    const handleAliasSubmit = async () => {       
      if (!horseModuleAccess?.horse_add_alias) {
        // setClickedPopover(true);
        setApiStatusMsg({
          status: 422,
          message: '<b>You do not have sufficient privileges to access this module!</b>',
        });
        setApiStatus(true);
      } else {  
        const aliasResponse:any = isNameAliasClicked ? 
        await addHorseNameAlias({horseName: state?.newAliasName, horseId: horseId}) 
        : 
        await addHorseCoBAlias({horseId: horseId, countryId: cobState?.aliasCountryId})
        if(aliasResponse?.data?.statusCode === 422){
          setIsAliasExists(true);  
        }         
        setStateValue({
          ...state,
          ['newAliasName']: ""
        })
        setValidateAliasOnly(false);
      }
    };

    useEffect(() => {
      setTimeout(() => {
        setIsAliasExists(false);
      }, 2000);
    }, [isAliasExists]);

    const handleShowMore = () => {
      setStateValue({
        ...state,
        ['pageLimit']: state.pageLimit+2
      })
    };

    const closePopover = () => {
      setStateValue({
        ...state,
        ['newAliasName']: "",
        ['pageLimit']: 2
      })
      hidePopover();
    };
      
return (
<Popper
      placement='right-start'
       modifiers={[
        {
          name: "offset",
          options: {
            enabled: true,
            offset: [0, 40],
          },
        },
      ]}
      className='aliasPopover' id={popperId} open={openPopper} anchorEl={anchorEl} >
                        <Box className='aliasPopoverBox'>
                        <Box className='AliasHeader'>
                       <Typography variant='h4'>List of Alias</Typography>

                        <IconButton
                          onClick={closePopover}
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
                      </Box>

                      <Box className='AliasBody'>
                        <Box className='select-favourite-pop-box' mt={2}>
                              {horseAliasLoading && <CircularSpinner />}
                              {(horseAliasList?.length > 0) && <Box className='select-favourite-pop-inner'>
                                <Box className='select-favourite-list'>
                                <Box className='RadioGroupWrapper'>           
                                  <FormControl>
                                    <RadioGroup
                                      aria-labelledby="demo-radio-buttons-group-label"
                                      value={selectedValue}                                      
                                      name="radio-buttons-group"
                                      className='RadioList'
                                      // onChange={() => (isCOBAliasClicked) ? handleChangeDefaultCoB(horseId, row.countryId) : handleChangeDefaultAlias(row.horseName)}
                                      onChange={handleRadioChange}
                                    >   
                                        { 
                                        horseAliasList?.map((row:any, index:number) => (
                                           <Box className='AliasRows' key={index}>
                                            <FormControlLabel className='aliasRadioList' value={(isCOBAliasClicked) ? row?.countryNames+"_"+row?.countryId : row?.horseName} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>} />} label={(isCOBAliasClicked) ? row?.countryNames : row?.horseName}  labelPlacement="start"/>
                                            <Button type='button' className='DeleteBtn'><i className={(row.isDefault) ? 'IconDelete IconDeleteGreyed': 'IconDelete'} onClick={() => (isCOBAliasClicked) ? handleDeleteAliasCoB(horseId, row.countryId) : handleDeleteAliasName(row.horseName)}><img src={Images.Delete} alt="" /></i></Button>
                                            <Button type='button' className='EyeBtn'><i className={(row.isDefault) ? 'IconDelete IconDeleteGreyed': 'IconDelete'} onClick={() => (isCOBAliasClicked) ? handleChangeVisibilityAliasCoB(horseId, row.countryId, row.isActive) : handleChangeVisibilityAliasName(row.horseName, row.isActive)}><img src={(row.isActive) ? Images.Eyeline : Images.Eyeoffline} alt="" /></i></Button>
                                           </Box> 
                                        ))}

                                    </RadioGroup>
                                  </FormControl>
                                  </Box> 
                                
                                  </Box>
                                  <Box className='show-more-button' mt={2}>
                                   <Button type="button" className="ShowMore" onClick={handleShowMore}>Show more </Button>  
                                  </Box>
                              </Box>
                                        }

                        </Box>  



                        {!isCOBAliasClicked && <Box className='search-stallion-pop-box'>
                          <InputLabel>Add an Alias</InputLabel>
                          <TextField name="newAliasName" placeholder='Enter Horse Name' 
                              value={state?.newAliasName}
                              onChange={(e) => handleCreateAlias(horseId, e.target.value)} 
                              className='edit-field' autoComplete="off"                      
                          />
                        </Box>
                        }
                        {isCOBAliasClicked && <Box className='search-stallion-pop-box'>
                        <Box className='edit-field'>
                          <InputLabel>Add an CoB Alias</InputLabel>
                          <Select
                            IconComponent = {KeyboardArrowDownRoundedIcon}
                            defaultValue = {0}
                            onChange={(e: any) => {handleCreateCoBAlias(e.target.value, e.target.text)}}                        
                            className="countryDropdown filter-slct"
                            MenuProps={{
                              anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                              },
                              transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                              },
                              ...MenuPropss
                            }}>
                            <MenuItem className="selectDropDownList countryDropdownList aliascountrydropdown" value={0} disabled><em>Country of Birth</em></MenuItem>
                            {countriesList?.map(({ id, countryName }) => {
                              return (
                                <MenuItem className="selectDropDownList countryDropdownList aliascountrydropdown" value={id} key={id}>
                                  {countryName}
                                </MenuItem>
                              );
                            })}
                        </Select>
                        </Box>
                        </Box>
                        }
                          </Box>
                          
                          {isAliasExists && <Stack className="errorMsg">Alias already exists</Stack>}
                        </Box>

                        <Box className='popper-footer'>
                         <Button type="submit" fullWidth className = "lr-btn" 
                         disabled={!validateAliasOnly}
                         onClick={handleAliasSubmit}
                         > Add </Button>
                        </Box>
                      {/* </Box>
                        </Box> */}
                      </Popper>

)}