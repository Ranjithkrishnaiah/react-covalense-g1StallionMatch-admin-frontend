import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from 'src/hooks/useSettings';
// redux
import { useDispatch } from 'react-redux';
import { useHorseQuery, useHorseDetailsByIdQuery } from 'src/redux/splitEndpoints/horseSplit'
// components
import Page from 'src/components/Page';
// sections
import HorseEditModal from 'src/sections/@dashboard/horse/HorseEditModal';
import HorseNewEditCForm from 'src/sections/@dashboard/horse/HorseNewEditCForm';
import { Box } from '@mui/material';
import { HorseSpinner } from 'src/components/HorseSpinner';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import HorseNewEditForm from 'src/sections/@dashboard/horse/HorseNewEditForm';
import { PedigreeConstants } from 'src/constants/PedigreeConstants';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

// ----------------------------------------------------------------------

export default function HorseCreate() {
  const filterCounterhook = useCounter(0);
  const [clickedPopover, setClickedPopover] = useState(false);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [horseModuleAccess, setHorseModuleAccess] = useState({
    horse_create: false,
    horse_update: false,
    horse_archieve: false,
    horse_merge: false,
    horse_rename: false,
    horse_update_locked_status: false,
    horse_add_alias: false,
    horse_delete_alias: false,
    horse_edit_pedigree: false,
  });

  // Check permission to access the horse module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });
  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;
  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  useEffect(() => {    
    setHorseModuleAccess({
      ...horseModuleAccess,
      horse_create: !valuesExist?.hasOwnProperty('HORSE_ADMIN_CREATE_A_NEW_HORSE') ? false : true,
      horse_update: !valuesExist?.hasOwnProperty('HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE') ? false : true,
      horse_archieve: !valuesExist?.hasOwnProperty('HORSE_ADMIN_ARCHIVE_AN_EXISTING_HORSE') ? false : true,
      horse_merge: !valuesExist?.hasOwnProperty('HORSE_ADMIN_MERGE_HORSES') ? false : true,
      horse_rename: !valuesExist?.hasOwnProperty('HORSE_ADMIN_RENAME_AN_EXISTING_HORSE') ? false : true,
      horse_update_locked_status: !valuesExist?.hasOwnProperty('HORSE_ADMIN_UPDATE_LOCKED_STATUS') ? false : true,
      horse_add_alias: !valuesExist?.hasOwnProperty('HORSE_ADMIN_ADD_AN_ALIAS_FOR_A_HORSE') ? false : true,
      horse_delete_alias: !valuesExist?.hasOwnProperty('HORSE_ADMIN_DELETE_AN_ALIAS_FOR_A_HORSE') ? false : true,
      horse_edit_pedigree: !valuesExist?.hasOwnProperty('HORSE_ADMIN_EDIT_PEDIGREE_OF_EXISTING_HORSE')
        ? false
        : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { id = '' } = useParams();  
  const isEdit = pathname.includes('edit');  
  const { data: horseData, isFetching: isHorseDataFetching, isSuccess: isHorseDataSuccess } = useHorseQuery(id, {skip: (!isEdit),refetchOnMountOrArgChange: true});
  const data = useHorseDetailsByIdQuery(id, {skip: (!isEdit)});
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  const [newHorseFormData, setNewHorseFormData] = useState({
    id: "",
    horseName: "",
    yob:  "",
    dob:  "",
    countryId:  "",
    colourId:  "",
    sex:  "",
    isSexTouched: false,
    gelding:  "",
    horseTypeId:  "",
    isLocked: false,
    currencyId:  "", 
    totalPrizeMoneyEarned:  "",
  });
  const [newHorsePedigreeData, setNewHorsePedigreeData] = useState([]);
  const [isNotSireAndDam, setIsNotSireAndDam] = useState(true);
  const [generationsArray, setGenerationsArray] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const [isValidDoB, setIsValidDoB] = useState(true);
  const [isValidPrizeMoney, setIsValidPrizeMoney] = useState(true);
  const [isValidYoB, setIsValidYoB] = useState(false);
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };
  const [isValidHorseForm, setIsValidHorseForm] = useState(false);
  // Check full year from date of birth and validate with YoB
  let isValidYear = (value: any) => {
    const dobYear: any = value && new Date(value).getFullYear();
    let yearOfBirth: any = Number(newHorseFormData.yob);

    if (yearOfBirth === dobYear) {
      return true;
    } else {
      return false;
    }
  }

  // Remove form validation
  useEffect(() => {
    let temp = { ...errors }
    if (newHorseFormData.horseName) {
      delete temp.horseName;
    }
    if (newHorseFormData.countryId) {
      delete temp.countryId;
    }
    if (newHorseFormData.yob) {
      delete temp.yob;
    }
    if (newHorseFormData.colourId) {
      delete temp.colourId;
    }
    if (newHorseFormData.isSexTouched) {
      delete temp.sex;
    }
    if (newHorseFormData.horseTypeId) {
      delete temp.horseTypeId;
    }
    if (!isValidDoB) {
      delete temp.dob;
    }
    if (!isValidPrizeMoney) {
      delete temp.prizemoney;
    }
    if(newHorseFormData.gelding) {
      delete temp.gelding;
    }
    setErrors(temp);
  }, [newHorseFormData]);

  // Form validation
  let validateForm = () => {
    const data: any = newHorseFormData;

    // Convert 'yob' to an integer
    data.yob = (data.yob !== "") ? parseInt(data.yob, 10) : "";

    // Convert 'totalPrizeMoneyEarned' to an integer
    data.totalPrizeMoneyEarned = (data.totalPrizeMoneyEarned !== "") ? parseInt(data.totalPrizeMoneyEarned, 10) : "";

    /*eslint-disable */
    let errors = {};
    let formIsValid = true;
    //@ts-ignore

    // Check if the value is empty or a 4-digit number and not a future year
    const isValid4DigitYear = /^\d{4}$/.test(data.yob) && parseInt(data.yob, 10) <= getCurrentYear();
    setIsValidYoB(isValid4DigitYear);

    if (data.horseName === '') {
      formIsValid = false;  //@ts-ignore
      errors["horseName"] = `Horse Name is required`;
    }
    if (data.countryId === 0 || data.countryId === '') {
      formIsValid = false;  //@ts-ignore
      errors["countryId"] = `Country of Birth is required`;
    }
    if (data.yob === '') {
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth is required`;
    }
    if (data.yob !== '' && isNaN(data?.yob)) {
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth accept upto 4 digits number`;
    }
    if (data.yob !== '' && !isNaN(data?.yob) && data.yob > 0) {
      if (!isValid4DigitYear) {
        formIsValid = false;  //@ts-ignore
        errors["yob"] = `Year of Birth must be less than current year`;
      }
    }
    if (data.colourId === 0 || data.colourId === '') {
      formIsValid = false;  //@ts-ignore
      errors["colourId"] = `Colour is required`;
    }
    if (!newHorseFormData.isSexTouched) {
      formIsValid = false;  //@ts-ignore
      errors["sex"] = `Gender is required`;
    }
    if (newHorseFormData.sex === 'M' && newHorseFormData.gelding === '') {
      formIsValid = false;  //@ts-ignore
      errors["gelding"] = `Gelding is required`;
    }
    if (data.horseTypeId === 0 || data.horseTypeId === '') {
      formIsValid = false;  //@ts-ignore
      errors["horseTypeId"] = `Horse Breed is required`;
    }
    if (isValid4DigitYear && (data.dob && data.yob !== 0)) {
      if (!isValidYear(data.dob)) {
        formIsValid = false;  //@ts-ignore
        errors["dob"] = `Year of Birth must be same`;
        setIsValidDoB(false);
      }
    }
    if (data.totalPrizeMoneyEarned !== '' && isNaN(data?.totalPrizeMoneyEarned)) {
      formIsValid = false;  //@ts-ignore
      errors["prizemoney"] = `The prize money accept upto 16 digits number`;
      setIsValidPrizeMoney(false);
    }
    setErrors(errors);
    setIsValidHorseForm(!formIsValid);
    return formIsValid
  };

  const newHorseFormat = {
        "horseId": null,
        "horseName": null,
        "sex": null,
        "yob": null,
        "dob": null,
        "countryId": null,
        "colourId": null,
        "gelding": null,
        "isLocked": null,
        "horseTypeId": null,
        "cob": null,
        "G1Tag": null,
        "G1TagFull": null,
        "isVerified": null,
        "progenyId": null,
        "legendColor": null,
        "totalPrizeMoneyEarned": null,
        "createdOn": null,
        "verifiedBy": null,
        "verifiedOn": null,
        "modifiedBy": null,
        "modifiedOn": null,
        "createdBy": null,
        "run": null,
        "totalWin": null,
        "group_1_wins": null,
        "group_2_wins": null,
        "group_3_wins": null,
        "listedWins": null,
        "eligibility": true,
        "favouriteStallion": null,
        "favBroodmareSire": null,
        "myMares": null,
        "profilePic": null,
        "pedigree": PedigreeConstants?.newPedigreeWithMHData
  };

  useEffect(() => {
    // Reset the state to an empty array when the component mounts
    setGenerationsArray(newHorseFormat.pedigree);
  }, []); // The empty dependency array ensures this effect runs only on mount

      
  console.log('filterCounterhook>>>', filterCounterhook, 'isEdit>>>', isEdit, 'horseModuleAccess>>>>', horseModuleAccess)
  return (
    <>
    <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title={!isEdit ? 'Create a new horse' : 'Edit horse'} sx={{display: 'flex'}}>
      {
      isFetchingAccessLevel && filterCounterhook.value < 2 ? (
        <Box className="Spinner-Wrp">
          <HorseSpinner />
        </Box>
      ) : 
      (isEdit === true && filterCounterhook.value >= 2 && horseModuleAccess.horse_update === false) ? (
        <UnAuthorized />
      ) : 
      (isEdit === false && filterCounterhook.value >= 2 && horseModuleAccess.horse_create === false) ? ( 
            <UnAuthorized />
      ) : (
      <>   
      <HorseEditModal 
        horseId={id} 
        currentHorse={data?.data} 
        isEdit={isEdit} 
        genId={0} 
        progenyId={0} 
        apiStatus={true} 
        setApiStatus={setApiStatus} 
        apiStatusMsg={apiStatusMsg} 
        setApiStatusMsg={setApiStatusMsg} 
        newHorseFormData={newHorseFormData} 
        setNewHorseFormData={setNewHorseFormData} 
        errors={errors} 
        setErrors={setErrors} 
        isNotSireAndDam={isNotSireAndDam}
        setIsNotSireAndDam={setIsNotSireAndDam}
        newHorsePedigreeData={newHorsePedigreeData}
        setNewHorsePedigreeData={setNewHorsePedigreeData}
        generationsArray={generationsArray}
        setGenerationsArray={setGenerationsArray}
        horseModuleAccess={horseModuleAccess}
        setHorseModuleAccess={setHorseModuleAccess}
        clickedPopover={clickedPopover}
        setClickedPopover={setClickedPopover}
      />    
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
      {apiStatus && <CustomToasterMessage  apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
        {
          isHorseDataFetching ?
            <Box className='Spinner-Wrp'> <HorseSpinner /> </Box> : 
          isHorseDataSuccess && 
          <HorseNewEditCForm 
            isEdit={isEdit} id={id} apiStatus={true} setApiStatus={setApiStatus} 
            apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} 
            currentHorse={horseData} 
            isNotSireAndDam={isNotSireAndDam} setIsNotSireAndDam={setIsNotSireAndDam} 
            newHorseFormData={newHorseFormData} setNewHorseFormData={setNewHorseFormData}
            horseModuleAccess={horseModuleAccess} 
          />
        }
        {!isEdit && <HorseNewEditForm 
          isEdit={false} 
          id={""} 
          currentHorse={{}} 
          apiStatus={true} setApiStatus={setApiStatus} 
          apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} 
          newHorseFormData={newHorseFormData} setNewHorseFormData={setNewHorseFormData} 
          validateForm={validateForm}
          isNotSireAndDam={isNotSireAndDam} setIsNotSireAndDam={setIsNotSireAndDam}
          newHorsePedigreeData={newHorsePedigreeData} setNewHorsePedigreeData={setNewHorsePedigreeData}
          generationsArray={generationsArray} setGenerationsArray={setGenerationsArray}
          /> 
        }   
      </Container>
      </>
      )}
      {/* Download Unauthorized Popover */}
      {clickedPopover && !horseModuleAccess.horse_add_alias && (
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
      )}
    </Page>
    </>
  );
}