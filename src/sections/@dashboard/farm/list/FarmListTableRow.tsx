import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, TableCell, MenuItem, StyledEngineProvider, Divider } from '@mui/material';
// @types
import { Farm } from 'src/@types/farm';
// components
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { toPascalCase } from 'src/utils/customFunctions';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------
// Props type
type Props = {
  row: Farm;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  farmModuleAccess?: any;
  setFarmModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover?: any;
  setClickedPopover?: React.Dispatch<React.SetStateAction<any>>;
};

export default function FarmListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  farmModuleAccess,
  setFarmModuleAccess,
  clickedPopover,
  setClickedPopover,
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mergedPopover, setMergedPopover] = useState(false);
  // row data from props
  const {
    id,
    farmName,
    countryName,
    stateName,
    totalStallions,
    promoted,
    users,
    createdOn,
    farmId,
    modifiedOn,
    isActive,
    isVerified,
  } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  // open menu handler
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  // close menu handler
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  // stallion search handler
  const handleStallionSearch = () => {
    window.open(PATH_DASHBOARD.stallions.filter(farmId));
    handleCloseMenu();
  };
  // Stallion Promoted search handler
  const handleStallionPromotedSearch = () => {
    window.open(PATH_DASHBOARD.stallions.promotedfilter(farmId));
    handleCloseMenu();
  };
  // Member search handler
  const handleMemberSearch = () => {
    window.open(PATH_DASHBOARD.members.filter(farmId));
    handleCloseMenu();
  };
  // Marketing search handler
  const handleMarketingSearch = () => {
    if (!farmModuleAccess?.farm_edit_promoted) {
      setMergedPopover(true);
    } else {
      window.open(PATH_DASHBOARD.marketing.filterbyfarmid(farmId));
      handleCloseMenu();
    }
  };

  // logic for nameStatusClass variable
  let nameStatusClass = 'name-active';
  switch (isVerified) {
    case true:
      nameStatusClass = 'name-active';
      break;
    case false:
      nameStatusClass = 'name-closed';
      break;
  }

  return (
    <StyledEngineProvider injectFirst>
      {/* table section */}
      <TableRow hover selected={selected}>
        <TableCell align="left" className={nameStatusClass}>
          {toPascalCase(farmName)}
        </TableCell>
        <TableCell align="left">{countryName}</TableCell>
        <TableCell align="left">{stateName}</TableCell>
        <TableCell align="left">
          <u
            style={{ cursor: 'pointer' }}
            onClick={totalStallions === null ? void 0 : handleStallionSearch}
          >
            {totalStallions === null ? 0 : totalStallions}
          </u>
        </TableCell>
        <TableCell align="left"
            style={{ cursor: 'pointer' }}
            onClick={promoted === null ? void 0 : handleStallionPromotedSearch}
          >
            {promoted === null ? 0 : <u>{promoted} </u>}
        </TableCell>
        <TableCell align="left" style={{ cursor: 'pointer' }} onClick={users === null ? void 0 : handleMemberSearch}>
            {users === null ? 0 :<u>{users}</u>}
        </TableCell>
        <TableCell align="left">{parseDateAsDotFormat(modifiedOn)}</TableCell>
        {/* menu section */}
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
                  Edit Farm
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem onClick={handleMarketingSearch}>Edit Farm Page</MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  disabled={totalStallions === null || totalStallions === 0}
                  onClick={handleStallionSearch}
                >
                  View Stallions
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  disabled={users === null || users === 0}
                  onClick={users === null ? void 0 : handleMemberSearch}
                >
                  View Users
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.systemActivity.farmFilter(farmName));
                    handleCloseMenu();
                  }}
                >
                  View Activity
                </MenuItem>
              </>
            }
          />
        </TableCell>
        {/* menu section ends */}
      </TableRow>
      {/* table section ends */}

      {/* Download Unauthorized Popover section */}
      <DownloadUnauthorizedPopover
        clickedPopover={mergedPopover}
        setClickedPopover={setMergedPopover}
      />
    </StyledEngineProvider>
  );
}
