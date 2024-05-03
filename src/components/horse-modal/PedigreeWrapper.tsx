import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import './horsewrapper.css';
import { useState } from 'react';
import { useDamAutocompleteQuery, useSireAutocompleteQuery } from 'src/redux/splitEndpoints/horseSplit';
import {
  Box,
  StyledEngineProvider,
} from '@mui/material';
import SelectSireOrDam from '../SelectSireOrDam';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const PedigreeWrapperDialog = (props: any) => {  
  const { 
    open, close, isStallion, isMare, progenyId, prevPedigreeId, generationId, 
    oldPedigreeName, newPedigreeName, setNewPedigreeName, openConfirm, setOpen, 
    getHorseDetails, updatePedigreeData, setUpdatePedigreeData, 
    pedigreeHorseId, setPedigreeHorseId, currentPedigree, setCurrentPedigree,
    isPedigreeHorseSearch, setIsPedigreeHorseSearch, horseType, 
    newHorsePedigreeClicked, setNewHorsePedigreeClicked, reloadPedigreeAfterSaveOrUpdate
  } = props;
  // const horseType = (isStallion) ? 'Stallion' : 'Mare';
/**
 * On change text of Autocomplete for stallion filter
 */
let [stallionFilterData, setStallionFilterData] = useState('');
let [mareFilterData, setMareFilterData] = useState('');
let [isStallionHit, setStallionHit] = useState(false);
let [isMareHit, setMareHit] = useState(false);

const { data } = useSireAutocompleteQuery(stallionFilterData, {skip: (!isStallionHit)});
const stallionFilterOptions = (stallionFilterData == '') ? [] : data;

const { data: mareList } = useDamAutocompleteQuery(stallionFilterData, {skip: (!isMareHit)});
const mareFilterOptions = (mareFilterData == '') ? [] : mareList;
const filterData = (isStallion) ? stallionFilterOptions : mareFilterOptions;
const [sireId, setSireId] = useState('');
const [damId, setDamId] = useState('');

  return (
    <StyledEngineProvider injectFirst>
      <Dialog
        open={props.open}
        className="dialogPopup selecthorseModal"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={close}
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

        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>          
            <Box py={2} mt={1} className='edit-section'>
            <Box className='FormGroup'>
              <Box className='edit-field'>
                <Box className='CustomAutoComplete-Wrapper' mb={4}>
                  { isStallion ?
                    <SelectSireOrDam  
                      progenyId={progenyId} prevPedigreeId={prevPedigreeId} param={"Sire"} 
                      generationId={generationId} close={close} setOpen={setOpen} 
                      getHorseDetails={getHorseDetails} openConfirm={openConfirm} 
                      newPedigreeName={newPedigreeName} setNewPedigreeName={setNewPedigreeName} 
                      updatePedigreeData={updatePedigreeData} setUpdatePedigreeData={setUpdatePedigreeData} 
                      pedigreeHorseId={pedigreeHorseId} setPedigreeHorseId={setPedigreeHorseId} 
                      currentPedigree={currentPedigree} setCurrentPedigree={setCurrentPedigree} 
                      isPedigreeHorseSearch={isPedigreeHorseSearch} setIsPedigreeHorseSearch={setIsPedigreeHorseSearch}
                      horseType={horseType} newHorsePedigreeClicked={newHorsePedigreeClicked} 
                      setNewHorsePedigreeClicked={setNewHorsePedigreeClicked}
                      reloadPedigreeAfterSaveOrUpdate={reloadPedigreeAfterSaveOrUpdate}
                    />
                  :
                    <SelectSireOrDam  
                      progenyId={progenyId} prevPedigreeId={prevPedigreeId} param={"Dam"} 
                      generationId={generationId} close={close} setOpen={setOpen} 
                      getHorseDetails={getHorseDetails} openConfirm={openConfirm} 
                      newPedigreeName={newPedigreeName} setNewPedigreeName={setNewPedigreeName} 
                      updatePedigreeData={updatePedigreeData} setUpdatePedigreeData={setUpdatePedigreeData} 
                      pedigreeHorseId={pedigreeHorseId} setPedigreeHorseId={setPedigreeHorseId} 
                      currentPedigree={currentPedigree}  setCurrentPedigree={setCurrentPedigree} 
                      isPedigreeHorseSearch={isPedigreeHorseSearch} setIsPedigreeHorseSearch={setIsPedigreeHorseSearch}
                      horseType={horseType} newHorsePedigreeClicked={newHorsePedigreeClicked} 
                      setNewHorsePedigreeClicked={setNewHorsePedigreeClicked}
                      reloadPedigreeAfterSaveOrUpdate={reloadPedigreeAfterSaveOrUpdate}
                    />
                  }                
                </Box>
                </Box>              
              </Box> 
            </Box>
          
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
