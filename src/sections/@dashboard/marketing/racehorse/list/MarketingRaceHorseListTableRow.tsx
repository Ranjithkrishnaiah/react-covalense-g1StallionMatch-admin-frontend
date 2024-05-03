import { useState } from 'react';
// @mui
import { Box, TableRow, TableCell, MenuItem, StyledEngineProvider, Divider, Stack } from '@mui/material';
// @types
import { RaceHorse } from 'src/@types/racehorse';
// components
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from "src/assets/images";
import { EditUrlWrapperDialog } from 'src/components/marketing-modal/racehorse-modal/EditUrlWrapper';
import { toPascalCase, parseDateAsDotFormat } from 'src/utils/customFunctions';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useUpdateRaceHorseStatusMutation } from 'src/redux/splitEndpoints/raceHorseSplit';
import CopyToClipboard from 'react-copy-to-clipboard';
// ----------------------------------------------------------------------

type Props = {
  row: RaceHorse;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  onEditRow: VoidFunction;
  apiStatus?: boolean;
  setApiStatus?: React.Dispatch<React.SetStateAction<boolean>>;
  apiStatusMsg?: any;
  setApiStatusMsg?: React.Dispatch<React.SetStateAction<any>>;
  marketingModuleAccess: any;
  setMarketingModuleAccess: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover: any;
  setClickedPopover: React.Dispatch<React.SetStateAction<any>>;
};

export default function MarketingRaceHorseListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  onEditRow,
  apiStatus,
  setApiStatus,
  apiStatusMsg,
  setApiStatusMsg,
  marketingModuleAccess,
  setMarketingModuleAccess,
  clickedPopover,
  setClickedPopover,
}: Props) {

  const [updateRaceHorseStatus] = useUpdateRaceHorseStatusMutation();
  const [copied, setCopied] = useState(false);
  const { id, horseId, horseName, countryName, countryCode, createdOn, yob, sireName, sireYob, sireCountryCode, damName, damCountryCode, damYob, isActive, raceUuid, raceName, raceHorseId, raceHorseUrl, url, mainDate } = row;
  const sireInfo = (sireName === null) ? 'N/A' : toPascalCase(sireName) + "(" + sireYob + ", " + sireCountryCode + ")";
  const damInfo = (damName === null) ? 'N/A' : toPascalCase(damName) + "(" + damYob + ", " + damCountryCode + ")";
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  const [raceHorseUrlId, setRaceHorseUrlId] = useState("");
  const navigate = useNavigate();

  // Open the meatball menu
  const handleOpenMenu: any = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // Close the meatball menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // Generate SM race horse page
  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;
  let smRaceHorseUrl = '';
  if (horseId) {
    smRaceHorseUrl = `${BaseAPI}race-horse/${toPascalCase(raceHorseUrl)}/${horseId}`;
  }

  // Copy the SM race horse page
  const onSuccessfulCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Display the Activate/Deactivate icon on table list
  let ImportediconClass = (isActive === true) ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  const [openEditUrlWrapper, setOpenEditUrlWrapper] = useState(false);

  // Close the race horse url update modal
  const handleCloseEditUrlWrapper = () => {
    setOpenEditUrlWrapper(false);
  };

  // Open the race horse url update modal
  const handleOpeEditUrlWrapper = (selectedRaceHorseId: any) => {
    if (!marketingModuleAccess?.marketing_update) {
      setClickedPopover(true);
    } else {
      setOpenEditUrlWrapper(true);
      setRaceHorseUrlId(selectedRaceHorseId);
    }
  };

  // Activate/Deactivate the race horse
  const handleUpdateRaceHorseStatus = async (selectedRaceHorseId: any) => {
    if (!marketingModuleAccess?.marketing_update) {
      setClickedPopover(true);
    } else {
      let res: any = await updateRaceHorseStatus({ raceHorseId: selectedRaceHorseId });

      if (setApiStatusMsg && setApiStatus) {
        if (res?.data) {
          setApiStatusMsg({
            status: 201,
            message: `<b>Race horse status has been updated successfully.`,
          });
          setApiStatus(true);
        }
        if (res?.error) {
          const error: any = res.error;
          if (res?.error.status === 422) {
            var obj = error?.data?.errors;
            for (const key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const element = obj[key];
                setApiStatusMsg({ status: 422, message: element });
                setApiStatus(true);
              }
            }
          }
        }
      }
    }
  }

  const onRedirectToPortal = () => {
    window.open(smRaceHorseUrl, '_blank');
  }

  return (
    <StyledEngineProvider injectFirst>
      <TableRow hover selected={selected}>
        <TableCell align="left">{parseDateAsDotFormat(mainDate)}</TableCell>
        <TableCell align="left">{toPascalCase(horseName)}</TableCell>
        <TableCell align="left">{yob}</TableCell>
        <TableCell align="left">{countryCode}</TableCell>
        <TableCell align="left">{sireInfo}</TableCell>
        <TableCell align="left">{damInfo}</TableCell>
        <TableCell align="left">{parseDateAsDotFormat(createdOn)}</TableCell>
        <TableCell align="left">
          <Stack className='Link-Btn-Icon'>
            {isActive ?
              <Box onClick={onRedirectToPortal} style={{ cursor: 'pointer' }}>
                <img src={Images.Link} alt='Link' />
              </Box>
              :
              <Box style={{ cursor: 'not-allowed' }}>
                <img src={Images.linkCopyGray} alt='Copied Link' />
              </Box>
            }
            {/* <CopyToClipboard text={smRaceHorseUrl} onCopy={onSuccessfulCopy}>
              <Box className={'pointerOnHover'}> 
                {!copied ? (
                ) : (
                  <img src={Images.linkCopyGray}  alt='Copied Link' />
                )}
              </Box>
            </CopyToClipboard> */}
          </Stack>
        </TableCell>
        <TableCell align="center"><i className={ImportediconClass} /></TableCell>
        <TableCell align="center">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  onClick={() => {
                    onEditRow();
                    handleCloseMenu();
                  }}
                >
                  Edit Horse
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem
                  disabled={raceUuid === null}
                  onClick={() => {
                    window.open(PATH_DASHBOARD.race.horseIdfilter(horseId), '_blank');
                  }}
                >
                  View Races
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem
                  onClick={() => handleOpeEditUrlWrapper(raceHorseId)}
                >
                  Edit URL
                </MenuItem>
                <Divider style={{ margin: "0" }} />
                <MenuItem onClick={() => handleUpdateRaceHorseStatus(raceHorseId)}>
                  {isActive ? "Deactivate" : "Activate"}
                </MenuItem>

              </>
            }
          />
        </TableCell>
      </TableRow>
      <EditUrlWrapperDialog
        title="Edit Subdirectory"
        open={openEditUrlWrapper}
        close={handleCloseEditUrlWrapper}
        raceHorseId={raceHorseUrlId}
        aliasName={raceHorseUrl}
        apiStatus={true} setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg}
      />
    </StyledEngineProvider>
  );
}


