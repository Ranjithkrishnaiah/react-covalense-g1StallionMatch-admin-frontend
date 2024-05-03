import { useState } from 'react';
import { useNavigate } from 'react-router';
// @mui
import {
  TableRow,
  TableCell,
  Typography,
  MenuItem,
  StyledEngineProvider,
  Divider,
  styled,
  Stack,
} from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import React from 'react';
import { toPascalCase } from 'src/utils/customFunctions';
import { PATH_DASHBOARD } from 'src/routes/paths';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

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
  raceAndRunnerModuleAccess?: any;
  setRaceAndRunnerModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover?: any;
  setClickedPopover?: React.Dispatch<React.SetStateAction<any>>;
};

export default function RunnerListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  raceAndRunnerModuleAccess,
  setRaceAndRunnerModuleAccess
}: Props) {
  const navigate = useNavigate();
  const {
    position,
    raceName,
    raceDate,
    raceId,
    raceUuid,
    class: classType,
    horseName,
    countryCode,
    yob,
    sireName,
    damName,
    accuracyRating,
  } = row;
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  const [resetOrResendPopover, setResetOrResendPopover] = useState(false);
  // handle popover
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // close popover
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // Handle redirection to race page
  const handleRedirectToRaceFilter = () => {
    if (!raceAndRunnerModuleAccess?.raceAndRunner_list) {
      setResetOrResendPopover(true);
    } else {
      // navigate(PATH_DASHBOARD.race.raceFilter(raceUuid));
      window.open(PATH_DASHBOARD.race.raceFilter(raceUuid), '_blank');
    }
  };

  // parse the date
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  // Show color based on rating
  const runnersRatingColor = () => {
    let className = 'darkred';
    if (accuracyRating === 'Poor') {
      className = 'darkred';
    }
    if (accuracyRating === 'Good') {
      className = 'brown';
    }
    if (accuracyRating === 'Excellent') {
      className = 'green';
    }
    if (accuracyRating === 'Outstanding') {
      className = 'darkGreen';
    }

    return className;
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* Runner row in table */}
      <TableRow hover selected={selected}>
        <TableCell align="left">{raceDate ? parseDate(raceDate) : '--'}</TableCell>
        <TableCell align="left" className="runnerNameListTable">
          <HtmlTooltip
            className="tableListtooltip"
            title={
              <React.Fragment>
                <Stack className="tableListtooltipBody">
                  <Typography component="p">{raceName ? raceName : '--'}</Typography>
                </Stack>
              </React.Fragment>
            }
          >
            <span className="href-link">{raceName ? raceName : '--'}</span>
          </HtmlTooltip>
        </TableCell>
        <TableCell align="left">
          {raceId ? <u onClick={handleRedirectToRaceFilter}>{raceId}</u> : '--'}
        </TableCell>
        <TableCell align="left">{toPascalCase(classType ? classType : '--')}</TableCell>
        <TableCell align="left">
          <span className="horse-name-runner">
            {toPascalCase(horseName)} {`(${yob}, ${countryCode})`}
          </span>
        </TableCell>
        <TableCell align="left">{toPascalCase(sireName)}</TableCell>
        <TableCell align="left">{toPascalCase(damName)}</TableCell>
        <TableCell align="left">{position}</TableCell>
        <TableCell align="left" className="accuracy-icon-runner">
          <span>
            <i className={`accuracy-circle ${runnersRatingColor()}`} />
          </span>
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
                  Edit Runner
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={handleRedirectToRaceFilter}>View Race</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem disabled>View RAW data</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    // window.open(PATH_DASHBOARD.systemActivity.horseFilter(horseName));
                    window.open(PATH_DASHBOARD.systemActivity.runnerNameFilter(horseName));
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
      {/* Runner row in table */}
    </StyledEngineProvider>
  );
}
