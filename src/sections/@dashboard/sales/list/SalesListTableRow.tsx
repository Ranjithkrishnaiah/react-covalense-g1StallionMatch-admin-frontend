import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  TableRow,
  TableCell,
  MenuItem,
  StyledEngineProvider,
  Divider,
  Box,
} from '@mui/material';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Images } from 'src/assets/images';
import { toPascalCase } from 'src/utils/customFunctions';
import { DeleteConversationWrapperDialog } from 'src/components/sales-modal/DeleteConversationWrapper';

export default function SalesListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  salesModuleAccess,
  setApiStatus,
  apiStatusMsg,
  setApiStatusMsg,
}: any) {
  const {
    id,
    countryName,
    salesName,
    salesCode,
    startDate,
    salesCompanyName,
    salesId,
    status,
    statusId,
    totalLots,
    verifiedLots,
    
  } = row;
  const navigate = useNavigate();

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);
  const [copied, setCopied] = useState(false);

  // handle popover
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // Close popover
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // close delete sale popup
  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
  };

  // open delete sale popup
  const handleOpenDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(true);
  };

  // Parse date
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  // Handle success and error toast message
  const handleDeleteResponse = (res: any) => {
    if (res.error) {
      setApiStatusMsg({ status: 422, message: res?.error?.data?.message });
      setApiStatus(true);
    } else {
      setApiStatusMsg({ status: 201, message: res?.data?.message });
      setApiStatus(true);
    }
  };

  // Show message on copy link
  const onSuccessfulCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // console.log(salesModuleAccess,'salesModuleAccess')

  return (
    <StyledEngineProvider injectFirst>
      {/* Sales row in table */}
      <TableRow selected={selected}>
        <TableCell align="left">{salesId}</TableCell>
        <TableCell align="left">{salesName}</TableCell>
        <TableCell align="left">{salesCompanyName}</TableCell>
        <TableCell align="left">{countryName}</TableCell>
        <TableCell align="left">{totalLots ? totalLots : '--'}</TableCell>
        <TableCell align="left">{parseDate(startDate)}</TableCell>
        <TableCell align="left">{verifiedLots ? verifiedLots + '%' : '--'}</TableCell>
        <TableCell align="left">{toPascalCase(status ? status : '--')}</TableCell>
        <TableCell align="center">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem disabled={statusId === 4 ? salesModuleAccess?.sales_edit_existing_sale === false ? true : true : salesModuleAccess?.sales_edit_existing_sale === false ? true : false} onClick={() => navigate(`/dashboard/sales/viewlots/${id}`)}>
                  View Lots
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                  disabled={salesModuleAccess?.sales_edit_existing_sale === false ? true : false}
                >
                  View Details
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem disabled={!salesModuleAccess?.sales_edit_existing_sale === false ? true : false} onClick={handleOpenDeleteConversationWrapper}>Delete</MenuItem>
                {/* <Divider style={{ margin: '0' }} /> */}
                {/* <MenuItem className="selectDropDownList" disabled={statusId !== 1 && statusId !== 5}>
                  <i className="icon-Link popoverLink">
                    <img src={Images.LinkGray} alt="" />
                  </i>
                  <CopyToClipboard text="" onCopy={onSuccessfulCopy}>
                    <Box className={'pointerOnHover'}> {!copied ? 'Copy Link' : 'Copied!'} </Box>
                  </CopyToClipboard>
                </MenuItem> */}
                {/* //statusId !== 1 && statusId !== 5 */}
              </>
            }
          />
        </TableCell>
      </TableRow>
      {/* Sales row in table */}

      {/* Delete sales modal */}
      <DeleteConversationWrapperDialog
        title="Are you sure?"
        row={row}
        open={openDeleteConversationWrapper}
        close={handleCloseDeleteConversationWrapper}
        handleDeleteResponse={handleDeleteResponse}
      />
    </StyledEngineProvider>
  );
}
