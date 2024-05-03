import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
// @mui
import { Box, Typography, Container, Grid, Stack, Divider, MenuItem, Button, TextField, FormGroup, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { LoadingButton } from '@mui/lab';

import Page from 'src/components/Page';
import Scrollbar from 'src/components/Scrollbar';
import Select from '@mui/material/Select';
import './dashboard.css'
import 'src/sections/@dashboard/sales/sales.css'
import SalesFilterSidebar from 'src/sections/@dashboard/sales/filter/SalesFilterSidebar';
import { Images } from 'src/assets/images';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from "src/hooks/useSettings";
import { useDownloadSalesLotsQuery, useSaleQuery, useSalesLotInfoQuery, useSalesLotsDetailsQuery, useSalesLotsQuery, useSalesQuery, useSaleTypeQuery, useVerifyLotsMutation } from 'src/redux/splitEndpoints/salesSplit';
import { UploadCSVFile } from "src/sections/@dashboard/sales/NewSalesViewDetailsModal";
import CsvLink from "react-csv-export";
import { SalesLotsHorseWrapperDialog } from "src/components/sales-modal/SalesLotsHorseWrapperDialog";
import { toPascalCase } from 'src/utils/customFunctions';
import { useHorseQuery } from "src/redux/splitEndpoints/horseSplit";
import { CircularSpinner } from "src/components/CircularSpinner";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps: any = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      marginLeft: '-0.5px',
      marginTop: '-1px',
      boxShadow: 'none',
      border: 'solid 1px #161716',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      boxSizing: 'border-box',
    },
  },
}


