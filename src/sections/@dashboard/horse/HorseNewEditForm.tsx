import {
  Box,
  ClickAwayListener,
  Container,
  Divider,
  Grid,
  Stack,
  StyledEngineProvider,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Horse } from 'src/@types/horse';
// redux
import Button from '@mui/material/Button';
import "src/data/custom-tree.css";
import {
  useAddHorseMutation,
  useDeleteHorseImageMutation,
  useGetHorsePositionByIdAndTagQuery,
  useUploadHorseImageMutation
} from 'src/redux/splitEndpoints/horseSplit';
import './HorseGen.css';
// hooks
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CropImageDialog from 'src/components/CropImageDialog';
import { LegendWrapperDialog } from 'src/components/horse-modal/Legend';
import { PedigreeHorseConfirmWrapper } from 'src/components/horse-modal/PedigreeHorseConfirmWrapper';
import { PedigreeWrapperDialog } from 'src/components/horse-modal/PedigreeWrapper';
import useSettings from 'src/hooks/useSettings';
import { useRunnersGetRatingQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import PedigreeAddModal from 'src/sections/@dashboard/horse/PedigreeAddModal';
import { toPascalCase } from 'src/utils/customFunctions';
import { v4 as uuid } from 'uuid';
import "./pedegree.css";
// routes
import { useNavigate } from 'react-router-dom';
import { PedigreeConstants } from 'src/constants/PedigreeConstants';
import { horsefilterConstants } from 'src/constants/HorseFilterConstants'
import { Spinner } from 'src/components/Spinner';
import PedigreeNewlyAddedEditModal from './PedigreeNewlyAddedEditModal';
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
  newHorseFormData?: any,
  setNewHorseFormData?: React.Dispatch<React.SetStateAction<any>>,
  validateForm: () => boolean,
  isNotSireAndDam: boolean, 
  setIsNotSireAndDam: React.Dispatch<React.SetStateAction<boolean>>,
  newHorsePedigreeData:any,
  setNewHorsePedigreeData:React.Dispatch<React.SetStateAction<any>>,
  generationsArray: any,
  setGenerationsArray: React.Dispatch<React.SetStateAction<any>>,
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
  olduuid: string;
  newuuid: string;
  horseData?: {
    horseId: string;
    horseName: string;
    sex: string;
    yob: number;
    dob: string;
    countryId: number;
    colourId: number;
    gelding: boolean;
    isLocked: boolean;
    horseTypeId: number;
    cob: string;
    G1Tag: string;
    G1TagFull: string;
    isVerified: boolean;
    progenyId: string;
    legendColor: string;
  } 
}

