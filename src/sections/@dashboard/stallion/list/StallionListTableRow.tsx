import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  Checkbox,
  TableCell,
  Typography,
  MenuItem,
  StyledEngineProvider,
  Divider,
  Box,
  styled,
} from '@mui/material';
// @types
import { Stallion } from 'src/@types/stallion';
// components
import Iconify from 'src/components/Iconify';
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
import CopyToClipboard from 'react-copy-to-clipboard';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import { Images } from 'src/assets/images';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import { toPascalCase } from 'src/utils/customFunctions';
// ----------------------------------------------------------------------

// Tooltip style used in last updated column
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Type defined for StallionTableRow props
type Props = {
  row: Stallion;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  open: boolean;
  stallionModuleAccess?: any;
  setStallionModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover?: any;
  setClickedPopover: React.Dispatch<React.SetStateAction<any>>;
};

export default function StallionTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  open,
  stallionModuleAccess,
  setStallionModuleAccess,
  clickedPopover,
  setClickedPopover
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  // create variable from row props
  const {
    stallionId,
    horseName,
    countryName,
    farmName,
    fee,
    currencyCode,
    isPromoted,
    yearToStud,
    isActive,
    last_updated,
    userName,
    currencySymbol
  } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  // Open the meatball menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const [copied, setCopied] = useState(false);

  // Close the meatball menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // Based on isPromoted and isActive value, display the icon
  let promotediconClass = isPromoted == true ? 'icon-Confirmed-24px' : 'icon-NonPromoted';
  let activeiconClass = isActive == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  // Generate SM stallion profile page
  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;
  let farmUrl = '';
  if (stallionId) {
    farmUrl = `${BaseAPI}stallions/${toPascalCase(horseName)}/${stallionId}/View`;
  }

  // Navigate to the marketing stallion page
  const handleMarketingSearch = () => {
    if (!stallionModuleAccess?.stallion_edit_promoted_page) {
      setClickedPopover(true);
    } else { 
      window.open(PATH_DASHBOARD.marketing.filterbystallionid(stallionId));
    }
    handleCloseMenu();
  };

  // Copy the SM stallion profile page
  const onSuccessfulCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <StyledEngineProvider injectFirst>
      <TableRow hover selected={selected} className="datalist">
        <TableCell>{toPascalCase(horseName)}</TableCell>
        <TableCell align="left">{countryName ? countryName : '--'}</TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {toPascalCase(farmName)}
        </TableCell>
        <TableCell align="left">
          {fee && currencyCode ? currencyCode?.substring(0, 2) : '' + '  '} {(fee && currencySymbol) ? currencySymbol : ''}
          {fee ? fee?.toLocaleString() : '\u00A0 \u00A0 \u00A0\u00A0\u2014'}
        </TableCell>
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip stallionList-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>
                    {toPascalCase(userName)} {toPascalCase(farmName)}{' '}
                    {parseDateAsDotFormat(last_updated)}
                  </p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{parseDateAsDotFormat(last_updated)}</i>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="center">
          <i className={promotediconClass} />
        </TableCell>
        <TableCell align="center">
          <i className={activeiconClass} />
        </TableCell>
        <TableCell align="right" className="table-more-btn">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  className="selectDropDownList"
                  disabled={open}
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  Edit Stallion
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem className="selectDropDownList" disabled={!isPromoted}>
                  {' '}
                  <i className="icon-Link popoverLink">
                    <img src={Images.LinkGray} alt="" />
                  </i>
                  <CopyToClipboard text={farmUrl} onCopy={onSuccessfulCopy}>
                    <Box className={'pointerOnHover'}> {!copied ? 'Copy URL' : 'Copied!'}</Box>
                  </CopyToClipboard>
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem className="selectDropDownList" disabled={!isPromoted} onClick={handleMarketingSearch}>
                  Edit Stallion Page
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  className="selectDropDownList"
                  onClick={() => {
                    window.open(PATH_DASHBOARD.systemActivity.horseFilter(horseName));
                    handleCloseMenu();
                  }}
                >
                  View Activity
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  className="selectDropDownList"
                  onClick={() => {
                    window.open(PATH_DASHBOARD.stallions.analytics(stallionId));
                    handleCloseMenu();
                  }}
                >
                  View Analytics
                </MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>
    </StyledEngineProvider>
  );
}
