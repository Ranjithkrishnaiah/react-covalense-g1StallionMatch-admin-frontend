import * as React from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useFarmQuery } from 'src/redux/splitEndpoints/farmSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  MenuItem,
  TextField,
  Autocomplete,
  MenuList,
  Checkbox
} from '@mui/material';
import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
import { Images } from 'src/assets/images';
import { getsearchStallions, getSearchMareList, postBoodMareAfinityReport, postBoodMareSireReport, postShortlistStallionReport, postStallionAfinityReport, postStallionMatchProReport, postSalesCatelogueReport, getfarms, postStallionXBreedingStockReport } from 'src/redux/splitEndpoints/reportServicesSplit';
import { MenuProps } from 'src/constants/MenuProps';
import { toPascalCase } from 'src/utils/customFunctions';
import axios from 'axios';
import { useHorseAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { useFarmAutocompleteQuery } from 'src/redux/splitEndpoints/farmAutocompleteSplit';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import { debounce } from 'lodash';
import { useProductsQuery } from 'src/redux/splitEndpoints/productSplit';
import { useSalesByCountryIdQuery, useSalesLotBySalesIdQuery } from 'src/redux/splitEndpoints/salesSplit';
import { api } from 'src/api/apiPaths';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { Spinner } from 'src/components/Spinner';
// ----------------------------------------------------------------------

const drawerWidth = 364;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Stallion;



export default function OrderReportModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    setApiStatus, setApiStatusMsg
  } = props;

  // API call to get report lists from product api
  const { data: productResponse, isFetching: isProductFetching, isSuccess: isProductSuccess } = useProductsQuery({ order: 'ASC', page: 1, limit: 100 });
  const reportlist: any = productResponse?.data?.filter((item: any) => item?.categoryName === 'Report');

  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  const { data: countriesList } = useCountriesQuery();
  const { data: currencyList } = useCurrenciesQuery();

  const [field, setField] = React.useState<any>({
    report: 1,
    name: "",
    email: "",
    country: [],
    currencyId: "",
    horseId: "",
    stallionId: "",
    quantity: 0,
    confirmedStallion: "none",
    farms: [],
  });
  const filterCounterhook = useCounter(0);
  const [mareSelected, setMareSelected] = useState<any>();
  const [mareName, setMareName] = useState<any>("");
  const [mareOptionList, setMareOptionList] = useState<any>([]);
  const [isClearMare, setIsClearMare] = useState(0);
  const [isClearFarm, setIsClearFarm] = useState(0);
  const [stallionOptionList, setStallionOptionList] = useState<any>([]);
  const [stallionName, setStallionName] = useState<any>("");
  const [farmName, setFarmName] = useState<any>("");
  const [farmNameList, setFarmNameList] = useState<any>([]);
  const [selectedFarmList, setSelectedFarmList] = useState<any>([]);
  const [selectedStallion, setSelectedStallion] = useState<any>(null);
  const [isClearStallion, setIsClearStallion] = useState<any>(0)
  const [saleList, setSaleList] = useState<any>([]);
  const [lotsList, setLotsList] = useState<any>([]);
  const [saleListSelected, setSaleListSelected] = useState<any>([]);
  const [saleLotsSelected, setSaleLotsSelected] = useState<any>([]);

  const [lotsName, setLotsName] = useState<any>('');
  const [salesName, setSalesName] = useState<any>('');

  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [reportModuleAccess, setReportModuleAccess] = useState({
    report_admin_new_order: false,
  });

  // Check permission to access the member module
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
    if (valuesExist.hasOwnProperty('REPORTS_ADMIN_CREATE_NEW_ORDER')) {
      setUserModuleAccess(true);
    }
    setReportModuleAccess({
      ...reportModuleAccess,
      report_admin_new_order: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_CREATE_NEW_ORDER') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const setInputValueLots = (event: any) => {
    const searchKey = event?.target?.value;
    setLotsName(searchKey)
    if (searchKey?.length >= 1) {
      const filteredData = lotsList?.filter((lotsData: any) =>
        lotsData?.lotsValue?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setSaleLotsSelected(filteredData);
    }
  };

  const setInputValueSales = (event: any) => {
    const searchKey = event?.target?.value;
    setSalesName(searchKey)
    if (searchKey?.length >= 3) {
      const filteredData = saleList?.filter((sale: any) =>
        sale?.saleName.toLowerCase().includes(searchKey.toLowerCase())
      );
      setSaleListSelected(filteredData);
    }
  };

  // const fetchSelectLots = (ids: any) => {
  //   const lotsData = {
  //     "sales": ids
  //   }

  //   axios.post(`${api.frontendUrl}/sales-lot/by-sales`, lotsData).then(res => {
  //     if (res) {
  //       setLotsList(res)
  //     }
  //   })
  // }

  // const fetchSelectedSales = (value: any) => {
  //   axios.get(`${api.frontendUrl}/sale/${value}`).then(res => {
  //     if (res) {
  //       setSaleList(res)
  //     }
  //   })
  // }

  const selectedSaleListIds: any = saleListSelected?.map((item: any) => {
    if (item?.saleId) {
      return item?.saleId;
    } else {
      return Number(item?.id)
    }
  }) || [];

  // useEffect(() => {
  //   if (saleListSelected?.length) {
  //     fetchSelectLots(selectedSaleListIds)
  //   }
  // }, [saleListSelected])

  const actionType: any = field?.report;





  const { data: farmData } = useFarmQuery(rowId, { skip: (!isEdit) });
  const currentFarm = farmData;

  const NewFarmSchema = Yup.object().shape({
    farmName: Yup.string().required('Farm Name is required'),
    countryId: Yup.number().required('country is required'),
    stateId: Yup.number().required('State is required'),
    website: Yup.string().required('Website is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      farmName: currentFarm?.farmName || '',
      countryId: currentFarm?.countryId || 0,
      stateId: currentFarm?.stateId || 0,
      website: currentFarm?.website || '',
      totalStallions: currentFarm?.totalStallions || 0,
      serviceFeeStatus: currentFarm?.serviceFeeStatus || 0,
      promoted: currentFarm?.promoted || 0,
      users: currentFarm?.users || 0,
      id: currentFarm?.id || '',
      received: currentFarm?.received || 0,
      sent: currentFarm?.sent || 0,
      isPromoted: currentFarm?.isPromoted || false,
      isActive: currentFarm?.isActive || false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
  } = methods;


  React.useEffect(() => {
    if (isEdit && currentFarm) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  const [selectedSalesIds, setSelectedSalesIds] = React.useState("");
  const [isSalesSelected, setIsSalesSelected] = React.useState(false);
  const [countryID, setCountryID] = React.useState((currentFarm?.countryId > 0) ? currentFarm?.countryId : 0);
  const [isCountrySelected, setIsCountrySelected] = React.useState((currentFarm?.countryId > 0) ? true : false);
  const { data: salesOptionList, isFetching: isSalesFetching, isSuccess: isSalesSuccess, refetch: refetchSalesCountryId } = useSalesByCountryIdQuery(countryID, { skip: (!isCountrySelected) }); //, refetchOnMountOrArgChange: true
  const { data: salesLotOptionList, isFetching: isSalesLotFetching, isSuccess: isSalesLotSuccess, refetch: refetchSalesLot } = useSalesLotBySalesIdQuery(selectedSalesIds, { skip: (!isSalesSelected) }); //, refetchOnMountOrArgChange: true


  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: (!isCountrySelected) });
  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);

  const handleChange = (type: string, value: any) => {
    setField({
      ...field,
      [type]: value
    })
  }

  const handleSelectedSales = (selectedOptions: any) => {
    let selectedOpt: any = [];
    selectedOpt.push(selectedOptions);
    // setSaleListSelected([...selectedOpt]);
    setSaleLotsSelected([]);
    // Extract saleId values and join them into a comma-separated string
    const commaSeparatedIds = selectedOptions.flat().map((sale: any) => sale.saleId).join(', ');
    setSelectedSalesIds(commaSeparatedIds);
    setIsSalesSelected(true);
    const selectedSaleListIds: any = selectedOptions?.map((item: any) => {
      if (item?.saleId) {
        return item?.saleId;
      } else {
        return Number(item?.id)
      }
    }) || [];
    setSaleListSelected(selectedSaleListIds);
  }

  const handleChangeCountry = (type: string, value: any) => {
    setField({
      ...field,
      ["country"]: typeof value === 'string' ? value.split(',') : value,
    })

    if (actionType === 4 || actionType === 14) {
      // fetchSelectedSales(typeof value === 'string' ? value.split(',') : value)
      setCountryID(typeof value === 'string' ? value.split(',') : value);
      setIsCountrySelected(true);
    }
  }

  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
  };

  console.log('field>>>', field, 'selectedSaleListIds>>>', saleListSelected);

  const handleClearField = () => {
    setField({
      report: 1,
      name: "",
      email: "",
      country: [],
      currencyId: "",
      horseId: "",
      stallionId: "",
      quantity: 0,
      confirmedStallion: "none",
      farms: [],
    })
    setMareSelected(null);
    setSaleListSelected([])
    setSaleLotsSelected([]);
    handleDrawerCloseRow();
    setSelectedFarmList([]);
    setSelectedStallion(null)
  }

  const handleResetOnReportChange: any = (value: any) => {
    setField({
      report: value,
      name: "",
      email: "",
      country: [],
      currencyId: "",
      horseId: "",
      stallionId: "",
      quantity: 0,
      confirmedStallion: "none",
      farms: [],
    })
    setMareSelected(null);
    setSaleListSelected([]);
    setSaleLotsSelected([]);
    setSelectedStallion(null);
    setSelectedFarmList([]);
  }

  const handleSubmitReport = async () => {


    let payloadData: any = {};

    if (actionType === 1) {
      payloadData = {
        actionType: 'create',
        currencyId: field?.currencyId,
        stallions: selectedStallion.map((val: any) => val.stallionId),
        countryId: field?.country,
        mareId: field.horseId,
        // postalCode: "",
        // orderProductId: 0
      }
      await postShortlistStallionReport(payloadData).then(() => {
        setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
        setApiStatus(true);
        handleClearField()
      }).catch(() => {
        handleClearField()
        setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
        setApiStatus(true);
      })
    }

    if (actionType === 2) {
      payloadData = {
        actionType: 'create',
        currencyId: field?.currencyId,
        countryId: field?.country,
        stallions: selectedStallion.map((val: any) => val.stallionId),
        mareId: field.horseId,
        locations: [field?.country],
        // postalCode: "",
        // orderProductId: 0
      }
      await postStallionMatchProReport(payloadData).then(() => {
        setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
        setApiStatus(true);
        handleClearField()
      }).catch(() => {
        handleClearField()
        setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
        setApiStatus(true);
      })
    }

    if (actionType === 3 || actionType === 6) {
      payloadData = {
        locations: [field?.country],
        countryId: field?.country,
        actionType: 'create',
        currencyId: field?.currencyId,
        mareId: field.horseId,
        // postalCode: "",
        // orderProductId: 0
      }
      if (actionType === 6) {
        await postBoodMareSireReport(payloadData).then(() => {
          setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
          setApiStatus(true);
          handleClearField()
        }).catch(() => {
          handleClearField()
          setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
          setApiStatus(true);
        })
      } else {
        await postBoodMareAfinityReport(payloadData).then(() => {
          setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
          setApiStatus(true);
          handleClearField()
        }).catch(() => {
          handleClearField()
        })
      }
    }

    if (actionType === 4) {
      payloadData = {
        actionType: 'create',
        currencyId: field?.currencyId,
        location: field?.country,
        countryId: field?.country,
        // sales: [...selectedSaleListIds.map((val: any) => val.id)],
        sales: saleListSelected,
        lots: [...saleLotsSelected.map((val: any) => val.lotsValue)],
        // postalCode: "",
        // orderProductId: 0
      }
      await postSalesCatelogueReport(payloadData).then(() => {
        setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
        setApiStatus(true);
        handleClearField()
      }).catch(() => {
        setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
        setApiStatus(true);
        handleClearField()
      })
    }

    if (actionType === 14) {
      payloadData = {
        actionType: 'create',
        currencyId: field?.currencyId,
        location: field?.country,
        countryId: field?.country,
        // sales: [...selectedSaleListIds],
        sales: saleListSelected,
        lots: [...saleLotsSelected.map((val: any) => val.salesLotId)],
        stallionId: selectedStallion ? selectedStallion?.stallionId : '',
        // postalCode: "",
        // orderProductId: 0
      }
      await postStallionXBreedingStockReport(payloadData).then(() => {
        setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
        setApiStatus(true);
        handleClearField()
      }).catch(() => {
        setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
        setApiStatus(true);
        handleClearField()
      })
    }

    if (actionType === 5) {
      payloadData = {
        actionType: 'create',
        currencyId: field?.currencyId,
        countryId: field?.country,
        stallionId: field?.stallionId,
        farms: selectedFarmList.map((val: any) => val.farmId),
        // postalCode: "",
        // orderProductId: 0
      }
      // let res: any = await postStallionAfinityReport(payloadData)
      // console.log(res, 'ERROR123')
      await postStallionAfinityReport(payloadData).then(() => {
        setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
        setApiStatus(true);
        handleClearField()
      }).catch(() => {
        setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
        setApiStatus(true);
        handleClearField()
      })
      // if(res.)
      // .then(() => {
      //   setApiStatusMsg({ 'status': 201, 'message': 'Order report created successfully!' });
      //   setApiStatus(true);
      //   handleClearField()
      //   setSelectedStallion([])
      // }).catch((err:any) => {
      //   setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs' });
      //   setApiStatus(true);
      //   handleClearField()
      // })
    }
  }
  // console.log(selectedStallion,selectedSaleListIds,saleLotsSelected, 'field')
  const checkOrderFormValidation = () => {
    if (actionType === 5) {
      if (field?.currencyId && field?.country && field?.stallionId && selectedFarmList?.length !== 0) {
        return false;
      } else {
        return true;
      }
    }

    if (actionType === 4 || actionType === 14) {
      if (field?.currencyId && field?.country && saleLotsSelected?.length !== 0 && selectedSaleListIds?.length !== 0) {
        return false;
      } else {
        return true;
      }
    }

    // if (actionType === 2) {
    //   if (field?.currencyId && field?.country  && (typeof(selectedStallion) != 'undefined' && selectedStallion?.length !== 0) && field.horseId) {
    //     return false;
    //   } else {
    //     return true;
    //   }
    // }

    if (actionType === 1 || actionType === 2) {
      if (field?.currencyId && field?.country && ((selectedStallion !== null) && selectedStallion?.length !== 0) && field.horseId) {
        return false;
      } else {
        return true;
      }
    }

    if (actionType === 3 || actionType === 6) {
      if (field?.currencyId && field?.country && field.horseId) {
        return false;
      } else {
        return true;
      }
    }
  }

  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  }



  // Create payload ariable for Stallion Search autocomplete
  const stallionNameData: any = {
    stallionName: stallionName
  }

  // Create payload variable for Mare Search autocomplete
  const mareNameData: any = {
    horseName: mareName,
    sex: 'f'
  };

  // Create payload ariable for Farm Search autocomplete
  const farmNameData: any = {
    farmName: farmName,
    isFarmNameExactSearch: false,
    order: 'ASC'
  }

  const [isStallionSearch, setIsStallionSearch] = useState(false);
  const [isMareSearch, setIsMareSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStallionLoading, setIsStallionLoading] = useState(false);
  const [isFarmSearch, setIsFarmSearch] = useState(false);
  const [isFarmLoading, setIsFarmLoading] = useState(false);

  // Stallion search api call
  const { data: stallionNamesList, isFetching: isStallionFetching, refetch: refetchStallion, isSuccess: isStallionSuccess } = useStallionAutocompleteQuery(stallionName, { skip: (!isStallionSearch) });

  // Mare search api call
  const { data: mareNamesList, isFetching: isMareFetching, isSuccess: isMareSuccess, refetch: refetchMare } = useHorseAutocompleteSearchQuery(mareNameData, { skip: (!isMareSearch) });

  // Farm search api call
  const { data: farmNamesList, isFetching: isFarmFetching, refetch: refetchFarm, isSuccess: isFarmSuccess } = useFarmAutocompleteQuery(farmNameData, { skip: (!isFarmSearch) });


  const handleMareInput = async (e: any) => {
    setIsClearMare(0);
    setMareName(e?.target?.value);
    debouncedMareName(e?.target?.value);
  };

  // Debounce functionality to restrict concurrent api call
  const debouncedMareName = React.useRef(
    debounce(async (horseName) => {
      if (horseName?.length >= 3) {
        await setMareName(horseName);
        await setIsMareSearch(true);
        setIsLoading(false);
        refetchMare();
      } else {
        setIsLoading(false)
        setMareName(horseName);
      }
    }, 1000)
  ).current;

  useEffect(() => {
    if (isMareSuccess) {
      setMareOptionList(mareNamesList)
    }
  }, [isMareFetching]);

  const handleMareOptionsReset = () => {
    setIsClearMare(1);
    setMareName('');
    setIsMareSearch(false);
    setMareOptionList([]);
  }

  // Handle stallion input change
  const handleStallionInput = (e: any) => {
    setIsStallionLoading(true)
    debouncedStallionName(e?.target?.value);
  };

  // Debounce functionality to restrict concurrent api call
  const debouncedStallionName = React.useRef(
    debounce(async (horseName) => {
      if (horseName?.length >= 3) {
        await setStallionName(horseName);
        await setIsStallionSearch(true);
        setIsStallionLoading(false);
        refetchStallion();
      } else {
        setIsStallionLoading(false)
        setStallionName(horseName);
      }
    }, 1000)
  ).current;

  const handleStallionOptionsReset = () => {
    setIsClearStallion(1);
    setStallionName('');
    setIsStallionSearch(false);
    setStallionOptionList([]);
  }

  useEffect(() => {
    if (isStallionSuccess) {
      setStallionOptionList(stallionNamesList?.data)
    }
  }, [isStallionFetching]);


  // Handle farm input change
  const handleFarmInput = (e: any) => {
    setIsFarmLoading(true)
    debouncedFarmName(e?.target?.value);
  };

  // Debounce functionality to restrict concurrent api call
  const debouncedFarmName = React.useRef(
    debounce(async (farmName) => {
      if (farmName?.length >= 3) {
        await setFarmName(farmName);
        await setIsFarmSearch(true);
        setIsFarmLoading(false);
        refetchFarm();
      } else {
        setIsFarmLoading(false)
        setFarmName(farmName);
      }
    }, 1000)
  ).current;

  const handleFarmOptionsReset = () => {
    setIsClearFarm(1);
    setFarmName('');
    setIsFarmSearch(false);
    setFarmNameList([]);
  }

  useEffect(() => {
    if (isFarmSuccess) {
      setFarmNameList(farmNamesList);
    }
  }, [isFarmFetching]);


  const countryValue = () => {
    return (
      <Box className='FormGroup edit-field orderReport'>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your Country
        </Typography>
        <Select
          MenuProps={{
            disableScrollLock: true,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left"
            },
            ...MenuProps
          }}
          displayEmpty
          IconComponent={KeyboardArrowDownRoundedIcon}
          value={field?.country || 'defaultValue'}
          onChange={(e) => handleChangeCountry("country", e.target.value)}
          className="countryDropdown filter-slct"
          defaultValue={'defaultValue'}
          name="expiredStallion">
          <MenuItem className="selectDropDownList reportSelectCountry"
            value=""
            disabled><em>Select Country</em></MenuItem>
          {countriesList?.map(({ id, countryName }) => {
            return (
              <MenuItem className="selectDropDownList reportSelectCountry" value={id} key={id}>
                {countryName}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
    )
  }

  const currencyValue = () => {
    return (
      <Box className='FormGroup edit-field'>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your Currency
        </Typography>
        <Select
          placeholder='Your Currency'
          MenuProps={{
            disableScrollLock: true,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left"
            },
            ...MenuProps
          }}
          IconComponent={KeyboardArrowDownRoundedIcon}
          value={field?.currencyId}
          displayEmpty
          onChange={(e) => handleChange("currencyId", e.target.value)}
          className="countryDropdown filter-slct" defaultValue="none" name="expiredStallion">
          <MenuItem className="selectDropDownList reportSelectCountry" value="" disabled>
            <>Currency</>
          </MenuItem>
          {currencyList?.map((item: any) => {
            return (
              <MenuItem
                className="selectDropDownList reportSelectCountry"
                value={item?.id}
                key={item.id}
              >
                {item?.currencyCode}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
    )
  }
  const searchMare = () => {
    return (
      <Box className='FormGroup edit-field orderReport'>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your Mare
        </Typography>
        <Autocomplete
          disablePortal
          popupIcon={<KeyboardArrowDownRoundedIcon />}
          id="checkboxes-tags-demo"
          options={mareOptionList || []}
          onInputChange={handleMareInput}
          sx={{ margin: '0px', padding: '0px' }}
          noOptionsText={
            isMareSearch &&
            mareName != '' &&
            isClearMare === 0 && (
              <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                <span className="fw-bold sorry-message">
                  {isMareFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${mareName}"`}
                </span>
              </Box>
            )
          }
          getOptionLabel={(option: any) => `${Object.keys(option).length ? `${toPascalCase(option?.horseName)?.toString()} (${option.countryCode}) ${option.yob}` : ''}`}
          onChange={(e, selectedOptions: any) => {
            setMareSelected(selectedOptions);
            handleChange("horseId", selectedOptions?.horseId)
          }}
          value={mareSelected || null}
          renderOption={(props, option: any) => (
            <li className='searchstallionListBox'{...props}>
              <span className='stallionListBoxName'>{toPascalCase(option.horseName)} ({option.countryCode}) {option.yob}</span>
            </li>
          )}
          renderInput={(params: any) => (
            <TextField {...params}
              name="mare-name"
              className="edit-field"
              placeholder='Enter Mare Name'
            />
          )}
          onBlur={handleMareOptionsReset}
        />
      </Box>
    )
  }


  const searchFarm = (type = '') => {
    return (
      <Box className={`FormGroup edit-field reportModalForm orderReport ${selectedFarmList?.length && "selectedStall"}`}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your Farm
        </Typography>
        <Autocomplete
          disablePortal
          id="checkboxes-tags-demo"
          options={farmNameList?.length ? farmNameList : []}
          popupIcon={<KeyboardArrowDownRoundedIcon />}
          ChipProps={{ deleteIcon: <CloseIcon /> }}
          multiple
          disableCloseOnSelect
          value={selectedFarmList}
          onInputChange={handleFarmInput}
          noOptionsText={
            isFarmSearch &&
            farmName != '' &&
            isClearFarm === 0 && (
              <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                <span className="fw-bold sorry-message">
                  {isFarmFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${farmName}"`}
                </span>
              </Box>
            )
          }
          sx={{ margin: '0px', padding: '0px' }}
          getOptionLabel={(option: any) => `${toPascalCase(option?.farmName)?.toString()}`}
          onChange={(e, selectedOptions: any) => {
            setSelectedFarmList(selectedOptions);
          }}

          renderOption={(props, option, { selected }) => {
            return (
              <MenuList sx={{ boxShadow: 'none' }}>
                <MenuItem {...props} disableRipple className="LoactionFilter reportfilter">
                  <span
                    style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                  >
                    {option?.farmName}
                  </span>
                  <Checkbox
                    checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                    checked={selected}
                    disableRipple
                  />
                </MenuItem>
              </MenuList>
            );
          }}
          renderInput={(params: any) => (
            <TextField {...params} placeholder={selectedFarmList?.length ? '' : 'Select Farm'} />
          )}
          onBlur={handleFarmOptionsReset}
        />
      </Box>
    )
  }


  const searchStallion = (type = '') => {
    return (
      <Box className={`FormGroup edit-field orderReport reportModalForm ${selectedStallion?.length && "selectedStall"}`}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your Stallion
        </Typography>
        {
          type !== 'multi' ?
            <Autocomplete
              disablePortal
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              id="checkboxes-tags-demo"
              options={stallionOptionList || []}
              onInputChange={handleStallionInput}
              sx={{ margin: '0px', padding: '0px' }}
              getOptionLabel={(option: any) => `${option ? `${toPascalCase(option?.horseName)} ${" - "} ${option?.yob}` : ''}`}
              onChange={(e, selectedOptions: any) => {
                setSelectedStallion(selectedOptions);
                handleChange("stallionId", selectedOptions?.stallionId)
              }}
              value={selectedStallion || null}
              noOptionsText={
                isStallionSearch &&
                stallionName != '' &&
                isClearStallion === 0 && (
                  <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                    <span className="fw-bold sorry-message">
                      {isStallionFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${stallionName}"`}
                    </span>
                  </Box>
                )
              }
              renderOption={(props, option: any) => (
                <li className='searchstallionListBox'{...props}>
                  <span className='stallionListBoxName'>{toPascalCase(option?.horseName)} {" - "} {option?.yob}</span>
                </li>
              )}
              renderInput={(params: any) => (
                <TextField {...params}
                  name="mare-name"
                  className="edit-field"
                  placeholder={'Enter Stallion'}
                />
              )}
              onBlur={handleStallionOptionsReset}
            />
            :
            <Autocomplete
              disablePortal
              id="checkboxes-tags-demo"
              options={stallionOptionList?.length ? stallionOptionList : []}
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              ChipProps={{ deleteIcon: <CloseIcon /> }}
              multiple
              disableCloseOnSelect
              value={selectedStallion ? selectedStallion : stallionOptionList?.length ? [] : ''}
              onInputChange={handleStallionInput}
              sx={{ margin: '0px', padding: '0px' }}
              noOptionsText={
                isStallionSearch &&
                stallionName != '' &&
                isClearStallion === 0 && (
                  <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                    <span className="fw-bold sorry-message">
                      {isStallionFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${stallionName}"`}
                    </span>
                  </Box>
                )
              }
              getOptionLabel={(option: any) => `${option ? `${toPascalCase(option?.horseName)} ${" - "} ${option?.yob}` : ''}`}
              onChange={(e, selectedOptions: any) => {
                setSelectedStallion(selectedOptions);
              }}
              renderOption={(props, option, { selected }) => {
                return (
                  <MenuList sx={{ boxShadow: 'none' }}>
                    <MenuItem {...props} disableRipple className="LoactionFilter reportfilter">
                      <span
                        style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                      >
                        {toPascalCase(option?.horseName)} {" - "} {option?.yob}
                      </span>
                      <Checkbox

                        checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                        checked={selected}
                        disableRipple
                      />
                    </MenuItem>
                  </MenuList>
                );
              }}
              renderInput={(params: any) => (
                <TextField {...params} placeholder={selectedStallion?.length ? " " : 'Select Stallion'} />
              )}
              onBlur={handleStallionOptionsReset}
            />
        }
      </Box>
    )
  }



  const renderSaledAndLots = () => {
    return (
      <>
        <Box className={`FormGroup edit-field reportModalForm orderReport`}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Your Sale
          </Typography>
          <Autocomplete
            disablePortal
            id="checkboxes-tags-demo"
            options={salesOptionList?.length ? salesOptionList : []}
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            ChipProps={{ deleteIcon: <CloseIcon /> }}
            multiple
            disableCloseOnSelect
            onInputChange={(e) => setInputValueSales(e)}
            noOptionsText={lotsName?.length ? 'No options found' : ''}
            sx={{ margin: '0px', padding: '0px' }}
            getOptionLabel={(option: any) => `${toPascalCase(option?.salesName)?.toString()}`}
            // onChange={(e, selectedOptions: any) => {
            //   let selectedOpt: any = [];
            //   selectedOpt.push(selectedOptions);
            //   setSaleListSelected([...selectedOpt]);
            //   setSaleLotsSelected([]);
            // }}
            onChange={(e, selectedOptions: any) => {
              handleSelectedSales(selectedOptions);
            }}
            renderOption={(props, option, { selected }) => {
              return (
                <MenuList sx={{ boxShadow: 'none' }} >
                  <MenuItem {...props} disableRipple className="LoactionFilter reportfilter" onWheel={() => { }}>
                    <span
                      style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                    >
                      {toPascalCase(option?.salesName)}
                    </span>
                    <Checkbox
                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                      checked={selected}
                      disableRipple
                    />
                  </MenuItem>
                </MenuList>
              );
            }}
            renderInput={(params: any) => (
              <TextField {...params} placeholder={'Select Sale'} />
            )}
          />
        </Box>
        <Box className={`FormGroup edit-field reportModalForm orderReport ${saleLotsSelected?.length && "selectedStall"}`}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Your Lots
          </Typography>
          <Autocomplete
            disablePortal
            id="checkboxes-tags-demo"
            options={salesLotOptionList?.length ? salesLotOptionList : []}
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            ChipProps={{ deleteIcon: <CloseIcon /> }}
            filterSelectedOptions
            multiple
            disableCloseOnSelect
            value={saleLotsSelected?.length ? saleLotsSelected : []}
            noOptionsText={salesName?.length ? 'No options found' : ''}
            onInputChange={(e) => setInputValueLots(e)}
            sx={{ margin: '0px', padding: '0px' }}
            getOptionLabel={(option: any) => String(option?.salesLotId)}
            onChange={(e, selectedOptions: any) => {
              setSaleLotsSelected(selectedOptions);
            }}

            renderOption={(props, option, { selected }) => {
              return (
                <MenuList sx={{ boxShadow: 'none' }}>
                  <MenuItem {...props} disableRipple className="LoactionFilter reportfilter">
                    <span
                      style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                    >
                      {option?.salesLotId} Gender - {option?.gender}
                    </span>
                    <Checkbox
                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                      checked={selected}
                      disableRipple
                    />
                  </MenuItem>
                </MenuList>
              );
            }}
            renderInput={(params: any) => (
              <TextField {...params} placeholder={saleLotsSelected?.length ? '' : 'Select Lots'} />
            )}
          />
        </Box>
      </>
    )
  }

  const closeModal = () => {
    handleClearField()
    if (isEdit) {
      handleCloseModal()
    } else {
      handleDrawerCloseRow()
    }
  }

  return (
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root':
        {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className='filter-section DrawerRightModal members-rightbar  orderReportModal'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader className='member-header'>

          <IconButton className='closeBtn' onClick={() => closeModal()}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>

          <Box>
            <Typography variant="h3">Order Report</Typography>
          </Box>
        </DrawerHeader>

        {isFetchingAccessLevel && filterCounterhook.value < 2 ? (
          <Box className="Spinner-Wrp">
            <Spinner />
          </Box>
        ) : filterCounterhook.value >= 2 && reportModuleAccess.report_admin_new_order === false ? (
          <UnAuthorized />
        ) : (
          <Box px={5} className="edit-section">
            <form>
              <Box px={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>

                    <Box className="FormGroup">
                      <Box className='edit-field scroll-lock-country'>
                        <Select
                          MenuProps={{
                            className: 'common-scroll-lock',
                            disableScrollLock: true,
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'right',
                            },
                            transformOrigin: {
                              vertical: "top",
                              horizontal: "right"
                            },
                            ...MenuPropss
                          }}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="yearToStud"
                          placeholder="yearToStud"
                          className="filter-slct"
                          value={field?.report}
                          onChange={(e) => {
                            handleResetOnReportChange(e.target.value)
                          }
                          }
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled><em>Reports</em></MenuItem>
                          {reportlist?.map((item: any, index: any) => {
                            return <MenuItem key={index} className="selectDropDownList" value={item?.id}>{item?.productName}</MenuItem>
                          })}
                        </Select>
                      </Box>
                    </Box>
                    {actionType === 1 ?
                      <>
                        {currencyValue()}
                        {countryValue()}
                        {searchMare()}
                        {searchStallion('multi')}
                      </>
                      : ""
                    }

                    {actionType === 2 ?
                      <>
                        {currencyValue()}
                        {searchMare()}
                        {searchStallion('multi')}
                        {countryValue()}

                      </>
                      : ""
                    }

                    {actionType === 3 || actionType === 6 ?
                      <>
                        {currencyValue()}
                        {countryValue()}
                        {searchMare()}
                      </>
                      : ""
                    }

                    {actionType === 4 ?
                      <>
                        {currencyValue()}
                        {countryValue()}
                        {renderSaledAndLots()}
                      </>
                      : ""
                    }

                    {actionType === 14 ?
                      <>
                        {searchStallion('')}
                        {currencyValue()}
                        {countryValue()}
                        {renderSaledAndLots()}
                      </>
                      : ""
                    }

                    {actionType === 5 ?
                      <>
                        {currencyValue()}
                        {countryValue()}
                        {searchStallion('single')}
                        {searchFarm()}
                      </>
                      : ""
                    }

                    <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                      <LoadingButton
                        className="search-btn"
                        type="button"
                        variant="contained"
                        disabled={checkOrderFormValidation()}
                        // loading={true}
                        onClick={() => handleSubmitReport()}
                      >
                        {!isEdit ? 'Order Report' : 'Order Report'}
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        )
        }
        <DeleteConversationWrapperDialog title="Are you sure?" open={openDeleteConversationWrapper} close={handleCloseDeleteConversationWrapper} />
      </Scrollbar>
    </Drawer>
  );
}