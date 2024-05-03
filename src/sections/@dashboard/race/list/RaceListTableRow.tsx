import { useState } from 'react';
// @mui
import {
  TableRow,
  Checkbox,
  TableCell,
  Typography,
  MenuItem,
  StyledEngineProvider,
  Divider,
} from '@mui/material';
// @types
import { Races } from 'src/@types/races';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import { toPascalCase } from 'src/utils/customFunctions';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

//types
type Props = {
  row: Races;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  countriesList: any;
  raceAndRunnerModuleAccess?: any;
  setRaceAndRunnerModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover?: any;
  setClickedPopover?: React.Dispatch<React.SetStateAction<any>>;
};

export default function RaceListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  countriesList,
  raceAndRunnerModuleAccess,
  setRaceAndRunnerModuleAccess
}: Props) {
  const navigate = useNavigate();
  const {
    id,
    raceId,
    class: classType,
    racestatus,
    countryName,
    totalRunner,
    raceName,
    venue,
    raceDate,
    raceUuid,
    countryCode,
    isEligible,
    racenumber,
    noOfRaces,
    venueId,
    country,
    name,
    trackType,
    apiStatus,
    runners,
    isImported,
    trackTypeId,
    raceTypeId,
    displayName,
    raceClassId,
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

  // Handle redirection to runners page
  const handleRedirectToRunnerFilter = () => {
    if (!raceAndRunnerModuleAccess?.raceAndRunner_list) {
      setResetOrResendPopover(true);
    } else {
      navigate(PATH_DASHBOARD.runnerdetails.filter(raceUuid));
    }
  };

  let ImportediconClass = isEligible == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  return (
    <StyledEngineProvider injectFirst>
      {/* Race row in table */}
      <TableRow hover selected={selected}>
        <TableCell align="left" size="small">
          {parseDate(raceDate)}
        </TableCell>
        <TableCell align="left">{racenumber}</TableCell>
        <TableCell align="left">{toPascalCase(venue) ? toPascalCase(venue) : '--'}</TableCell>
        <TableCell align="left">{countryCode}</TableCell>
        <TableCell align="left" className="raceTableName">
          <span>{toPascalCase(raceName)}</span>
        </TableCell>
        <TableCell align="left">{classType ? toPascalCase(classType) : '--'}</TableCell>
        <TableCell align="left">{trackType ? toPascalCase(trackType) :'--'}</TableCell>
        <TableCell align="left">{racestatus ? toPascalCase(racestatus) : '--'}</TableCell>
        <TableCell align="left">
          {totalRunner ? <u style={{ cursor: 'pointer' }} onClick={handleRedirectToRunnerFilter}>
            {totalRunner}
          </u> : '--'}
        </TableCell>
        <TableCell align="center">
          <i className={ImportediconClass} />
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
                  Edit Race
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={handleRedirectToRunnerFilter} disabled={totalRunner > 0 ? false : true}>View Runners</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem disabled>View RAW data</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.systemActivity.raceNameFilter(raceName));
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
      {/* End Race row in table */}
    </StyledEngineProvider>
  );
}
