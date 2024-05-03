import { useState } from 'react';
// mui
import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Box,
    StyledEngineProvider,
} from '@mui/material';

import '../horse-modal/horsewrapper.css';
import HorseAutoCompleteWithAddNew from '../HorseAutoCompleteWithAddNew';
import SireAutoCompleteWithAddNew from '../SireAutoCompleteWithAddNew';
import DamAutoCompleteWithAddNew from '../DamAutoCompleteWithAddNew';

export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: '#E2E7E1',
}));

export const SalesLotsHorseWrapperDialog = (props: any) => {
    const { open, close, setOpen, isStallion, salesLotsDetails, handleVerifyAndNext } = props;
    const [state, setStateValue] = useState<any>({});


    const handleClose = ()=>{
        setStateValue('')
        close();
       
    }

    // Set particular horse value based on isStallion state
    const handleSelectNew = () => {
        close();
        if (isStallion === 'Dam') {
            setStateValue({
                isVerifiedDam: true,
                ...state,
            })
        }
        if (isStallion === 'Sire') {
            setStateValue({
                isVerifiedSire: true,
                ...state,
            })
        }
        handleVerifyAndNext(state, isStallion);
    }

    return (
        <StyledEngineProvider injectFirst>
            <Dialog
                open={props.open}
                className="dialogPopup selecthorseModal"
                maxWidth={props.maxWidth || 'sm'}
                sx={props.sx}
            >
                {/* Modal title */}
                <CustomDialogTitle>
                    {props.title}
                    <IconButton
                        onClick={handleClose}
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
                {/* End Modal title */}

                {/* Modal content */}
                <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
                    <Box py={2} mt={1} className='edit-section'>
                        <Box className='FormGroup'>
                            <Box className='edit-field sales-edit-horse'>
                                <Box className='CustomAutoComplete-Wrapper'>

                                    {/* Horse Autocomplete component */}
                                    {isStallion === 'Horse' &&
                                        <HorseAutoCompleteWithAddNew
                                            searchedName={state?.horseName ? state?.horseName : salesLotsDetails?.horseName}
                                            setStateValueId={(value: any) => setStateValue({ ...state, horseId: value.horseId, horseName: value.horseName })}
                                            pageType={'Jockey'}
                                            isEdit={true}
                                            isOpen={open}
                                            close={close} setOpen={setOpen}
                                            handleSelectNew={handleSelectNew}
                                        />
                                    }

                                    {/* Sire Autocomplete component */}
                                    {isStallion === 'Sire' &&
                                        <SireAutoCompleteWithAddNew
                                            searchedName={state?.sireName ? state?.sireName : salesLotsDetails?.sireName}
                                            setStateValueId={(value: any) => setStateValue({
                                                ...state,
                                                sireId: value.id,
                                                sireName: value.horseName,
                                                sireCob: value.countryCode,
                                                sireYob: value.yob,
                                                sireColour: value.colourName,
                                                sireSireId: value.sirePedigreeId,
                                                sireSireName: value.sireName,
                                                sireSireYob: value.sireyob,
                                                sireSireCob: value.sirecountry,
                                                sireSireColour: value.sireColourName,
                                                isVerifiedSire: true
                                            })}
                                            pageType={'Jockey'}
                                            isEdit={true}
                                            isOpen={open}
                                            close={close} setOpen={setOpen}
                                            handleSelectNew={handleSelectNew}
                                        />
                                    }

                                    {/* Dam Autocomplete component */}
                                    {isStallion === 'Dam' &&
                                        <DamAutoCompleteWithAddNew
                                            searchedName={state?.damName ? state?.damName : salesLotsDetails?.damName}
                                            setStateValueId={(value: any) => setStateValue({
                                                ...state,
                                                damId: value.id,
                                                damName: value.horseName,
                                                sireCob: value.countryCode,
                                                damYob: value.yob,
                                                damColour: value.colourName,
                                                damSireId: value.sirePedigreeId,
                                                damSireName: value.sireName,
                                                damSireYob: value.sireyob,
                                                damSireCob: value.sirecountry,
                                                damSireColour: value.sireColourName,
                                                isVerifiedDam: true
                                            })}
                                            pageType={'Jockey'}
                                            isEdit={true}
                                            isOpen={open}
                                             close={close} setOpen={setOpen}
                                            handleSelectNew={handleSelectNew}
                                        />
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                {/* End Modal content */}
            </Dialog>
        </StyledEngineProvider>
    );
};
