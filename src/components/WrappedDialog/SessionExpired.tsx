
import React from 'react'
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    StyledEngineProvider,
    Typography,
    Button
} from '@mui/material';
import { VoidFunctionType } from "src/@types/typeUtils";
import { CustomDialogTitle } from 'src/components/WrappedDialog/WrapperDialog';
// hooks
import useAuth from 'src/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'src/routes/paths';

function SessionExpired(props: any) {  
    const { authentication, setLogout } = useAuth();
    const navigate = useNavigate();
    const { open, onClose } = props;
    const closeAndResetLoginInfo = () => {
        setLogout(true);
        onClose();
        sessionStorage.clear();
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('user');
        window.localStorage.removeItem("fullName");
        window.localStorage.removeItem("roleName");
        window.localStorage.clear();        
        
        
        navigate('auth/login', { replace: true });
    }
      
    return (
        <StyledEngineProvider injectFirst>
            <Dialog
                open={open}
                className="dialogPopup session-expire"
                maxWidth={props.maxWidth || 'sm'}
                sx={props.sx}
            >
                <CustomDialogTitle>
                    {props.title}

                    <IconButton
                        onClick={closeAndResetLoginInfo}
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
                    <Box>
                        <Typography component='p'>{props?.sessionExpireError}</Typography>
                        <Button variant='outlined' className='lr-btn session-btn' onClick = {() => closeAndResetLoginInfo()}> Log in </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </StyledEngineProvider>

    )
}

export default SessionExpired
