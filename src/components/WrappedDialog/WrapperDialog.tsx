import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  StyledEngineProvider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import './dialogPopup.css';
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const WrapperDialog = (props: any) => {
  const [Reset, setReset] = React.useState(false);
  let titleSx: any = undefined;
  let iconSx: any = undefined;
  let dialogClassName: any = undefined;
  let setOpenStallionModal: any = undefined;

  if ('dialogClassName' in props) {
    dialogClassName = props.dialogClassName;
  }
  if ('titleSx' in props) {
    titleSx = props.titleSx;
  }
  if ('iconSx' in props) {
    iconSx = props.iconSx;
  }
  if ('setOpenStallionModal' in props) {
    setOpenStallionModal = props.setOpenStallionModal;
  }

  const closeAndReset = () => {
    props.onClose();
    setReset(true);
  };

  const handleOpenParentPopup = () => {
    closeAndReset();
    setOpenStallionModal(true);
  };

  return (
    <StyledEngineProvider injectFirst>
      <Dialog open={props.open} className={dialogClassName || 'dialogPopup'}>
        <CustomDialogTitle sx={titleSx}>
          <div className="popup-heading">
            <i
              className="icon-Chevron-left"
              onClick={setOpenStallionModal ? handleOpenParentPopup : closeAndReset}
              style={
                dialogClassName?.split(' ').length === 2 &&
                dialogClassName?.split(' ')[1] === 'showBackIcon'
                  ? { display: 'block', cursor: 'pointer' }
                  : { display: 'none' }
              }
            />
            {props.title}
          </div>
          <IconButton
            aria-label="close"
            onClick={closeAndReset}
            sx={
              iconSx || {
                position: 'absolute',
                right: 12,
                width: 36,
                height: 36,
                top: 18,
                color: '#1D472E',
              }
            }
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          {'changeTitleTo' in props
            ? props.body(
                props.title,
                closeAndReset,
                props.openOther,
                props.changeTitleTo,
                props.setIsFirstLogin,
                props.setFarmAdminFirstLogin,
                Reset,
                setReset,
                props.hash,
                props.emailValue,
                props.setEmailValue,
                props.isAgreed,
                props.fullName,
                props.InvitedEmail,
                props.setIsAgreed,
                props.isLoginOpen,
                props.closeLogin
              )
            : 'OFP' in props
            ? props.body(
                closeAndReset,
                props.openOther,
                props.OFP,
                props.firstLogin,
                props.farmAdminFirstLogin,
                Reset,
                setReset,
                props?.setRegistrationTitle,
                props?.forwardLinkObj
              )
            : 'tableId' in props
            ? props.body(
                closeAndReset,
                props.tableId,
                props.itemName,
                props.itemId,
                Reset,
                setReset,
                props.farmId,
                props.customMessage
              )
            : 'reportId' in props
            ? 
              props.body(
                closeAndReset,
                props.openOther,
                props.reportId,
                Reset,
                setReset,
                props.formId,
                props.open,
                props.title,
                props.currencyCode,
                props.price,
                props.cartInfo,
                props.deleteResponse,
                props.viewStallionsAnalysed,
                props.setViewStallionsAnalysed
              )
            : 'param' in props
            ? props.body(closeAndReset, props.param, Reset, setReset)
            : 'parameter' in props
            ? props.body(closeAndReset, props.parameter, Reset, setReset)
            : 'name' in props
            ? props.body(
                closeAndReset,
                props.name,
                props.email,
                props.securityKey,
                Reset,
                setReset,
                props.openSuccessUpdate,
                props.setOpenSuccessUpdate
              )
            : 'changeTitleTest' in props
            ? props.body(
                props.title,
                props.onClose,
                props.openOther,
                props.changeTitleTest,
                props.setDialogClassName,
                props.handleSelectedStallions,
                props.openPromoteStallion,
                Reset,
                setReset
              )
            : 'propDetails' in props
            ? props.body(closeAndReset, props.propDetails, Reset, setReset)
            : 'openSuccess' in props
            ? props.body(props.title, closeAndReset, props.openSuccess, Reset, setReset)
            : 'link' in props
            ? props.body(props.onClose, props.link)
            : 'createStallion' in props
            ? props.body(
                props.title,
                closeAndReset,
                props.createStallion,
                props.isSubmitStallion,
                props.isSubmitMare,
                props.closeAddMare,
                Reset,
                setReset
              )
            : 'OpenPromote' in props
            ? props.body(
                props.title,
                props.onClose,
                props.openOther,
                props.OpenPromote,
                props.selectedStallionIds,
                Reset,
                setReset
              )
            : 'promoteStallionType' in props
            ? props.body(
                props.title,
                props.onClose,
                props.promoteStallionType,
                props.selectedStallionIds,
                Reset,
                setReset,
                props.open,
                props.stallionId,
                props.onCloseSuccess,
                props.isEdit
              )
            : 'expiryDate' in props
            ? props.body(
                closeAndReset,
                props.promoted,
                props.nominated,
                props.stallionName,
                props.stallionId,
                props.closeConfirmPopupFuture,
                props.expiryDate,
                props.open,
                props.chosenDate,
                Reset,
                setReset
              )
            : 'StallionName' in props
            ? props.body(
                closeAndReset,
                props.StallionName,
                props.ExpiryDate,
                props.ChangeTitleRemove,
                Reset,
                setReset,
                props.stallionId
              )
            : 'updateServiceFee' in props
            ? props.body(
                props.open,
                props.title,
                closeAndReset,
                props.stallionName,
                props.stallionId,
                props.updateServiceFee,
                Reset,
                setReset,
                props.maxExpiryDate,
                props.onCloseNominated
              )
            : 'alreadyAvailable' in props
            ? props.body(props.title, props.onClose, props.alreadyAvailable, Reset, setReset)
            : 'setBoostStallionDialogTitle' in props
            ? props.body(
                props.onClose,
                props.setBoostStallionDialogTitle,
                props.boostStallionDialogTitle,
                props.boostStallionDialog,
                props.apiStatus,
                props.setApiStatus,
                props.apiStatusMsg,
                props.setApiStatusMsg
              )
            : 'confirmYourAcccount' in props
            ? props.body(
                props.onClose,
                props.confirmYourAcccount,
                props.apiStatus,
                props.setApiStatus,
                props.apiStatusMsg,
                props.setApiStatusMsg
              )
            : 'invitationId' in props
            ? props.body(
                props.onClose,
                props.invitationId,
                props.userName,
                props.userImage,
                props.email,
                Reset,
                setReset
              )
            : 'activateNomination' in props
            ? props.body(
                props.title,
                closeAndReset,
                props.stallionName,
                props.stallionId,
                props.activateNomination,
                props.open,
                Reset,
                setReset,
                props.chosenDate,
                props.maxExpiryDate,
                props.onCloseNominated
              )
            : 'addAFarm' in props
            ? props.body(closeAndReset, Reset, setReset)
            : 'resetPaymentModal' in props
            ? props.body(props.title, props.onClose, props.resetPaymentModal)
            : 'openSuccessForm' in props
            ? props.body(
                closeAndReset,
                props.openSuccessForm,
                props.changeTheTitle,
                props.getFarmName,
                props.stallionId,
                props.horseName,
                props.farmId,
                props.contactForm,
                Reset,
                setReset
              )
            : 'unregisteredSuccess' in props
            ? props.body(
                closeAndReset,
                props.openRegister,
                props.unregisteredSuccess,
                props.farmNameSelected,
                Reset,
                setReset
              )
            : 'openNominationMessage' in props
            ? props.body(
                closeAndReset,
                props.openNominationMessage,
                props.openAcceptOfferFunction,
                props.nominationOfferData,
                props.receipentNameVar,
                props.setPatchParams,
                props.openOfferReceived,
                props.respondedValueState,
                props.setRespondedValueState,
                props.subject,
                props.loaderInProgress,
                props.setLoaderInProgress,
                props.setIsFileUpload,
                Reset,
                setReset
              )
            : 'patchParams' in props
            ? props.body(
                closeAndReset,
                props.patchParams,
                props.offerPrice,
                props.respondedValueState,
                props.setRespondedValueState,
                props.setLoaderInProgress,
                Reset,
                setReset
              )
            : 'messageFarmSearch' in props
            ? props.body(
                closeAndReset,
                props.getSelectedFarm,
                props.messageFarmSearch,
                Reset,
                setReset
              )
            : 'farmId' in props
            ? props.body(
                closeAndReset,
                props.farmId,
                props.openNominationWrapper,
                props.selectedFarmHeader,
                props.setLoaderInProgress,
                Reset,
                setReset
              )
            : 'subjectForMessage' in props
            ? props.body(
                closeAndReset,
                props.subjectForMessage,
                props.newMessageForm,
                props.handleSelected,
                props.setMessageViewOptions,
                props.setMessageViewOptionsFiltered,
                props.setNewMessageCreated,
                props.setLoaderInProgress,
                Reset,
                setReset
              )
            : 'pageTitle' in props
            ? props.body(closeAndReset, props.pageTitle, props.setConfirm, Reset, setReset)
            : 'deleteFarmId' in props
            ? props.body(
                closeAndReset,
                props.deleteFarmId,
                props.setSelected,
                props.setSelectedTile,
                props.apiStatus,
                props.setApiStatus,
                props.apiStatusMsg,
                props.setApiStatusMsg,
                Reset,
                setReset
              )
            : 'promotionalId' in props
            ? props.body(closeAndReset, Reset, setReset, props.promotionalId, props.stallionId)
            : 'reportUrl' in props
            ? props.body(props.onClose, props.title, props.reportUrl)
            : 'userEmail' in props
            ? props.body(props.onClose, props.userEmail)
            : 'farmID' in props
            ? props.body(props.onClose, Reset, setReset, props.farmID, props.open)
            : props.body(props.onClose, Reset, setReset)}
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};