export default function HorseNewEditForm({ isEdit, id, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, currentHorse, newHorseFormData, setNewHorseFormData, validateForm, isNotSireAndDam, setIsNotSireAndDam, newHorsePedigreeData, setNewHorsePedigreeData, generationsArray, setGenerationsArray }: Props) {
  const navigate = useNavigate();
  const paramData: any = useParams();
  const ref = useRef(null);
  // currentHorse = PedigreeConstants?.newHorsePedigreeFormat?.pedigree; 
  // const tempHorseuuid: any = uuid();
  // const [generationsArray, setGenerationsArray] = useState<any>([]);
  const [maxGenerationLevel, setMaxGenerationLevel] = useState<any>(0);
  const [horseDetails, setHorseDetails] = useState<any>({});
  // const horseProfilePic = currentHorse?.profilePic;
  const [currentPedigree, setCurrentPedigree] = useState<any>({});
  const [pedigreeHorseId, setPedigreeHorseId] = useState({pedigreeId: "", tag: ""});
  const [isPedigreeHorseSearch, setIsPedigreeHorseSearch] = useState(false);
  const [newHorsePedigree, setNewHorsePedigree] = useState<any>({});
  const [newSelectedHorsePedigree, setNewSelectedHorsePedigree] = useState<any>([]);
  const [newHorsePedigreeClicked, setNewHorsePedigreeClicked] = useState<any>(false);
  let previousHorseData: any = [];  

  const [sireAndDamApiCalled, setSireAndDamApiCalled] = useState({
    isSireApiCalled: false,
    isDamApiCalled: false,
  }); 
  
  const { data: newSelectedPedigreeData, isFetching: isPedigreeFetching, isSuccess: isPedigreeSuccess, refetch: pedigreeRefetch } = useGetHorsePositionByIdAndTagQuery(pedigreeHorseId, {skip: (!isPedigreeHorseSearch)});
  
  const reloadPedigreeAfterSaveOrUpdate = () => {
    setIsPedigreeHorseSearch(true);
    pedigreeRefetch();
  }

  // This effect will run when the component mounts (initial render)
  useEffect(() => {
    // Reset the state to an empty array when the component mounts
    setNewSelectedHorsePedigree([]);
    setPedigreeHorseId({pedigreeId: "", tag: ""});
    setIsPedigreeHorseSearch(false);

    // if(newSelectedHorsePedigree.length === 0) {
    //   setGenerationsArray(horsefilterConstants.blankPedigreeData);
    // }   

  }, []); // The empty dependency array ensures this effect runs only on mount

  useEffect(() => {
    if(newHorseFormData.yob > 0) {
      // Apply the updateHorseNames function to the array
      const updatedFirstArr = updateHorseNames(generationsArray);
      setGenerationsArray(updatedFirstArr);
    }    
  }, [newHorseFormData])

  
  useEffect(() => { 
    if (isPedigreeSuccess === true && isPedigreeHorseSearch === true && newHorseFormData?.horseName !== '') {
      
      // Set validation for left side save button based on sire and dam selection
      if(pedigreeHorseId.tag === 'S') {
        setSireAndDamApiCalled({
          ...sireAndDamApiCalled,
          isSireApiCalled: true,
        })
      }

      if(pedigreeHorseId.tag === 'D') {
        setSireAndDamApiCalled({
          ...sireAndDamApiCalled,
          isDamApiCalled: true,
        })
      }      
      
      previousHorseData = (newSelectedHorsePedigree.length > 0 ) ? newSelectedHorsePedigree : generationsArray;

      //  Define the pattern as a list of lists specifying which elements from pedigree Array go where in generationsArray
      const pattern: (number | null)[][] = 
      (pedigreeHorseId.tag === 'S') ? 
      [
        [newSelectedPedigreeData[0][0], null],
        [newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null],
        [newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null],
        [newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7], null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[4][0], newSelectedPedigreeData[4][1], newSelectedPedigreeData[4][2], newSelectedPedigreeData[4][3], newSelectedPedigreeData[4][4], newSelectedPedigreeData[4][5], newSelectedPedigreeData[4][6], newSelectedPedigreeData[4][7], newSelectedPedigreeData[4][8], newSelectedPedigreeData[4][9], newSelectedPedigreeData[4][10], newSelectedPedigreeData[4][11], newSelectedPedigreeData[4][12], newSelectedPedigreeData[4][13], newSelectedPedigreeData[4][14], newSelectedPedigreeData[4][15], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'D') ?
      [
        [null, newSelectedPedigreeData[0][0]],
        [null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1]],
        [null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3]],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[4][0], newSelectedPedigreeData[4][1], newSelectedPedigreeData[4][2], newSelectedPedigreeData[4][3], newSelectedPedigreeData[4][4], newSelectedPedigreeData[4][5], newSelectedPedigreeData[4][6], newSelectedPedigreeData[4][7], newSelectedPedigreeData[4][8], newSelectedPedigreeData[4][9], newSelectedPedigreeData[4][10], newSelectedPedigreeData[4][11], newSelectedPedigreeData[4][12], newSelectedPedigreeData[4][13], newSelectedPedigreeData[4][14], newSelectedPedigreeData[4][15]]
      ] :
      (pedigreeHorseId.tag === 'SS') ?
      [
        [null, null],
        [newSelectedPedigreeData[0][0], null, null, null],
        [newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null],
        [newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SD') ?
      [
        [null, null],
        [null, newSelectedPedigreeData[0][0], null, null],
        [null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DS') ?
      [
        [null, null],
        [null, null, newSelectedPedigreeData[0][0], null],
        [null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7], null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DD') ?
      [
        [null, null],
        [null, null, null, newSelectedPedigreeData[0][0]],
        [null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1]],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[3][0], newSelectedPedigreeData[3][1], newSelectedPedigreeData[3][2], newSelectedPedigreeData[3][3], newSelectedPedigreeData[3][4], newSelectedPedigreeData[3][5], newSelectedPedigreeData[3][6], newSelectedPedigreeData[3][7]]
      ] :
      (pedigreeHorseId.tag === 'SSS') ?
      [
        [null, null],
        [null, null, null, null],
        [newSelectedPedigreeData[0][0], null, null, null, null, null, null, null],
        [newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, newSelectedPedigreeData[0][0], null, null, null, null, null, null],
        [null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, newSelectedPedigreeData[0][0], null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, newSelectedPedigreeData[0][0], null, null, null, null],
        [null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[0][0], null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, newSelectedPedigreeData[0][0], null, null],
        [null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, newSelectedPedigreeData[0][0], null],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3], null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, newSelectedPedigreeData[0][0]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[2][0], newSelectedPedigreeData[2][1], newSelectedPedigreeData[2][2], newSelectedPedigreeData[2][3]]
      ] : 
      (pedigreeHorseId.tag === 'SSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'SDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null, null, null]
      ] : 
      (pedigreeHorseId.tag === 'DSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1], null, null]
      ] :
      (pedigreeHorseId.tag === 'DDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0]],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[1][0], newSelectedPedigreeData[1][1]]
      ] :
      (pedigreeHorseId.tag === 'SSSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SSDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'SDDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DSDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDSDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDDSS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null, null]
      ] :
      (pedigreeHorseId.tag === 'DDDSD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null, null]
      ] :
      (pedigreeHorseId.tag === 'DDDDS') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], null]
      ] :
      (pedigreeHorseId.tag === 'DDDDD') ?
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, newSelectedPedigreeData[0][0], ]
      ] :
      [
        [null, null],
        [null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      ] 

      // Loop through the pattern and update generationsArray
      for (let i = 0; i < pattern.length; i++) {
        const replaceList = pattern[i] as any[]; // Type assertion;
        for (let j = 0; j < replaceList.length; j++) {
          if (replaceList[j] !== null) {
            previousHorseData[i + 1][j] = replaceList[j];
          }
        }        
      }      

      // Apply the updateHorseNames function to the array
      const updatedFirstArr = updateHorseNames(previousHorseData);
      
      const filteredResult = previousHorseData?.map((level: any, index: number) => {  
        const filteredLevels:any = level.filter((item: any) => {
          const horseName = item.horseData ? item.horseData.horseName : '';
          return horseName !== '+add' && horseName !== 'NO RECORD' && horseName !== '';
        });
        const innerArrayResult = filteredLevels?.map((item: any) => ({
          ...item,
          olduuid: item?.tag === 'MH' ? null : item?.olduuid,
          horseData: null
        }));
        return innerArrayResult;
      });

      const payloadStructure = filteredResult?.filter((item: any) => item !== undefined);

      setNewHorsePedigreeData(payloadStructure);
      setGenerationsArray(updatedFirstArr);
      setNewSelectedHorsePedigree(updatedFirstArr);
    }     
  }, [isPedigreeFetching, newHorseFormData]); 

  useEffect(() => {
    if (sireAndDamApiCalled?.isSireApiCalled === true && sireAndDamApiCalled?.isDamApiCalled === true) {
      setIsNotSireAndDam(false);
    }
  }, [sireAndDamApiCalled])
    
