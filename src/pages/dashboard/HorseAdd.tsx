import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from 'src/hooks/useSettings';
// redux
import { useDispatch } from 'react-redux';
import { useHorseQuery, useGetStallionRequestQuery, useGetMareRequestQuery } from 'src/redux/splitEndpoints/horseSplit'
// components
import Page from 'src/components/Page';
import { Box } from '@mui/material';
import { HorseSpinner } from 'src/components/HorseSpinner';
import { HorseOverlapSpinner } from 'src/components/HorseOverlapSpinner';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import HorseAddModal from 'src/sections/@dashboard/horse/HorseAddModal';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import HorseNewEditForm from 'src/sections/@dashboard/horse/HorseNewEditForm';
import { PedigreeConstants } from 'src/constants/PedigreeConstants';

// ----------------------------------------------------------------------

export default function HorseAdd() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/");

  const requestId = currentPage[4];
  const { id = '' } = useParams();
  const { name = '' } = useParams();
  const { sex = '' } = useParams();

  const isEdit = pathname.includes('edit');
  const data = useHorseQuery(id, {skip: (!isEdit)});
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});

  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const isNewStallionRequest = pathname.includes('/addnewforstallion');
  const isNewMareRequest = pathname.includes('/addnewformare');
  const isNewHorseRequest = (isNewStallionRequest) ? isNewStallionRequest : (isNewMareRequest) ? isNewMareRequest : false;
  const stallionRequestData = useGetStallionRequestQuery(requestId, {skip: (!isNewStallionRequest)});
  const mareRequestData = useGetMareRequestQuery(requestId, {skip: (!isNewMareRequest)});
  const horseRequestData = (isNewStallionRequest) ? stallionRequestData : mareRequestData;
  
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

  useEffect(() => {
    setNewHorseFormData({
      ...newHorseFormData,
      horseName: stallionRequestData?.data?.horseName,
      yob: stallionRequestData?.data?.yob,
      countryId: stallionRequestData?.data?.countryId,
      sex: "M",
      isSexTouched: true,
    })
  }, [stallionRequestData?.isFetching]);

  useEffect(() => {
    setNewHorseFormData({
      ...newHorseFormData,
      horseName: mareRequestData?.data?.horseName,
      yob: mareRequestData?.data?.yob,
      countryId: mareRequestData?.data?.countryId,
      sex: "F",
      isSexTouched: true,
    })
  }, [mareRequestData?.isFetching]);


  const [newHorsePedigreeData, setNewHorsePedigreeData] = useState([]);
  const [isNotSireAndDam, setIsNotSireAndDam] = useState(true);
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
    if (data.yob !== null && isNaN(data?.yob)) {
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
  const [generationsArray, setGenerationsArray] = useState<any>([]);

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

  return (
    <>
    <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title={!isEdit ? 'Create a new horse' : 'Edit horse'} sx={{display: 'flex'}}>  
      {isNewHorseRequest && horseRequestData?.isSuccess && <HorseAddModal name={horseRequestData?.data?.horseName} countryId={horseRequestData?.data?.countryId} yob={horseRequestData?.data?.yob} sex={isNewStallionRequest ? 'M' : 'F'} requestId={horseRequestData?.data?.requestId} currentHorse={data?.data} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} newHorseFormData={newHorseFormData} setNewHorseFormData={setNewHorseFormData} errors={errors} setErrors={setErrors} newHorsePedigreeData={newHorsePedigreeData}
        setNewHorsePedigreeData={setNewHorsePedigreeData} isNotSireAndDam={isNotSireAndDam} setIsNotSireAndDam={setIsNotSireAndDam} />}
      {!isNewHorseRequest && <HorseAddModal name={name} sex={sex} currentHorse={data?.data} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} newHorseFormData={newHorseFormData} setNewHorseFormData={setNewHorseFormData} errors={errors} setErrors={setErrors} newHorsePedigreeData={newHorsePedigreeData}
        setNewHorsePedigreeData={setNewHorsePedigreeData} isNotSireAndDam={isNotSireAndDam} setIsNotSireAndDam={setIsNotSireAndDam} />}
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
      {apiStatus && <CustomToasterMessage  apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />} 
      {!isEdit && <HorseNewEditForm isEdit={false} id={""} currentHorse={{}} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} newHorseFormData={newHorseFormData} setNewHorseFormData={setNewHorseFormData} validateForm={validateForm} isNotSireAndDam={isNotSireAndDam} setIsNotSireAndDam={setIsNotSireAndDam} newHorsePedigreeData={newHorsePedigreeData} setNewHorsePedigreeData={setNewHorsePedigreeData} generationsArray={generationsArray} setGenerationsArray={setGenerationsArray}/> }    
       
      </Container>
    </Page>
    </>
  );
}
