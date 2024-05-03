import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  StyledEngineProvider,
  Container,
  Divider,
  Avatar,
  ClickAwayListener
} from '@mui/material';
import { Horse } from 'src/@types/horse';
// redux
import {
  useUploadHorseImageMutation,
  useUpdateHorseImageMutation,
  useDeleteHorseImageMutation,
  useHorseImagesUploadStatusMutation
} from 'src/redux/splitEndpoints/horseSplit';
import { useRunnersGetRatingQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import Button from '@mui/material/Button';
import './HorseGen.css';
import "src/data/custom-tree.css";
import PedigreeEditModal from 'src/sections/@dashboard/horse/PedigreeEditModal';
// hooks
import useSettings from 'src/hooks/useSettings';
import { HorseWrapperDialog } from 'src/components/horse-modal/HorseWrapper';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { LegendWrapperDialog } from 'src/components/horse-modal/Legend';
import { Images } from 'src/assets/images';
import "./pedegree.css";
import PedigreeAddModal from 'src/sections/@dashboard/horse/PedigreeAddModal';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { api } from 'src/api/apiPaths';
import { toPascalCase, getHorsePedigree, updateHorseNames } from 'src/utils/customFunctions';
import { toast } from 'react-toastify';
import { HorseForm } from 'src/@types/horse';
import { v4 as uuid } from 'uuid';
import CropImageDialog from 'src/components/CropImageDialog';
import { PedigreeHorseConfirmWrapper } from 'src/components/horse-modal/PedigreeHorseConfirmWrapper';
// ----------------------------------------------------------------------

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }: any) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 346,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

const drawerWidth = 240;
type FormValuesProps = Horse;

type Props = {
  isEdit: boolean;
  id: string;
  apiStatus?: boolean,
  setApiStatus?: React.Dispatch<React.SetStateAction<boolean>>,
  apiStatusMsg?: any,
  setApiStatusMsg?: React.Dispatch<React.SetStateAction<any>>,
  currentHorse?: any;
  isNotSireAndDam?: boolean, 
  setIsNotSireAndDam?: React.Dispatch<React.SetStateAction<boolean>>,
  newHorseFormData?: any,
  setNewHorseFormData?: React.Dispatch<React.SetStateAction<any>>,
  horseModuleAccess?: any,
};

type PedigreeProps = {
  genHorseType: string;
  horseId: string;
  horseName: string;
  colorCode?: string;
  tag?: string;
  countryId?: number;
  progenyId?: string;
  yob?: number;
  isLocked?: boolean;
  horseTypeId?: number;
  generation?: number;
  sex?: string;
  gelding?: boolean;
  colourId?: number;
  cob?: string;
  isVerified?: boolean;
  children?: [];
  index?: number;
  sireId: number;
  damId: number;
  FirstInfo?: any;
  FirstInfoInFull?: any;
  legendColor?: string;
  horseModuleAccess?: any;
}