// Function to update horseNames either with +add or blank
function updateHorseNames(arr: any) {
  const dynamicReplacement = "+add"; // Set your dynamic replacement value here

  // Create a set of horseIds for quick lookup
  const horseIds = new Set();

  // Iterate through the array to populate the horseIds set
  arr.forEach((innerArr: any) => {
      innerArr.forEach((item: any) => {
          if(item.horseData?.horseName !== "NO RECORD") {
            const horseId = item.horseData.horseId;
            horseIds.add(horseId);
          }          
      });
  });  

  // Update horseNames based on progenyId matching horseId
  const updatedArr = arr.map((innerArr: any, index: number) => {
      return innerArr.map((item: any, key: number) => {
        let horseId = item.horseData.horseId;
        let progenyId = item.horseData.progenyId;
        let horseName = item.horseData.horseName;
        let isLocked = item.horseData.isLocked;
        let legendColor = "";
        let ageDiffFlag = false;
        let geldingFlag = false;
        let previousIndexData = null;
        
        if(horseName !== "NO RECORD") {
          if(index === 1) {
            if(item.tag === 'S') {
              let sireAgeDiff = newHorseFormData.yob - item.horseData.yob;
              
              if (sireAgeDiff < 0 || sireAgeDiff > 30) {
                ageDiffFlag = true;    
              }
            }
            if(item.tag === 'D') {
              let damAgeDiff = newHorseFormData.yob - item.horseData.yob;
              if (damAgeDiff < 0 || damAgeDiff > 26) {
                ageDiffFlag = true;    
              }
            }
          } 
          else if(index > 1) {
            
            if(key !== undefined && key % 2 === 0) {
              
              let sireAgeDiff = arr[index-1]?.horseData?.yob - item.horseData.yob;
              
              if (sireAgeDiff < 0 || sireAgeDiff > 30 && arr[index-1]?.olduuid) {
                ageDiffFlag = true;    
              }
            } else if(key !== undefined && key % 2 !== 0) {
              
              let damAgeDiff = arr[index-1]?.horseData?.yob - item.horseData.yob;
              if (damAgeDiff < 0 || damAgeDiff > 26 && arr[index-1]?.olduuid) {
                ageDiffFlag = true;    
              }
            }
          }
          
          if (!item.horseData.isVerified) {
            legendColor = '#FF9F22'; //Orange    
          } else if ( !item.horseData.yob || !item.horseData.countryId || !item.horseData.colourId ) {
            legendColor = '#D80027'; //Red
          } else if (ageDiffFlag) {
            legendColor = '#FF00E5'; //Purple    
          } 
          else if (item.horseData.gelding) {
            legendColor = '#00DE8E'; //Green    
          }
        }
        if(horseName === "NO RECORD" || horseName === "+add" ) {
          legendColor = '#000000'; //Black 
        }

        // Check if horseName is "No Record" and progenyId matches a horseId
        if (horseName === "NO RECORD" && progenyId && horseIds.has(progenyId)) {
          horseName = "+add";
          horseId = 0;
          isLocked = false;
          legendColor = "";
        } else if (horseName === "NO RECORD" && progenyId && !horseIds.has(progenyId)) {
          horseName = ""; // Set to blank if progenyId doesn't match
          horseId = 0;
          isLocked = false;
          legendColor = "";
        }
        
        // Finally return the updated json object based on pedigree flat data
        return {
          ...item,
          horseData: {
            ...item.horseData,
            horseName: horseName,
            horseId: horseId,
            isLocked: isLocked,
            legendColor: legendColor,
          }
        };
      });
  });
  return updatedArr;
}

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

  const [newOpen, setNewOpen] = useState(false);
  const handleNewClose = () => setNewOpen(false);

  let pedigreeLevelCntr: any = [];
  const counts: any = {};
  const pedigreeLevelCls = '';
  // generationsArray?.map((genArr: PedigreeProps[], index: number) => {
  //   genArr?.map((pedigree: PedigreeProps, subindex: number) => {
  //     pedigreeLevelCntr.push(index);
  //   });
  // });
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
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [genHorseTypeValue, setGenHorseTypeValue] = useState("");

  // Post horse api call
  const [addHorse] = useAddHorseMutation();
  
  // If user click on any pedigree, display corresponsing modal
  const handlePedigree = async(event: any, objData: any, horseType: any, horseUuid: any) => {
    const idArray = event.currentTarget.id.split("~");
    
    let isNewHorseFormValid = validateForm(); 
    let finalData = { ...newHorseFormData, horseUuid: horseUuid, currencyId: (!newHorseFormData.currencyId) ? null : newHorseFormData.currencyId, generation: 0, totalPrizeMoneyEarned: (!newHorseFormData.totalPrizeMoneyEarned) ? null : newHorseFormData.totalPrizeMoneyEarned }
    
    if(isNewHorseFormValid) {
      if (finalData?.id === "") {
        delete finalData?.id;
      }
      delete finalData?.isSexTouched;
      
      setNewHorsePedigree(finalData);

      if (!idArray[5]) {
        return;
      }
      setPedigreeHorseId(idArray[0]);
      setgenerationId(idArray[1]);
      setHorseType(idArray[7]);
      setGenHorseTypeValue(idArray[7]);

      if (idArray[6] !== "") {
        let genderKey: any = idArray[6];
        let hType = JSON.parse(idArray[6]) === 0 ? "S" : "D";
  
        if (objData?.sex) {
          genderKey = objData?.sex === "M" ? 0 : 1
        }
        // setHorseType(hType)
        setSelectedIndex(genderKey);
      }
      if (idArray[3]) {
        setProgenyID(idArray[3]);
      }
  
      if (idArray[0] === 'null' || idArray[0] === '0') {
        setHorseType(idArray[7]);
        handlePedigreeSelectModal('~Add New Pedigree~');
      } else {
        setIsPedigreeLocked(typeof (idArray[4]) ? stringToBoolean(idArray[4]) : false);
        setHorsePedigreeId(idArray[0] + '~' + idArray[5] + '~text');
        setPedigreeIdBtns(idArray[0] + '~' + idArray[5] + '~btn');
      }      
    }
  }

  // Reset pedigree
  const handleRestorePedigree = () => {
    setHorsePedigreeId("");
    setPedigreeIdBtns("");
  }

  const [pedigreeHorseTag, setPedigreeHorseTag] = useState("");

  // Open pedigree edit modal
  const handlePedigreeEditDrawer = (pedigreeHorseId: any, pedigreeTag: any) => { 
    setPedigreeHorseTag(pedigreeTag);
    setpedigreeID(pedigreeHorseId);
    setNewOpen(true);
  }  

   // Open pedigree select modal
  const handlePedigreeSelectModal = (pedigreeHorseName: any, tempId?: any) => {
    setOpen(false);
    setOpenModal(true);
    setPedigreeHorseIdName(pedigreeHorseName);
    localStorage.setItem("parentHorseId", (tempId) ? tempId : paramData?.id)
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
                                  <HtmlTooltip
                                      className="CommonTooltip pedegreeTooltip"
                                      sx={{ width: 'auto !important' }}
                                      placement="top-start"
                                      arrow
                                      disableHoverListener={pedigree?.horseData?.horseName ? false : true}
                                      title={
                                        <React.Fragment>
                                          <Typography color="inherit">{toPascalCase(pedigree?.horseData?.horseName)}</Typography>
                                          <em>{pedigree?.horseData?.horseName !== '+add' && `(${pedigree?.horseData?.yob}  ${pedigree?.horseData?.cob}).`}</em>{' '}
                                        </React.Fragment>
                                      }
                                    >                                  
                                      <Stack
                                        className="PedigreeNameBoxWrap"
                                        sx={{
                                          backgroundColor: pedigree.colorCode                                          
                                        }} aria-describedby={pedigree.horseId}
                                        id={pedigree?.horseData?.horseId + '~' + pedigree?.tag?.length + '~' + pedigree?.tag?.charAt(pedigree?.tag.length-1) + '~' + pedigree?.horseData?.progenyId + '~' + pedigree?.horseData?.isLocked + '~' + pedigree?.horseData?.horseName + '~' + (pedigree?.tag?.charAt(pedigree?.tag.length-1) === 'S' ? 0 : 1) + '~' + pedigree?.tag}
                                        onClick={(e: any) => handlePedigree(e, pedigree, pedigree?.tag, pedigree?.olduuid)}
                                      >
                                        <Stack
                                          className="pedigreeNameText"
                                          id={horsePedigreeId}
                                        >                                          
                                          {(pedigreeHorseId.pedigreeId !== '' && horsePedigreeId === pedigree?.horseData?.horseId + '~' + pedigree?.horseData?.horseName + '~text') ?
                                            <ClickAwayListener onClickAway={handleRestorePedigree}>
                                              <Stack className="pedigreebtnWrapper">
                                                <Button className='pedegreebtn' onClick={() => (!isPedigreeLocked) ? handlePedigreeEditDrawer(pedigree?.horseData?.horseId, pedigree?.tag) : toast.error('Sorry! This Horse has been locked')}>EDIT</Button>
                                                <Button className='pedegreebtn' onClick={() => handlePedigreeSelectModal(toPascalCase(pedigree?.horseData?.horseName))}>SELECT</Button>
                                              </Stack>
                                            </ClickAwayListener>
                                            : <Stack className="pedigreename"><Typography variant='h5' sx={{
                                              color: (pedigree?.horseData?.legendColor !== "") ? pedigree?.horseData?.legendColor + '!important' : ''                                           
                                            }}>{toPascalCase(pedigree?.horseData?.horseName)} {(pedigree?.horseData?.isLocked) ? <i className='icon-Lock-fill' /> : ""}</Typography></Stack>
                                          }
                                        </Stack>
                                      </Stack>
                                      </HtmlTooltip>
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
        {newPedigreeHorseName !== "" && <PedigreeAddModal
          open={open}
          rowId={""} isEdit={false}
          handleClose={handleClose}
          genId={generationId}
          progenyId={progenyID}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          getHorseDetails={currentHorse}
          selectedIndex={(horseType === 'D' || horseType?.charAt(horseType.length-1) === 'D') ? "1" : "0"}
          pedigreeHorseName={newPedigreeHorseName}
          pedigreeHorseSex={(horseType === 'D' || horseType?.charAt(horseType.length-1) === 'D') ? "F" : "M"}
          newPedigreeName={newPedigreeHorseName}
          setNewPedigreeName={setNewPedigreeHorseName}
          newHorseFormData={newHorseFormData}
          setNewHorseFormData={setNewHorseFormData}
          pedigreeHorseId={pedigreeHorseId}
          setPedigreeHorseId={setPedigreeHorseId}
          horseType={horseType}
          isPedigreeHorseSearch={isPedigreeHorseSearch}
          setIsPedigreeHorseSearch={setIsPedigreeHorseSearch}
          reloadPedigreeAfterSaveOrUpdate={reloadPedigreeAfterSaveOrUpdate}
        />}
        <PedigreeNewlyAddedEditModal
          open={newOpen}
          rowId={pedigreeID}
          isEdit={true}
          handleClose={handleNewClose}
          genId={generationId}
          progenyId={progenyID}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          getHorseDetails={currentHorse}
          pedigreeHorseId={pedigreeHorseId}
          setPedigreeHorseId={setPedigreeHorseId}
          pedigreeHorseTag={pedigreeHorseTag}
          isPedigreeHorseSearch={isPedigreeHorseSearch}
          setIsPedigreeHorseSearch={setIsPedigreeHorseSearch}
          reloadPedigreeAfterSaveOrUpdate={reloadPedigreeAfterSaveOrUpdate}
        />
        {/* Select Horse wrapper modal */}
        <PedigreeWrapperDialog
          title={`Select a Horse ${(horseType && horseType !== "undefined") ? `(${horseType})` : ""}`}
          open={openModal}
          close={handleCloseModal}
          isStallion={(horseType === 'S' || horseType?.charAt(horseType.length-1) === 'S') ? true : false}
          isMare={(horseType === 'D' || horseType?.charAt(horseType.length-1) === 'D') ? true : false}
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
          currentPedigree={currentPedigree}
          setCurrentPedigree={setCurrentPedigree}          
          isPedigreeHorseSearch={isPedigreeHorseSearch}
          setIsPedigreeHorseSearch={setIsPedigreeHorseSearch}
          horseType={horseType}
          newHorsePedigreeClicked={newHorsePedigreeClicked}
          setNewHorsePedigreeClicked={setNewHorsePedigreeClicked}   
          reloadPedigreeAfterSaveOrUpdate={reloadPedigreeAfterSaveOrUpdate}       
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