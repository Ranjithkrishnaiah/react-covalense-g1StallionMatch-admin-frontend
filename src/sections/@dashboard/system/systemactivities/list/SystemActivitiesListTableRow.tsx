import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { TableRow, TableCell, StyledEngineProvider, Box, styled, Stack } from '@mui/material';
import 'src/sections/@dashboard/css/list.css';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { toPascalCase } from 'src/utils/customFunctions';
import { Interweave } from 'interweave';

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
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
};

export default function SystemActivitiesListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
}: Props) {
  const theme = useTheme();
  const { eventId, activity, createdOn, result, sourceIp, userName, userEmail, userAgent } = row;
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  //Formats the date
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  let ImportediconClass = (result == 'Success' || result == 'Initiated') ? 'icon-Confirmed-24px' : 'icon-Incorrect';
  return (
    <StyledEngineProvider injectFirst>
      {/* Tabel row statrs  */}
      <TableRow hover selected={selected}>
        {/* Event ID cell  */}
        <TableCell align="left">{eventId}</TableCell>
        {/* Created date cell  */}
        <TableCell align="left">{parseDate(createdOn)}</TableCell>
        {/* User Name cell  */}
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>[{userEmail}]</p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{toPascalCase(userName)}</i>
          </HtmlTooltip>
        </TableCell>
        {/* Source Ip cell  */}
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>{userAgent}</p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{sourceIp ? sourceIp : '--'}</i>
          </HtmlTooltip>
        </TableCell>
        {/* Activity cell  */}
        <TableCell align="left">
          <Interweave content={activity} />
        </TableCell>
        {/* Result cell  */}
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              result == 'Success' || result == 'Initiated' ? (
                ''
              ) : (
                <React.Fragment>
                  <Box className="tooltipPopoverBody">
                    <p>ErrorMessage/Reason</p>
                  </Box>
                </React.Fragment>
              )
            }
          >
            <Stack className="imported-icon-center" sx={{ cursor: 'pointer' }}>
              <i className={ImportediconClass} />
            </Stack>
          </HtmlTooltip>
        </TableCell>
      </TableRow>
      {/* End of table row  */}
    </StyledEngineProvider>
  );
}
