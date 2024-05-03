import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider, Divider, Box, styled, Stack } from '@mui/material';
// @types
import { Reports } from '../../../../@types/reports';
// components
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { Images } from 'src/assets/images';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));



type Props = {
  row: Reports;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
};

export default function ReportsListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();

  const { id, farmName, countryName, stateName, totalStallions, promoted, users, createdOn, isImported } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  function parseDate(dateToParse: string) {

    let parsedDate = new Date(dateToParse)
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, "0")}.${(parsedDate.getMonth() + 1).toString().padStart(2, "0")}.${parsedDate.getFullYear()}`
    return formattedDate;
  }
  let ImportediconClass = (isImported == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted';
  return (
    <StyledEngineProvider injectFirst>
      <TableRow hover selected={selected}>
        <TableCell align="left">123456</TableCell>
        <TableCell align="left">{parseDate(createdOn)}</TableCell>
        <TableCell align="left">Matthew Ennis</TableCell>
        <TableCell align="left">matthew@stallionmatch.com</TableCell>
        <TableCell align="left">

          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              <React.Fragment>
                <Box className='tooltipPopoverBody'>
                  <p>La Lova (2016, AUS)</p>
                </Box>
              </React.Fragment>
            }
          >
            <i className='emailNote'><u>Broodmare Affinity Report</u></i>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="left">{countryName}</TableCell>
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip reportlist-tooltip"
            title={
              <React.Fragment>
                <Box className='tooltipPopoverBody'>
                  <p>Subtotal: US$250 <br />
                    Discount: - US$0 <br />
                    Total: US$250 <br />
                    Gateway: PayPal</p>
                </Box>
              </React.Fragment>
            }
          >
            <i className='emailNote'><u>US$250</u></i>
          </HtmlTooltip>

        </TableCell>
        <TableCell align="center">

          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip reportlist-tooltip"
            title={
              <React.Fragment>
                <Box className='tooltipPopoverBody'>
                  <p>Ordered: 22.02.2021 3.51pm    <br />
                    Initiated: 22.02.2021 3.51pm  <br />
                    Completed: 22.02.2021 4.02pm  <br />
                    Delivered: 22.02.2021 4.03pm
                  </p>
                </Box>
              </React.Fragment>
            }
          >
            <i className='emailNote'><u>Ordered</u></i>
          </HtmlTooltip>


        </TableCell>
        <TableCell align="left">
          <Stack className='icon-link-box'>
            {/* <img src={Images.Link} title='stallions' /> */}
            <i className='icon-Link-green'></i>
          </Stack>
        </TableCell>


        <TableCell align="right">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  View Details
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem
                >
                  Resend Report
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem
                >
                  Activate Link
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem
                >
                  Deactivate Link
                </MenuItem>


              </>
            }
          />
        </TableCell>
      </TableRow>
    </StyledEngineProvider>
  );
}