export default function HorseNewEditCForm({ isEdit, id, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, currentHorse, isNotSireAndDam, setIsNotSireAndDam, newHorseFormData, setNewHorseFormData,horseModuleAccess }: Props) {

  const paramData: any = useParams();
  const ref = useRef(null);
  // console.log(newHorseFormData,'newHorseFormData')
  
  const [generationsArray, setGenerationsArray] = useState<any>([]);
  const [maxGenerationLevel, setMaxGenerationLevel] = useState<any>(0);
  const [horseDetails, setHorseDetails] = useState<any>({});
  const horseProfilePic = currentHorse?.profilePic;
  // Get runner ratings api call
  const { currentData: runnerRatingDetails } = useRunnersGetRatingQuery(paramData?.id, { skip: !paramData?.id, refetchOnMountOrArgChange: true })

  const selectedFarmSettings = {
    defaultDisplay: 'horseName',
    defaultGeneration: 6,
    source: [],
    verifyStatus: '',
    breed: '',
    startDate: ''
  };

  useEffect(() => {
    if (selectedFarmSettings?.defaultGeneration) {
      setMaxGenerationLevel(selectedFarmSettings?.defaultGeneration)
    }
  }, [selectedFarmSettings?.defaultGeneration])

  // Style for progress bar
  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: runnerRatingDetails?.length ? showColorBasedOnRating(runnerRatingDetails[0]?.accuracyRating) : '#C75227', 
    },
  }));

  
  const showColorBasedOnRating = (rtg:string) => {
    let rating:string = '#C75227';
    
    if (rtg === 'Poor') {
      rating = '#C75227';
    }
    if (rtg === 'Good') {
      rating = '#1D472E';
    }
    if (rtg === 'Excellent') {
      rating = '#1D472E';
    }
    if (rtg === 'Outstanding') {
      rating = '#BD9A68';
    }

    return rating;
  } 

  // Calculate the horse ratings
  const calculateHorseRating = () => {
    let rating = 0;
    if (runnerRatingDetails?.length) {
      if (runnerRatingDetails[0].accuracyRating === 'Poor') {
        rating = 25;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Good') {
        rating = 50;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Excellent') {
        rating = 75;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Outstanding') {
        rating = 100;
      }
    }

    if (!paramData?.id) {
      rating = 0;
    }

    return rating;
  }

  useEffect(() => {
    let maxGenerationLevel = currentHorse?.pedigreeTreeLevel + 1;
    setHorseDetails(currentHorse)
    if (selectedFarmSettings?.defaultGeneration) {
      setMaxGenerationLevel(selectedFarmSettings?.defaultGeneration)
    } else {
      setMaxGenerationLevel(maxGenerationLevel)
    }
    // setGenerationsArray(currentHorse?.horsePedigrees);

    // Apply the updateHorseNames function to the array
    const updatedFirstArr = updateHorseNames(currentHorse?.horsePedigrees, newHorseFormData);
    setGenerationsArray(updatedFirstArr);
  }, [currentHorse])

  const editedHorseId = id;
  const hidePedigreeInfo = { display: "none" }
  const showPedigreeInfo = { display: "block" }

  let [nodeId, setNodeId] = useState(id);
  let [pedigreeID, setpedigreeID] = useState(id);
  let [generationId, setgenerationId] = useState<any>(id);
  let [isPedigreeCls, setIsPedigreeCls] = useState(false);
  let [progenyID, setProgenyID] = useState(id);

  const showPedigreeOptions = (hid: string, pid: any, gen: number, tag: string) => {
    setIsPedigreeCls(true);
  }

  const [openModal, setOpenModal] = useState(false);
  const [openConfirmPedigreeModal, setOpenConfirmPedigreeModal] = useState(false);
  const [openLegend, setOpenLegend] = useState(false);
  const [horseType, setHorseType] = useState("");

  // Close pedigree select modal
  const handleOpenConfirmModal = () => {
    setOpenConfirmPedigreeModal(true);
  };

  // Close pedigree select modal
  const handleCloseConfirmModal = () => {
    setOpenConfirmPedigreeModal(false);
  };

  // Close pedigree select modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Close legend modal
  const handleCloseLegend = () => {
    setOpenLegend(false);
  };

  // Open legend modal
  const handleOpenLegend = () => {
    setOpenLegend(true);
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  let pedigreeLevelCntr: any = [];
  const counts: any = {};
  const pedigreeLevelCls = '';
  generationsArray?.map((genArr: PedigreeProps[], index: number) => {
    genArr?.map((pedigree: PedigreeProps, subindex: number) => {
      pedigreeLevelCntr.push(index);
    });
  });
  for (const num of pedigreeLevelCntr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }

  const { themeStretch } = useSettings();

  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handlePopper = (hName: string, hCob: string, hYob: number) => {

  }
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget); setOpenPopper((previousOpen) => !previousOpen);
  };

  const canBeOpen = openPopper && Boolean(anchorEl);
  const popperId = canBeOpen ? 'transition-popper' : undefined;
  const hidePopover = () => {
    setOpenPopper(false);
  }

  // COnvert string to boolean
  const stringToBoolean = (stringValue: any) => {
    switch (stringValue?.toLowerCase()?.trim()) {
      case "true":
      case "yes":
      case "1":
        return true;

      case "false":
      case "no":
      case "0":
      case null:
      case undefined:
        return false;

      default:
        return JSON.parse(stringValue);
    }
  }
  const [pedigreeHorseIdName, setPedigreeHorseIdName] = useState("");
  const [newPedigreeHorseName, setNewPedigreeHorseName] = useState("");
  const [updatePedigreeData, setUpdatePedigreeData] = useState({});
  const [horsePedigreeId, setHorsePedigreeId] = useState("");
  const [pedigreeIdBtns, setPedigreeIdBtns] = useState("");
  const [showPedigree, setShowPedigree] = useState("block");
  const [isPedigreeLocked, setIsPedigreeLocked] = useState(false);
  const [pedigreeHorseId, setPedigreeHorseId] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [genHorseTypeValue, setGenHorseTypeValue] = useState("");

  // If user click on any pedigree, display corresponsing modal
  const handlePedigree = (event: any, objData: any) => {
    const idArray = event.currentTarget.id.split("~");
    if (!idArray[5]) {
      return;
    }
    setPedigreeHorseId(idArray[0]);
    setgenerationId(idArray[1]);
    setHorseType(idArray[2]);
    setGenHorseTypeValue(idArray[7]);

    if (idArray[6] !== "") {
      let genderKey: any = idArray[6];
      let hType = JSON.parse(idArray[6]) === 0 ? "S" : "D";

      if (objData?.sex) {
        genderKey = objData?.sex === "M" ? 0 : 1
      }
      setHorseType(hType)
      setSelectedIndex(genderKey);
    }
    if (idArray[3]) {
      setProgenyID(idArray[3]);
    }

    if (idArray[0] === "0" && idArray[1] !== "undefined") {
      handlePedigreeSelectModal('~Add New Pedigree~');
    } else {
      setIsPedigreeLocked(typeof (idArray[4]) ? stringToBoolean(idArray[4]) : false);
      setHorsePedigreeId(idArray[0] + '~' + idArray[5] + '~text');
      setPedigreeIdBtns(idArray[0] + '~' + idArray[5] + '~btn');
    }
  }

  // Reset pedigree
  const handleRestorePedigree = () => {
    setHorsePedigreeId("");
    setPedigreeIdBtns("");
  }

  // Open pedigree edit modal
  const handlePedigreeEditDrawer = () => {
    setpedigreeID(pedigreeHorseId);
    setOpen(true);
  }

  // Open pedigree add modal
  const handlePedigreeAddDrawer = () => {
    setProgenyID(progenyID);
    setOpen(true);
  }

  // Open pedigree select modal
  const handlePedigreeSelectModal = (pedigreeHorseName: any) => {
    setOpen(false);
    setOpenModal(true);
    setPedigreeHorseIdName(pedigreeHorseName);
    localStorage.setItem("parentHorseId", paramData?.id)
  }

  const genTypeValue = genHorseTypeValue;

  // Horse profile image upload action
  const inputFile = useRef<any>({});
  const [profileImageFile, setProfileImageFile] = useState<any>();
  const [profileImagePreview, setProfileImagePreview] = useState<any>(currentHorse?.profilePic);
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  const [openEditImageDialog, setOpenEditImageDialog] = useState<any>(false);
  const [imageFile, setImageFile] = useState<File>();
  const [cropImageFile, setCropImageFile] = useState<File>();
  const [cropPrevImg, setCropPrevImg] = useState<any>();
  const [uploadInProgress, setUploadInProgress] = useState<any>(false);
  const [isCroppedImageError, setIsCroppedImageError] = useState<any>(false);
  const fileuuid: any = uuid();
  const [croppedImageUuid, setCroppedImageUuid] = useState('');

  const [profileImage, response] = useUploadHorseImageMutation();
  const [profileImagedelete, deleteResponse] = useDeleteHorseImageMutation();

  const profileImageUpload = async () => {
    inputFile.current.click();
  };

  // On uploading a image, validate the uploaded image size
  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    if (file.size < 10000000) {
      validateResolution(file);
    } else {
      toast.error('File size is exceeded');
    }
  };

  // Validate the resolution
  const validateResolution = (file: any) => {
    //Read the contents of Image File.
    var reader = new FileReader();
    var flag = '';
    reader.readAsDataURL(file);
    reader.onload = function (e: any) {
      //Initiate the JavaScript Image object.
      var image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result;

      //Validate the File Height and Width.
      image.onload = function (this: any) {
        var height = this.height;
        var width = this.width;
        if (height > 120 && width > 120) {
          setImageFile(file);
          // prevProps.setSetChanges(true);
          callProfileAPI(file);
        } else {
          toast.error(`The image dimensions must be at least 120px*120px.`)
        }
      };
    }
  }

  const callProfileAPI = (file: any) => {
    try {
      profileImage({
        fileName: file.name,
        fileuuid,
        fileSize: file.size,
        horseId: id,
      }).then(async (res: any) => {
        const details = { file, fileuuid };
        setCroppedImageUuid(fileuuid);
        setProfileImageFile(details);
        setProfileImagePreview(URL.createObjectURL(file));
        setPresignedProfilePath(res.data.url);
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (imageFile != undefined) {
      setOpenEditImageDialog(true);
    }
  }, [imageFile]);

  useEffect(() => {
    if (deleteResponse?.isSuccess) {
      setCropPrevImg(null);
      setProfileImagePreview(null);
    }
  }, [deleteResponse]);

  useEffect(() => {
    if (cropPrevImg === null) {
      // console.log(profileImagePreview, cropPrevImg, isCroppedImageError, 'profileImagePreview,cropPrevImg,isCroppedImageError')
      setProfileImagePreview(null);
    }
  }, [cropPrevImg]);

  const removeProfileImage = async () => {
    await profileImagedelete(currentHorse?.horseUuid);
  }

  return (
    <StyledEngineProvider injectFirst>
      <Container maxWidth={themeStretch ? false : 'lg'} className='horsepedegreepageContainer' sx={{ paddingLeft: '0px !important', paddingRight: '0px !important' }}>

        <Box className='Horse-Detail-Pedegree'>
          <Box className='Horse-Detail-Pedegree-Header'>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <Stack className='Detail-Pedegree-Headr-Left'>
                  <Box mb={1} sx={{ display: 'flex' }}>
                    <Typography variant="h6" flexGrow={1}>
                      Accuracy Rating: <b>{runnerRatingDetails && paramData?.id && runnerRatingDetails[0]?.accuracyRating}</b>
                    </Typography>
                    <HtmlTooltip
                      placement="bottom-start"
                      className="CommonTooltip"
                      sx={{ width: '346px !important' }}
                      title={
                        <Box sx={{ padding: '10px' }}>
                          {
                            'This looks at the pedigree’s completeness and takes into account the horse, sire, dam along with the required data points for each (YoB, CoB, Colour, Sex, etc).'
                          }{' '}
                        </Box>
                      }
                    >
                      <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                    </HtmlTooltip>
                  </Box>
                  <Box className='ProgressBar-Line'>
                    <Box sx={{ flexGrow: 1 }}>
                      <BorderLinearProgress variant="determinate" value={calculateHorseRating()} />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={5}>
                <Box className='header-button-pegdegree'>
                  <Button className="add-btn add-btn-outline">
                    {maxGenerationLevel} GEN
                  </Button>
                  <Button className="add-btn" onClick={handleOpenLegend}>
                    <i className='icon-Info-circle' />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} className='genBtn' mt={3}>
          <Grid container columns={10}>
            <Box className={"SPtreechat PredegreeWrapperBox StallionPedigree"} >
              <Box sx={{ flexGrow: 1, width: '100%', margin: '0 auto' }}>
                <Grid
                  className={"PredegreeWrapperBoxInner "
                    + (counts[1] === 1 ? '' : '')
                    + (counts[2] === 3 ? '' : '')
                    + (counts[3] === 7 ? 'SeventhColumnBoxWrapper' : '')
                    + (counts[4] === 15 ? 'EightColumnBoxWrapper' : '')
                    + (counts[5] === 31 ? '' : '')
                    + (counts[6] === 63 ? '' : '')
                    + (counts[7] === 127 ? '' : '')
                  }
                  container columns={12} sx={{ height: '50rem', position: 'relative' }}>
                  <Divider className='line' />
                  <Divider className='line line1' />
                  <Divider className='line line2' />
                  <Divider className='line line3' />
                  <Divider className='line line4' />
                  <Divider className='line line5' />
                  <Divider className='line line6' />
                  {generationsArray?.map((genArr: any, index: number) => {

                    return (
                      <Grid item xs={2} key={index}
                        className={""
                          + (index === 0 ? 'oneColumnblock' : '')
                          + (index === 1 ? 'secondColumnblock' : '')
                          + (index === 2 ? 'thirdColumnblock' : '')
                          + (index === 3 ? 'fourthColumnblock' : '')
                          + (index === 4 ? 'fifthColumnblock' : '')
                          + (index === 5 ? 'sixthColumnblock' : '')
                          + (index === 6 ? 'seventhColumnblock' : '')
                        }
                      >
                        <Box sx={{ height: '100%' }} className='Pedigree'>
                        {genArr?.map((pedigree: PedigreeProps, subindex: number) => {    
                            return (
                              <Box style={{ width: '100%' }} key={subindex}>
                                <Box className={"HorseName "
                                  + (index === 0 ? 'PredegreeWhiteBox' : '')
                                  + (index === 1 ? 'PredegreesecondcolText' : '')
                                  + (index === 2 ? 'PredegreethirdcolText' : '')
                                  + (index === 3 ? 'PredegreefourthcolText' : '')
                                  + (index === 4 ? 'PredegreefifthcolText' : '')
                                  + (index === 5 ? 'PredegreesixthcolText' : '')
                                  + (index === 6 ? 'PredegreeseventhcolText' : '')
                                }
                                >
                                  <Box className='PredegreeWhiteBoxText'>
                                    {index === 0 &&
                                      <>
                                        <Box>
                                          <Avatar className='pedegree-user' alt={currentHorse?.horseName}
                                            src={
                                              (cropPrevImg && isCroppedImageError === false) ? cropPrevImg : currentHorse?.profilePic ? `${currentHorse?.profilePic}?w=126&h=126&fit:crop&ar=1:1` : profileImagePreview ? profileImagePreview : Images?.HorseProfile
                                            }
                                          />
                                          {currentHorse?.profilePic && <i className={`${horseModuleAccess?.horse_edit_pedigree === true ? newHorseFormData?.isLocked ? 'disabledIcon' : 'enabledIcon' : 'disabledIcon'} icon-Incorrect`} onClick={(e) => removeProfileImage()} />}
                                        </Box>
                                        <input
                                          type="file"
                                          id="file"
                                          ref={inputFile}
                                          style={{ display: 'none' }}
                                          onChange={onChangeFile}
                                          onClick={(event: any) => {
                                            event.target.value = null;
                                          }}
                                        />
                                        <Box mt={1}>
                                          <Button type="button" className="EditBtn" onClick={profileImageUpload} disabled={horseModuleAccess?.horse_edit_pedigree === true ? newHorseFormData?.isLocked ? true : false : true}>
                                            {currentHorse?.profilePic ? 'Edit' : 'Add'}
                                          </Button>
                                        </Box>
                                      </>
                                    }
                                    <HtmlTooltip
                                      className="CommonTooltip pedegreeTooltip"
                                      sx={{ width: 'auto !important' }}
                                      placement="top-start"
                                      arrow
                                      disableHoverListener={pedigree.horseName ? false : true}
                                      title={
                                        <React.Fragment>
                                          <Typography color="inherit">{toPascalCase(pedigree.horseName)}</Typography>
                                          <em>({pedigree.yob}&nbsp;&nbsp;{pedigree.cob})</em>.{' '}
                                        </React.Fragment>
                                      }
                                    >
                                      <Stack
                                        className="PedigreeNameBoxWrap"
                                        sx={{
                                          backgroundColor: pedigree.colorCode
                                        }} aria-describedby={pedigree.horseId}
                                        id={pedigree.horseId + '~' + pedigree?.tag?.length + '~' + pedigree?.tag?.charAt(pedigree?.tag.length-1)  + '~' + pedigree.progenyId + '~' + pedigree.isLocked + '~' + pedigree.horseName + '~' + (pedigree?.tag?.charAt(pedigree?.tag.length-1) === 'S' ? 0 : 1) + '~' + pedigree?.tag}
                                        onClick={(e: any) => handlePedigree(e, pedigree)}
                                      >
                                        <Stack
                                          className="pedigreeNameText"
                                          id={horsePedigreeId}
                                        >
                                          {(pedigreeHorseId !== '0' && horsePedigreeId === pedigree.horseId + '~' + pedigree.horseName + '~text') ?
                                            <ClickAwayListener onClickAway={handleRestorePedigree}>
                                              <Stack className="pedigreebtnWrapper">
                                                <Button className='pedegreebtn' onClick={() => (!isPedigreeLocked) ? handlePedigreeEditDrawer() : toast.error('Sorry! This Horse has been locked')} disabled={horseModuleAccess?.horse_edit_pedigree === true ? newHorseFormData?.isLocked ? true : false : true}>EDIT</Button>
                                                <Button className='pedegreebtn' onClick={() => handlePedigreeSelectModal(toPascalCase(pedigree.horseName))} disabled={horseModuleAccess?.horse_edit_pedigree === true ? newHorseFormData?.isLocked ? true : false : true}>SELECT</Button>
                                              </Stack>
                                            </ClickAwayListener>
                                            : <Stack className="pedigreename"><Typography variant='h5' sx={{
                                              color: (pedigree?.legendColor !== "") ? pedigree?.legendColor + '!important' : ''
                                            }}>{toPascalCase(pedigree.horseName)} {(pedigree.isLocked) ? <i className='icon-Lock-fill' /> : ""}</Typography></Stack>
                                          }
                                        </Stack>
                                      </Stack>
                                    </HtmlTooltip>
                                    {index < 3 && pedigree.horseName != "" && pedigree?.FirstInfo ?
                                      <HtmlTooltip
                                        enterTouchDelay={0}
                                        leaveTouchDelay={6000}
                                        className="CommonTooltip pedegreeTooltip"
                                        sx={{ width: 'auto !important' }}
                                        placement="bottom-start"
                                        arrow
                                        title={
                                          <React.Fragment>
                                            <Typography color="inherit">{pedigree?.FirstInfoInFull}</Typography>

                                          </React.Fragment>
                                        }
                                      >
                                        <Typography component='span' className='g1pro-text'>{pedigree?.FirstInfo}</Typography>
                                      </HtmlTooltip>
                                      : ""}
                                  </Box>
                                </Box>
                              </Box>
                            )
                          }
                          )}
                        </Box>
                      </Grid>
                    )
                  }
                  )}
                </Grid>
              </Box>
            </Box>

          </Grid>
        </Box>
        {/* Open pedigree add or edit modal */}
        {
          (newPedigreeHorseName !== "" && pedigreeHorseId === "0") ?
            <PedigreeAddModal
              open={open}
              rowId={""} isEdit={false}
              handleClose={handleClose}
              genId={generationId}
              progenyId={progenyID}
              setApiStatus={setApiStatus}
              apiStatusMsg={apiStatusMsg}
              setApiStatusMsg={setApiStatusMsg}
              getHorseDetails={currentHorse}
              selectedIndex={(horseType === 'D') ? "1" : "0"}
              pedigreeHorseName={newPedigreeHorseName}
              pedigreeHorseSex={(horseType === 'D') ? "F" : "M"}
              newPedigreeName={newPedigreeHorseName}
              setNewPedigreeName={setNewPedigreeHorseName}
            />
            :
            <PedigreeEditModal
              open={open}
              rowId={pedigreeID}
              isEdit={isEdit}
              handleClose={handleClose}
              genId={generationId}
              progenyId={progenyID}
              setApiStatus={setApiStatus}
              apiStatusMsg={apiStatusMsg}
              setApiStatusMsg={setApiStatusMsg}
              getHorseDetails={currentHorse}
            />
        }
        {/* Select Horse wrapper modal */}
        <HorseWrapperDialog
          title={`Select a Horse ${(horseType && horseType !== "undefined") ? `(${genTypeValue})` : ""}`}
          open={openModal}
          close={handleCloseModal}
          isStallion={(horseType === 'S') ? true : false}
          isMare={(horseType === 'D') ? true : false}
          progenyId={progenyID}
          prevPedigreeId={pedigreeID}
          generationId={generationId}
          oldPedigreeName={pedigreeHorseIdName}
          newPedigreeName={newPedigreeHorseName}
          setNewPedigreeName={setNewPedigreeHorseName}
          pedigreeHorseId={pedigreeHorseId}
          setPedigreeHorseId={setPedigreeHorseId}
          updatePedigreeData={updatePedigreeData}
          setUpdatePedigreeData={setUpdatePedigreeData}
          openConfirm={handleOpenConfirmModal}
          setOpen={setOpen}
          handlePedigreeEditDrawer
          getHorseDetails={currentHorse}
          pedigreePosition={genTypeValue}
        />
        <PedigreeHorseConfirmWrapper
          title={"Are You Sure ?"}
          open={openConfirmPedigreeModal}
          closeConfirm={handleCloseConfirmModal}
          oldPedigreeName={pedigreeHorseIdName}
          newPedigreeName={newPedigreeHorseName}
          position={genTypeValue}
          getHorseDetails={currentHorse}
          updatePedigreeData={updatePedigreeData}
        />
        {/* Open legend modal */}
        <LegendWrapperDialog title="Legend" open={openLegend} close={handleCloseLegend} />
        <CropImageDialog
          open={openEditImageDialog}
          title={`${currentHorse?.profilePic ? 'Edit' : 'Add'} Horse Image`}
          onClose={() => setOpenEditImageDialog(false)}
          imgSrc={profileImagePreview ? profileImagePreview : ''}
          imgName={imageFile?.name || ''}
          imgFile={imageFile}
          awsUrl={presignedProfilePath}
          setCropPrevImg={setCropPrevImg}
          setCropImageFile={setCropImageFile}
          uniqueUuid={croppedImageUuid}
          horseId={id}
          setIsCroppedImageError={setIsCroppedImageError}
        />
      </Container>
    </StyledEngineProvider>
  );
}