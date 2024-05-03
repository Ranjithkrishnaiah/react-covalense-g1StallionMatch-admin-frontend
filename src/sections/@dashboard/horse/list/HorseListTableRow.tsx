import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  TableCell,
  Typography,
  MenuItem,
  StyledEngineProvider,
  Divider,
  styled,
  Box,
} from '@mui/material';
// @types
import { Horse } from 'src/@types/horse';
import { TableMoreMenu } from 'src/components/table';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { toPascalCase, displayStringInShort } from 'src/utils/customFunctions';
import { Images } from 'src/assets/images';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router';
// ----------------------------------------------------------------------

// Tooltip style used in Created column
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Type defined for HorseListTableRow props
type Props = {
  row: Horse;
  selected: boolean;
  onEditRow: VoidFunction;
  gotoRace?: any;
  gotoDashboard?: any;
  isProgenyPage?: boolean;
};

export default function HorseListTableRow({
  row,
  selected,
  onEditRow,
  gotoRace,
  gotoDashboard,
  isProgenyPage,
}: Props) {
  const {
    id,
    horseId,
    horseName,
    gender,
    yob,
    countryName,
    colourId,
    gelding,
    isThoroughbred,
    isLocked,
    createdOn,
    progeny,
    runner,
    stakes,
    isVerified,
    breeding,
    sex,
    userName,
    horseAlias,
    sireName,
    damName,
  } = row;

  // Based on runner, stakes, isVerified value, display the icon
  let runnerClass = runner > 0 ? 'icon-Confirmed-24px' : 'icon-NonPromoted';
  let stakesClass = stakes > 0 ? 'icon-Confirmed-24px' : 'icon-NonPromoted';
  let verifiedClass = isVerified == true ? 'icon-Confirmed-24px' : 'icon-NonPromoted';

  const navigate = useNavigate();
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  // Open the meatball menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // Close the meatball menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // Based on isVerified value, add the class
  let nameStatusClass = 'name-active';
  if (!isVerified) {
    nameStatusClass = 'name-suspended';
  } else if (
    yob === '' ||
    yob === 0 ||
    countryName === '' ||
    colourId === 0 ||
    sireName === '' ||
    damName === ''
  ) {
    nameStatusClass = 'name-closed';
  }

  return (
    <StyledEngineProvider injectFirst>
      <TableRow hover selected={selected} className="datalist">
        <TableCell align="left" className={nameStatusClass}>
          <HtmlTooltip
            className="tableTooltip"
            style={{ cursor: 'pointer' }}
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>{toPascalCase(horseName)}</p>
                </Box>
              </React.Fragment>
            }
          >
            <p>{toPascalCase(displayStringInShort(horseName))}</p>
          </HtmlTooltip>
          {horseAlias?.length > 0 && (
            <Typography style={{ float: 'right' }}>
              <HtmlTooltip
                className="tableTooltip"
                style={{ cursor: 'pointer' }}
                title={
                  <React.Fragment>
                    <Box className="tooltipPopoverBody">
                      {horseAlias.map((aliasInfo: any, index: number) => (
                        <p key={index}>{toPascalCase(aliasInfo?.horseName)}</p>
                      ))}
                    </Box>
                  </React.Fragment>
                }
              >
                <i className="user-ico-right">
                  <img src={Images.AliasIcon} alt="" />
                </i>
              </HtmlTooltip>
            </Typography>
          )}
        </TableCell>
        <TableCell align="left">{sex}</TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {yob ? yob : '--'}
        </TableCell>
        <TableCell align="left">{countryName}</TableCell>
        <TableCell align="left">
          {toPascalCase(sireName)}
          <br />
          {toPascalCase(damName)}
        </TableCell>
        <TableCell align="left">
          <HtmlTooltip
            className="tableTooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>
                    {userName} {parseDateAsDotFormat(createdOn)}
                  </p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{parseDateAsDotFormat(createdOn)}</i>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="center">
          <i className={runnerClass} />
        </TableCell>
        <TableCell align="center">
          <i className={stakesClass} />
        </TableCell>
        <TableCell align="center">
          <i className={verifiedClass} />
        </TableCell>
        {!isProgenyPage && <TableCell align="left">{progeny}</TableCell>}
        <TableCell align="right" className="table-more-btn">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {!isLocked && (
                  <MenuItem
                    onClick={() => {
                      onEditRow();
                      handleCloseMenu();
                    }}
                  >
                    Edit Horse
                  </MenuItem>
                )}
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.horsedetails.progeny(horseId), '_blank');
                  }}
                >
                  View Progeny
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.race.horseIdfilter(horseId), '_blank');
                  }}
                  disabled={!runner}
                >
                  View Races
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.systemActivity.horseFilter(horseName));
                    handleCloseMenu();
                  }}
                >
                  View Activity
                </MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>
    </StyledEngineProvider>
  );
}