export default function SalesViewLots() {
  const { lotId = '' } = useParams();
  const [unverified, setUnverified] = useState(false);
  const [text, setText] = useState("");
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const [selectOneLot, setSelectOneLot] = useState<any>({});
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  const [salesLotsParam, setSalesLotsParam] = useState({
    isVerified: '',
    isWithdrawn: '',
    NotMatchedLot: '',
    NotMatchedSireDam: '',
    saleId: lotId
  });
  const [lotsFilter, setLotsFilter] = useState({
    lotsStart: '',
    lotsEnd: ''
  });
  const [lotsRangeFilter, setLotsRangeFilter] = useState<any>({});
  const [showLotsClicked, setshowLotsClicked] = useState(false);
  const [uploadLotsError, setUploadLotsError] = React.useState<any>('');
  const [uploadLotsSuccess, setUploadLotsSuccess] = React.useState<any>('');
  const [uploadLotsResponse, setUploadLotsResponse] = React.useState<any>(false);
  const [salesLotFile, setSalesLotFile] = React.useState<File>();
  const [csvData, setCsvData] = useState<any>([]);
  const [openModal, setOpenModal] = useState(false);
  const [horseType, setHorseType] = useState('Horse');
  const [horseDetails, setHorseDetails] = useState<any>('');
  const [selectedLotType, setSelectedLotType] = useState<any>('none');
  const [horsePedigreeDetails, setHorsePedigreeDetails] = useState<any>({});
  const [verifyLotsDetails, setVerifyLotsDetails] = useState<any>({
  });
  const [lotsIndex, setLotsIndex] = useState(0);

  // Avatar refrence
  const avatarRef = React.useRef<HTMLInputElement | null>(null);

  // Filter api parameter
  const checkForBoolean = (obj: any, value: Boolean) => {
    let tempObj: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== '') {
          tempObj[key] = obj[key];
          if (unverified === false && obj.isVerified === false || unverified === true && obj.isVerified === true) {
            tempObj.isVerified = '';
          } else {
            tempObj.isVerified = unverified ? false : obj.isVerified;
          }
        }
      }
    }

    let finalObj: any = {};
    for (const key in tempObj) {
      if (Object.prototype.hasOwnProperty.call(tempObj, key)) {
        const element = tempObj[key];
        if (element !== '' && element !== false) {
          finalObj[key] = element;
          if (unverified && tempObj.isVerified !== '') {
            finalObj.isVerified = false;
          }
        }
      }
    }

    return finalObj;
  }

  // Api calls
  const { data: salesTypeList } = useSaleTypeQuery();
  const { data: salesListData, isFetching: isSalesListFetching, isSuccess, currentData: salesList } = useSalesLotsQuery({
    ...checkForBoolean(salesLotsParam, unverified),
    ...((lotsRangeFilter?.lotsStart && lotsRangeFilter?.lotsEnd) && { lotRange: `${lotsRangeFilter?.lotsStart}-${lotsRangeFilter?.lotsEnd}` }),
  }, { skip: !lotId, refetchOnMountOrArgChange: true });
  const { data: salesLotInfo, isFetching: isSalesLotInfoFetching, isSuccess: isSalesLotInfoSuccess } = useSalesLotInfoQuery(selectOneLot?.salesLotInfoUuid, { skip: !Boolean(selectOneLot?.salesLotInfoUuid), refetchOnMountOrArgChange: true });
  const { data: salesData } = useSaleQuery(lotId, { refetchOnMountOrArgChange: true });
  const { data: salesLotsDetails, isFetching: salesLotsDetailsFetching, isSuccess: salesLotsDetailsSuccess } = useSalesLotsDetailsQuery(selectOneLot?.salesLotUuid, { skip: !Boolean(selectOneLot?.salesLotUuid), refetchOnMountOrArgChange: true });
  const downloadedSalesData = useDownloadSalesLotsQuery(lotId, { refetchOnMountOrArgChange: true });
  const currentSale = salesData;
  const runnerHorsePedigreeDetails: any = useHorseQuery(horseDetails || salesLotsDetails?.horseUuid, { skip: !Boolean(salesLotsDetails?.horseUuid || horseDetails), refetchOnMountOrArgChange: true })
  const [verifyLots, response] = useVerifyLotsMutation();

  useEffect(() => {
    // console.log(response,'RESPONSE')
    if (response.isSuccess) {
      setHorsePedigreeDetails({});
    }
  }, [response])

  useEffect(() => {
    // console.log(response,'RESPONSE')
    if (salesLotsDetailsSuccess) {
      setSelectedLotType(salesLotsDetails?.lotType);
    }
  }, [salesLotsDetailsFetching])

  // By default first lot should be selected form lots list
  useEffect(() => {
    if (isSalesListFetching === false && isSuccess && salesList.length) {
      setSelectOneLot(salesList[lotsIndex]);
    } else {
      setSelectOneLot({});
    }
  }, [isSalesListFetching])

  // Download lots in CSV format
  useEffect(() => {
    if (downloadedSalesData.currentData && downloadedSalesData.isSuccess) {
      setCsvData(downloadedSalesData.currentData);
    }
  }, [downloadedSalesData.isFetching])

  // Get the horse details
  useEffect(() => {
    if (runnerHorsePedigreeDetails.currentData && runnerHorsePedigreeDetails.isSuccess) {
      setHorsePedigreeDetails(runnerHorsePedigreeDetails?.currentData);
    }
  }, [runnerHorsePedigreeDetails.isFetching])

  // On Api success select the next lot
  useEffect(() => {
    if (response.isLoading === false && response.isSuccess) {
      let index = lotsIndex;
      if (salesList.length - 1 !== index) {
        setLotsIndex((prev) => prev + 1);
        setTimeout(() => {
          setSelectOneLot(salesList[index + 1]);
        }, 1000);
      }
    }
  }, [response])

  // Handle the filter parameters
  const handleParamsCheckbox = (event: any, type: string) => {
    if (type === 'unverified') {
      setUnverified(event.target.checked)
    } else {
      setSalesLotsParam({
        ...salesLotsParam,
        [type]: event.target.checked
      })
    }
  }

  // Select lots 
  const selectLots = (lot: any, index: number) => {
    let obj = {}
    console.log(obj,'OBJJ');
    setSelectOneLot(lot);
    setLotsIndex(index);
    setHorsePedigreeDetails(obj);
    setVerifyLotsDetails(obj);
    setHorseDetails('');
  }

  // Close select horse modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Change image on avatar click
  const changeImage = () => avatarRef?.current?.click();

  // Parse date
  function parseDate(dateToParse: string) {
    let parsedDate = dateToParse ? new Date(dateToParse) : new Date()
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, "0")}.${(parsedDate.getMonth() + 1).toString().padStart(2, "0")}.${parsedDate.getFullYear()}`
    return formattedDate;
  }

  // Render the lots lists
  function renderRow() {
    if (isSalesListFetching) {
      return <CircularProgress />
    }

    if (isSalesListFetching === false && isSuccess && salesList.length) {
      {
        return salesList?.map((v: any, i: number) => {
          return (
            <ListItem className={`viewLotsList ${selectOneLot?.id === v.id ? selectOneLot?.isWithdrawn ? 'disabled' : 'selected' : selectOneLot?.isWithdrawn ? 'disabled' : ''}`} key={v.id} onClick={() => selectLots(v, i)} component="div" disablePadding>
              <ListItemButton>
                <ListItemAvatar>
                  {v.isVerified ? <i className='icon-Confirmed-24px'></i> : <i className='icon-Incorrect'></i>}
                </ListItemAvatar>
                <ListItemText primary={`Lot ${v.lotNumber}`} secondary={`${toPascalCase(v.sireName)} x ${toPascalCase(v.damName)}`} />
              </ListItemButton>
            </ListItem>
          )
        })
      }
    }
    return <>No Data</>
  }

  // Handle verify and next button for lots verification
  const handleVerifyAndNext = (data: any, isStallion: string) => {
    setVerifyLotsDetails(data);
    if (isStallion === 'Horse') {
      setHorsePedigreeDetails({});
      setHorseDetails(data.horseId);
    }
  }

  // under construction... to verify lots
  const handleVerifyLots = () => {
    let obj: any = {
      ...verifyLotsDetails,
      "isVerifiedSire": selectOneLot?.isVerified ? false : true,
      "isVerifiedDam": selectOneLot?.isVerified ? false : true,
      "isVerified": selectOneLot?.isVerified ? false : true,
      "isNamed": true,
      "lotType": salesTypeList?.filter((v: any) => v.salesTypeName === selectedLotType)[0]?.id,
      ...(!(verifyLotsDetails?.sireName) && { sireName: salesLotsDetails?.sireName }),
      ...(!(verifyLotsDetails?.sireId) && { sireId: salesLotsDetails?.sireId }),
      ...(!(verifyLotsDetails?.damName) && { damName: salesLotsDetails?.damName }),
      ...(!(verifyLotsDetails?.damId) && { damId: salesLotsDetails?.damId }),
      ...(!(verifyLotsDetails?.horseName) && { horseName: salesLotsDetails?.horseName }),
      ...(!(verifyLotsDetails?.horseId) && { horseId: salesLotsDetails?.Id }),
    }

    if (horsePedigreeDetails?.horseName) {
      obj.horseId = horsePedigreeDetails.horsePedigrees[0][0]?.horseId
      obj.horseColour = horsePedigreeDetails.horsePedigrees[0][0]?.legendColor
      obj.horseColourId = horsePedigreeDetails.horsePedigrees[0][0]?.colourId
      obj.horseCobId = horsePedigreeDetails.horsePedigrees[0][0]?.countryId
      obj.horseCob = horsePedigreeDetails.horsePedigrees[0][0]?.cob
      obj.horseYob = horsePedigreeDetails.horsePedigrees[0][0]?.yob
      obj.sireId = horsePedigreeDetails.horsePedigrees[1][0]?.horseId
      obj.sireName = horsePedigreeDetails.horsePedigrees[1][0]?.horseName
      obj.sireYob = horsePedigreeDetails.horsePedigrees[1][0]?.yob
      obj.sireCob = horsePedigreeDetails.horsePedigrees[1][0]?.cob
      obj.damId = horsePedigreeDetails.horsePedigrees[1][1]?.horseId
      obj.damName = horsePedigreeDetails.horsePedigrees[1][1]?.horseName
      obj.damYob = horsePedigreeDetails.horsePedigrees[1][1]?.yob
      obj.damCob = horsePedigreeDetails.horsePedigrees[1][1]?.cob
      obj.sireSireName = horsePedigreeDetails.horsePedigrees[2][0]?.horseName
      obj.sireSireId = horsePedigreeDetails.horsePedigrees[2][0]?.horseId
      obj.sireSireCob = horsePedigreeDetails.horsePedigrees[2][0]?.cob
      obj.sireSireYob = horsePedigreeDetails.horsePedigrees[2][0]?.yob
      obj.damSireName = horsePedigreeDetails.horsePedigrees[2][2]?.horseName
      obj.damSireId = horsePedigreeDetails.horsePedigrees[2][2]?.horseId
      obj.damSireCob = horsePedigreeDetails.horsePedigrees[2][2]?.cob
      obj.damSireYob = horsePedigreeDetails.horsePedigrees[2][2]?.yob
    }
    console.log(salesLotsDetails, obj, 'salesLotsDetails -> horsePedigreeDetails');
    if (typeof (obj.horseId) === 'string') {
      verifyLots([selectOneLot?.salesLotUuid, obj]);
    } else {
      alert('Select named horse')
    }
  }

  // Show lots based on lot number entered
  const handleLotsRange = () => {
    setshowLotsClicked(true)
    let obj = JSON.parse(JSON.stringify(lotsFilter));
    setLotsRangeFilter(obj);
  }

  // Save lot number
  const handleOnChnageLotsRange = (e: any, type: string) => {
    setLotsFilter({
      ...lotsFilter,
      [type]: e.target.value
    })
  }

  // Handle lots filter
  useEffect(() => {
    if (lotsFilter) {
      if (lotsFilter.lotsStart === '' && lotsFilter.lotsEnd === '') {
        let obj = JSON.parse(JSON.stringify(lotsFilter));
        setLotsRangeFilter(obj);
      }
    }
  }, [lotsFilter])

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [orderBy, setOrderBy] = useState('raceId');
  const [order, setOrder] = useState('ASC');
  const [isIncludedFeeActive, setIsIncludedFeeActive] = useState(false);
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const filterRef = useRef<any>(null);
  const [getFilters, setGetFilters] = useState<any>({});

  // Api parameter
  let newState = {
    page: page,
    limit: limit,
  };

  // Api call
  const data = useSalesQuery(isFilterApplied ? getFilters : newState, { skip: (!isSearchClicked) });

  // handle filter
  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  // Apply filter
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  // Remove filter
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  }
  console.log(salesLotsDetails, horsePedigreeDetails, 'salesLotsDetails')

  return (
    <>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title="Sales View Lots" sx={{ display: 'flex' }} className='SalesData'>
        {/* Sales Filter */}
        <SalesFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          isFilterApplied={isFilterApplied}
          rowCount={(!isFilterApplied) ? 0 : data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          setIsSearchClicked={setIsSearchClicked}
          isSearchClicked={isSearchClicked}
          setPage={setPage}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          order={order}
          setIsIncludedFeeActive={setIsIncludedFeeActive}
          isIncludedFeeActive={isIncludedFeeActive}
          convertedCreatedRangeValue={convertedCreatedRangeValue}
          setConvertedCreatedRangeValue={setConvertedCreatedRangeValue}
          convertedCreatedDateValue={convertedCreatedDateValue}
          setConvertedCreatedDateValue={setConvertedCreatedDateValue}
          ref={filterRef}
        />
        <Box className='SalesDataRight' sx={{ width: '100%' }} px={2}>
          <Container>
            <Box mt={1} className='SalesDataBody'>
              <Box className='SalesViewLotsPage'>
                <Typography variant='h2' className='MainTitle'>{toPascalCase(currentSale?.salesName)} ({salesList?.length ? salesList?.length : 0} Lots)</Typography>
                {/* Sales filter row */}
                <Box className='SalesViewLotsfirstRow'>
                  <Grid container spacing={2}>
                    <Grid item xs={9} lg={9} className='SalesViewLotsfirstRowLeft'>
                      <Stack
                        className='SalesViewLotsForm'
                        component="form"
                      >
                        <Box className='edit-field SalesViewLotsForm-first'>
                          <TextField
                            id="outlined-basic"
                            type={'number'}
                            onChange={(e: any) => handleOnChnageLotsRange(e, 'lotsStart')}
                            placeholder='Lot Start'
                            variant="outlined" />
                          <Stack className='hifen-lines'>
                            <span className='hifen'>-</span>
                          </Stack>
                        </Box>

                        <Box className='edit-field SalesViewLotsForm-second'>
                          <TextField
                            id="outlined-basic"
                            type={'number'}
                            onChange={(e: any) => handleOnChnageLotsRange(e, 'lotsEnd')}
                            placeholder='Lot End'
                            variant="outlined" />
                        </Box>
                        <Box className='edit-field SalesViewLotsForm-third'>
                          <Button type='button' className='search-btn' onClick={handleLotsRange} disabled={lotsFilter?.lotsStart === '' || lotsFilter?.lotsEnd === ''}>Show Lots</Button>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={3} lg={3} className='SalesViewLotsfirstRowRight'>
                      <LoadingButton type='button' className='add-btn green' loading={uploadLotsResponse?.isLoading} onClick={changeImage}>Update Sale</LoadingButton>
                      <CsvLink data={csvData} fileName={`${currentSale?.salesName} Lots`}>
                        <Button type='button' className='share-btn'><i className='icon-Share'></i></Button>
                      </CsvLink>

                    </Grid>
                    <Grid item xs={9} lg={9} className='SalesViewLotsfirstRowcheckbox'>
                      <FormGroup className='checkBox-Common'>
                        <FormControlLabel onChange={(e) => handleParamsCheckbox(e, 'unverified')} control={<Checkbox checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Unverified" />
                        <FormControlLabel onChange={(e) => handleParamsCheckbox(e, 'isVerified')} control={<Checkbox checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Verified" />
                        <FormControlLabel onChange={(e) => handleParamsCheckbox(e, 'NotMatchedLot')} control={<Checkbox checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Not Matched (Lot)" />
                        <FormControlLabel onChange={(e) => handleParamsCheckbox(e, 'NotMatchedSireDam')} control={<Checkbox checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Not Matched (Sire/Dam)" />
                        <FormControlLabel onChange={(e) => handleParamsCheckbox(e, 'isWithdrawn')} control={<Checkbox checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Withdrawn" />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </Box>
                {/* End Sales filter row */}
                <hr className='hor-hr' />
                <Stack className='ViewLotsGrid'>
                  <Grid container spacing={2} className='ViewLotsGridWrp'>

                    {/* Render sales list */}
                    <Grid item xs={4} md={4} className='ViewLotsGridLeft'>
                      <Box className='ViewLotsGridscroll'>
                        <Box
                          className='ViewLotsGridscrollinner'
                          sx={{ width: '100%', height: 978, }}
                        >
                          <Scrollbar className='viewLotsFixedSizeScroll' sx={{
                            height: '978px',
                          }}>
                            {renderRow()}
                          </Scrollbar>
                        </Box>
                      </Box>
                    </Grid>
                    {/* End Render sales list */}
                    <Divider orientation="vertical" sx={{ borderBottom: 'solid 1px #B0B6AF', borderColor: '#B0B6AF' }} flexItem />

                    {/* Show selected lot info */}

                    <Grid item xs={8} md={8} className='ViewLotsGridRight'>
                      <Stack className='ViewLotsHeadingRow'>
                        <Stack className='ViewLotsHeadingRowLeft'>
                          <Typography variant='h4'><b>Lot {selectOneLot?.lotNumber}</b> - {toPascalCase(selectOneLot?.sireName)} x {toPascalCase(selectOneLot?.damName)}</Typography>
                          <Box className="lotName">
                            {!isSalesLotInfoFetching && <FormControlLabel control={<Checkbox
                              inputProps={{ readOnly: true }}
                              disabled
                              checked={salesLotsDetails?.isNamed || false}
                              checkedIcon={<img src={Images.checked} />} icon={<img src={Images.unchecked} />} />} label="Named Horse" />}
                            {!isSalesLotInfoFetching && <FormControlLabel
                              control={<Checkbox inputProps={{ readOnly: true }} checkedIcon={<img src={Images.checked} />}
                                checked={salesLotsDetails?.isWithdrawn}
                                disabled
                                icon={<img src={Images.unchecked} />} />} label="Withdrawn" />}
                          </Box>
                        </Stack>
                        <Stack className='ViewLotsHeadingRowRight'>
                          <Box className='edit-field'>
                            {!isSalesLotInfoFetching && <Select
                              MenuProps={MenuProps}
                              IconComponent={KeyboardArrowDownRoundedIcon}
                              className="filter-slct"
                              value={selectedLotType}
                              onChange={(e: any) => setSelectedLotType(e.target.value)}
                              disabled={salesLotsDetails?.salesType === "Mixed Sale" ? salesLotsDetails?.isVerified === true ? true : false : true}
                              defaultValue="none" name="expiredStallion">
                              <MenuItem className="selectDropDownList" value="none" disabled><em>Lot Type</em></MenuItem>
                              {salesTypeList?.map((v: any) => {
                                return (
                                  <MenuItem className="selectDropDownList lotsDropdownList" key={v.id} value={v.salesTypeName}>{v.salesTypeName}</MenuItem>
                                )
                              })}
                            </Select>}
                          </Box>
                        </Stack>
                      </Stack>

                      {runnerHorsePedigreeDetails.isFetching ? <CircularSpinner /> :
                        <>
                          <Grid container spacing={0} className='textfieledTree-Wrapper'>
                            <Grid item sm={6} md={6} className='textfieledTree'>
                              <Stack className='textfieledTreeList'>
                                <Box className='edit-field'>
                                  <TextField
                                    id="input-with-icon-textfield"
                                    placeholder='Lot Horse Name'
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {salesLotsDetails?.isVerified ? <i className='icon-Confirmed-24px'></i> : <i className='icon-Incorrect'></i>}
                                        </InputAdornment>
                                      ),
                                      readOnly: true,
                                    }}
                                    variant="outlined"
                                    value={((horsePedigreeDetails?.horsePedigrees && horsePedigreeDetails?.horsePedigrees[0]?.length) ?
                                      toPascalCase(horsePedigreeDetails?.horsePedigrees[0][0]?.horseName) + `(${horsePedigreeDetails?.horsePedigrees[0][0]?.yob ? horsePedigreeDetails?.horsePedigrees[0][0]?.yob : ''},${horsePedigreeDetails?.horsePedigrees[0][0]?.cob ? String(horsePedigreeDetails?.horsePedigrees[0][0]?.cob)?.toUpperCase() : ''})` :
                                      salesLotsDetails?.horseName ? 
                                      (toPascalCase(salesLotsDetails?.horseName) + (salesLotsDetails?.isNamed == false ? '' : `(${salesLotInfo?.dob ? salesLotInfo?.dob : ''},${salesLotInfo?.Cob ? salesLotInfo?.Cob : ''})`))
                                        : (toPascalCase(verifyLotsDetails?.horseName)) + (salesLotsDetails?.isNamed == false ? '' : `(${salesLotInfo?.dob ? salesLotInfo?.dob : ''},${salesLotInfo?.Cob ? salesLotInfo?.Cob : ''})`))
                                    }
                                  // value={toPascalCase(salesLotsDetails?.horseName ? salesLotsDetails?.horseName : horsePedigreeDetails?.horseName ? horsePedigreeDetails?.horseName : verifyLotsDetails?.horseName)}
                                  // value={toPascalCase(horsePedigreeDetails?.horseName ? horsePedigreeDetails?.horseName : verifyLotsDetails?.horseName ? verifyLotsDetails?.horseName : salesLotsDetails?.horseName)}
                                  />
                                  <Button className='edit-btn' type='button' onClick={() => {
                                    setOpenModal(true);
                                    setHorseType('Horse');
                                  }}><i className='icon-Edit-Icon'></i></Button>
                                  <hr className='textfieledHr' />
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item sm={6} md={6} className='textfieledTree Second-textfieledTree'>
                              <Stack className='textfieledTreeList'>
                                <Box className='edit-field'>
                                  <TextField
                                    id="input-with-icon-textfield"
                                    placeholder='Select Sire'
                                    disabled={(salesLotsDetails?.isNamed === true ? true : false) && horsePedigreeDetails?.horseName}
                                    onChange={e => setText(e.target.value)}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {salesLotsDetails?.isVerified ? <i className='icon-Confirmed-24px'></i> : <i className='icon-Incorrect'></i>}
                                        </InputAdornment>
                                      ),
                                      readOnly: true,
                                    }}
                                    value={((horsePedigreeDetails?.horsePedigrees && horsePedigreeDetails?.horsePedigrees[1]?.length) ?
                                      toPascalCase(horsePedigreeDetails?.horsePedigrees[1][0]?.horseName) + `(${horsePedigreeDetails?.horsePedigrees[1][0]?.yob ? horsePedigreeDetails?.horsePedigrees[1][0]?.yob : ''},${horsePedigreeDetails?.horsePedigrees[1][0]?.cob ? String(horsePedigreeDetails?.horsePedigrees[1][0]?.cob)?.toUpperCase() : ''})`
                                      : salesLotsDetails?.sireName ?
                                        toPascalCase(salesLotsDetails?.sireName) + ((salesLotInfo?.sireYob && salesLotInfo?.sireCob) ? `(${salesLotInfo?.sireYob}, ${salesLotInfo?.sireCob})` : salesLotInfo?.sireYob ? ` (${salesLotInfo?.sireYob})` : salesLotInfo?.sireCob ? ` (${salesLotInfo?.sireCob})` : '')
                                        : toPascalCase(verifyLotsDetails?.sireName) + ((salesLotInfo?.sireYob && salesLotInfo?.sireCob) ? `(${salesLotInfo?.sireYob}, ${salesLotInfo?.sireCob})` : salesLotInfo?.sireYob ? ` (${salesLotInfo?.sireYob})` : salesLotInfo?.sireCob ? ` (${salesLotInfo?.sireCob})` : '')
                                    )}
                                    // value={toPascalCase((horsePedigreeDetails?.horsePedigrees && horsePedigreeDetails?.horsePedigrees[1]?.length) ? horsePedigreeDetails?.horsePedigrees[1][0]?.horseName : verifyLotsDetails?.sireName ? verifyLotsDetails?.sireName : salesLotsDetails?.sireName)}
                                    variant="outlined"
                                  />
                                  <Button className='edit-btn' type='button'
                                    onClick={() => {
                                      setOpenModal(true);
                                      setHorseType('Sire');
                                    }}
                                    disabled={salesLotsDetails?.isNamed}
                                  ><i className='icon-Edit-Icon'></i></Button>
                                </Box>
                              </Stack>

                              <Stack className='textfieledTreeList'>
                                <Box className='edit-field'>
                                  <TextField
                                    id="input-with-icon-textfield"
                                    placeholder='Select Dam'
                                    disabled={(salesLotsDetails?.isNamed === true ? true : false) && horsePedigreeDetails?.horseName}
                                    onChange={e => setText(e.target.value)}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {salesLotsDetails?.isVerified ? <i className='icon-Confirmed-24px'></i> : <i className='icon-Incorrect'></i>}
                                        </InputAdornment>
                                      ),
                                      readOnly: true,
                                    }}
                                    value={((horsePedigreeDetails?.horsePedigrees && horsePedigreeDetails?.horsePedigrees[1]?.length) ?
                                      toPascalCase(horsePedigreeDetails?.horsePedigrees[1][1]?.horseName) + `(${horsePedigreeDetails?.horsePedigrees[1][1]?.yob ? horsePedigreeDetails?.horsePedigrees[1][1]?.yob : ''},${horsePedigreeDetails?.horsePedigrees[1][1]?.cob ? String(horsePedigreeDetails?.horsePedigrees[1][1]?.cob)?.toUpperCase() : ''})`
                                      : salesLotsDetails?.damName ? toPascalCase(salesLotsDetails?.damName)  + ((salesLotInfo?.damYob && salesLotInfo?.damCob) ? `(${salesLotInfo?.damYob} , ${salesLotInfo?.damCob})` : salesLotInfo?.damYob ? ` (${salesLotInfo?.damYob})` : salesLotInfo?.damCob ? ` (${salesLotInfo?.damCob})` : '')
                                      : toPascalCase(verifyLotsDetails?.damName) + ((salesLotInfo?.damYob && salesLotInfo?.damCob) ? `(${salesLotInfo?.damYob} , ${salesLotInfo?.damCob})` : salesLotInfo?.damYob ? ` (${salesLotInfo?.damYob})` : salesLotInfo?.damCob ? ` (${salesLotInfo?.damCob})` : '')
                                      )}
                                    // value={toPascalCase((horsePedigreeDetails?.horsePedigrees && horsePedigreeDetails?.horsePedigrees[1]?.length) ? horsePedigreeDetails?.horsePedigrees[1][1]?.horseName : verifyLotsDetails?.damName ? verifyLotsDetails?.damName : salesLotsDetails?.damName)}
                                    variant="outlined"
                                  />
                                  <Button className='edit-btn' type='button'
                                    onClick={() => {
                                      setOpenModal(true);
                                      setHorseType('Dam');
                                    }}
                                    disabled={salesLotsDetails?.isNamed}
                                  ><i className='icon-Edit-Icon'></i></Button>
                                </Box>
                              </Stack>

                            </Grid>
                            <Grid item sm={12} md={12} className='textfieledTree Third-textfieledTree'>
                              <Box className='edit-field'>
                                <LoadingButton className='search-btn' onClick={handleVerifyLots} loading={runnerHorsePedigreeDetails ? runnerHorsePedigreeDetails.isFetching === true ? true : false : false}>{selectOneLot?.isVerified ? 'UnVerify' : 'Verify'} & Next</LoadingButton>
                                {/* <Button className='search-btn' onClick={handleVerifyLots} disabled={runnerHorsePedigreeDetails ? runnerHorsePedigreeDetails.isFetching === true ? true : false : false}>{selectOneLot?.isVerified ? 'UnVerify' : 'Verify'} & Next</Button> */}
                                {(salesLotsDetails?.verifiedBy && salesLotsDetails?.verifiedOn) && <Typography component='p' className='viewLotsHiglight'>Verified {salesLotsDetails?.verifiedOn ? parseDate(salesLotsDetails?.verifiedOn) : ''} by {salesLotsDetails?.verifiedBy ? salesLotsDetails?.verifiedBy : ''}</Typography>}
                              </Box>
                            </Grid>
                          </Grid>
                        </>
                      }

                      <Grid container spacing={0} className='ViewLots-ImportedData'>
                        <hr className='ImportedDataHr' />
                        <Grid item xs={12} md={12} mt={0} className='RawDataGroup'>
                          <Typography variant="h4" className='ImportedHeader'>Imported Data</Typography>

                          <Box className='FormGroup'>
                            <List className='RawDataList'>
                              <ListItem>
                                <ListItemText
                                  primary="Horse Name:"
                                  secondary={toPascalCase(selectOneLot?.horseName) ? toPascalCase(selectOneLot?.horseName) : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="DOB:"
                                  secondary={salesLotInfo?.dob ? salesLotInfo?.dob : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Sire:"
                                  secondary={salesLotInfo?.sireName ? toPascalCase(salesLotInfo?.sireName) + ' ' + ((salesLotInfo?.sireYob && salesLotInfo?.sireCob) ? `(${salesLotInfo?.sireYob}, ${salesLotInfo?.sireCob})` : salesLotInfo?.sireYob ? ` (${salesLotInfo?.sireYob})` : salesLotInfo?.sireCob ? ` (${salesLotInfo?.sireCob})` : '') : '-'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Dam:"
                                  secondary={salesLotInfo?.damName ? toPascalCase(salesLotInfo?.damName) + ' ' + ((salesLotInfo?.damYob && salesLotInfo?.damCob) ? `(${salesLotInfo?.damYob} , ${salesLotInfo?.damCob})` : salesLotInfo?.damYob ? ` (${salesLotInfo?.damYob})` : salesLotInfo?.damCob ? ` (${salesLotInfo?.damCob})` : '') : '-'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Grand Sire:"
                                  secondary={salesLotInfo?.grandSire ? toPascalCase(salesLotInfo?.grandSire) : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Dam Sire:"
                                  secondary={salesLotInfo?.damSire ? toPascalCase(salesLotInfo?.damSire) : '--'}
                                />
                              </ListItem>
                            </List>
                          </Box>

                          <Box className='FormGroup'>
                            <List className='RawDataList'>
                              <ListItem>
                                <ListItemText
                                  primary="Sex:"
                                  secondary={salesLotInfo?.sex ? salesLotInfo?.sex : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="In Foal:"
                                  secondary="No"
                                />
                              </ListItem>

                              <ListItem>
                                <ListItemText
                                  primary="Colour:"
                                  secondary={salesLotInfo?.horseColour ? salesLotInfo?.horseColour : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Lot Type:"
                                  secondary={salesLotInfo?.lotType ? salesLotInfo?.lotType : '--'}
                                />
                              </ListItem>

                            </List>
                          </Box>

                          <Box className='FormGroup'>
                            <List className='RawDataList'>
                              <ListItem>
                                <ListItemText
                                  primary="Vendor:"
                                  secondary={salesLotInfo?.venderName ? toPascalCase(salesLotInfo?.venderName) : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Price:"
                                  secondary={salesLotInfo?.price ? salesLotInfo?.price : '--'}
                                />
                              </ListItem>

                              <ListItem>
                                <ListItemText
                                  primary="Buyer:"
                                  secondary={salesLotInfo?.buyer && salesLotInfo?.buyer?.trim() ? salesLotInfo?.buyer : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Currency:"
                                  secondary={salesLotsDetails?.currency ? salesLotsDetails?.currency : '--'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Buyer Location: "
                                  secondary={salesLotInfo?.buyerLocation && salesLotInfo?.buyerLocation?.trim() ? salesLotInfo?.buyerLocation : '--'}
                                />
                              </ListItem>
                            </List>
                          </Box>

                          <Box className='FormGroup'>
                            <List className='RawDataList full'>
                              <ListItem>
                                <ListItemText
                                  primary="Sale last updated:"
                                  secondary={`${salesLotInfo?.salesLastUpdated ? parseDate(salesLotInfo?.salesLastUpdated) : ''}  ${salesLotInfo?.lastUpdatedBy ? salesLotInfo?.lastUpdatedBy : ''} `}
                                />
                              </ListItem>
                            </List>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* End Show selected lot info */}

                  </Grid>
                </Stack>

              </Box>
            </Box>

            {/* Based horse type open modal */}
            <SalesLotsHorseWrapperDialog
              title={`Select a Horse (${horseType})`}
              open={openModal}
              close={handleCloseModal}
              isStallion={horseType}
              salesLotsDetails={salesLotsDetails?.horseName ? salesLotsDetails : horsePedigreeDetails}
              handleVerifyAndNext={handleVerifyAndNext}
              setOpen
            />

            {/* Open Csv upload */}
            <UploadCSVFile ref={avatarRef} setSalesLotFile={setSalesLotFile} currentSale={currentSale} setUploadLotsError={setUploadLotsError} setUploadLotsSuccess={setUploadLotsSuccess} setUploadLotsResponse={setUploadLotsResponse} />
          </Container>
        </Box>
      </Page>
    </>
  );
}
