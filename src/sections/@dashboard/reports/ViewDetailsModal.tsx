import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Repeat from 'src/assets/Images/Repeat.svg';

import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  FormProvider,
} from 'src/components/hook-form';
import CloseIcon from '@mui/icons-material/Close';

import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useDispatch } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import {
  useAddFarmMutation,
  useEditFarmMutation,
} from 'src/redux/splitEndpoints/farmSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import 'src/sections/@dashboard/system/usermanagement/dropdown.css'
import Select from '@mui/material/Select';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TextField,
  Autocomplete,
  MenuList,
  Checkbox,
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { CancelRefundWrapperDialog } from 'src/components/reports-modal/CancelRefundWrapper';

import {
  getsearchStallions,
  getSearchMareList,
  postBoodMareAfinityReport,
  postBoodMareSireReport,
  postShortlistStallionReport,
  postStallionAfinityReport,
  postStallionMatchProReport,
  postSalesCatelogueReport,
  getfarms,
  postStallionXBreedingStockReport,
} from 'src/redux/splitEndpoints/reportServicesSplit';

import { Images } from 'src/assets/images';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { MenuProps } from 'src/constants/MenuProps';
import { parseDateTime, scrollToTop, toPascalCase } from 'src/utils/customFunctions';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { api } from 'src/api/apiPaths';
import { useRunnersGetRatingQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import CsvLink from 'react-csv-export';
import { useGetStallionByFeeAndLocationQuery } from 'src/redux/splitEndpoints/reportsSplit';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#C75227' : '#C75227',
  },
}));

const BorderLinearProgress1 = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#007142' : '#007142',
  },
}));

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

const drawerWidth = 654;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Stallion;

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};
const lotsArray = [
  { id: 1, lotsValue: '1' },
  { id: 2, lotsValue: '2' },
  { id: 3, lotsValue: '3' },
  { id: 4, lotsValue: '4' },
  { id: 5, lotsValue: '5' },
  { id: 6, lotsValue: '6' },
];

export default function ViewDetailsModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    dataDetails,
    loadingMain,
    apiStatus, setApiStatus,
    apiStatusMsg, setApiStatusMsg,
    reportModuleAccess, setReportModuleAccess,
    clickedPopover, setClickedPopover
  } = props;

  const {
    clientName,
    productId,
    orderProductId,
    currencyCode,
    currencySymbol,
    status,
    productName,
    email,
    noOfStallions,
    damName,
    discount,
    horseId,
    horseUuid,
    horseName,
    orderId,
    paymentStatus,
    statusTime,
    paymentMethod,
    promoCode,
    yob,
    cob,
    sireName,
    subTotal,
    total,
    isLinkActive,
    reportLink,
    tax,
    stallions,
  } = dataDetails;
  const { currentData: runnerRatingDetails } = useRunnersGetRatingQuery(horseUuid, { skip: !horseUuid, refetchOnMountOrArgChange: true })
  const [openSelectStallion, setOpenSelectStallion] = useState(true);

  const navigate = useNavigate();

  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

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
    if (!horseUuid) {
      rating = 0;
    }

    return rating;
  }

  const BorderLinearProgress2 = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: runnerRatingDetails?.length ? runnerRatingDetails[0]?.accuracyRating === 'Poor' ? '#C75227' : '#1D472E' : '#C75227',
    },
  }));

  const theme = useTheme();
  const [addFarm] = useAddFarmMutation();
  const [editFarm] = useEditFarmMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();

  const { data: currencyList } = useCurrenciesQuery();

  const dispatch = useDispatch();
  const treeDropdownRef = React.useRef<any>();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [sendButtonLoading, setSendButtonLoading] = useState(false);

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [saleList, setSaleList] = useState<any>([]);
  const [lotsList, setLotsList] = useState<any>([]);
  const [saleListSelected, setSaleListSelected] = useState<any>([]);
  const [saleLotsSelected, setSaleLotsSelected] = useState<any>([]);
  const [selectedSale, setselectedSale] = useState<any>({});
  const [stallionListProReport, setStallionListProReport] = useState<any>([]);
  const [stallionSelectedListProReport, setStallionSelectedListProReport] = useState<any>([]);
  const [emailToShare, setEmailToShare] = useState<any>('');
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const [minAmount, setMinAmount] = useState<any>(null);
  const [maxAmount, setMaxAmount] = useState<any>(null);

  const [lotsName, setLotsName] = useState<any>('');
  const [salesName, setSalesName] = useState<any>('');

  const [field, setField] = React.useState<any>({
    report: 1,
    name: '',
    email: '',
    country: [],
    currencyId: '',
    mareId: '',
    stallionId: '',
    quantity: 0,
    confirmedStallion: 'none',
    farms: [],
    reportCountryId: ''
  });

  const setInputValueLots = (event: any) => {
    const searchKey = event.target.value;
    setLotsName(searchKey);
    if (searchKey?.length >= 1) {
      const filteredData = lotsList?.filter((lotsData: any) =>
        lotsData?.lotsValue?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setSaleLotsSelected(filteredData);
    }
  };

  const setInputValueSales = (event: any) => {
    const searchKey = event?.target?.value;
    setSalesName(searchKey);
    if (searchKey?.length >= 3) {
      const filteredData = saleList?.filter((sale: any) =>
        sale?.saleName.toLowerCase().includes(searchKey.toLowerCase())
      );
      setSaleListSelected(filteredData);
    }
  };

  const fetchSelectLots = (ids: any) => {
    const lotsData = {
      sales: ids,
    };

    axios.post(`${api.frontendUrl}/sales-lot/by-sales`, lotsData).then((res) => {
      if (res) {
        let list: any = [];
        let response: any = res;
        // response?.map((record: any, index: number) => {
        //   list.push({
        //     label: `${record.gender}-${record.salesLotId}`,
        //     value: record.salesLotId,
        //     children: [],
        //     id: record.salesLotId,
        //   });
        // });

        list = response?.map((v: any, i: number) => {
          let obj: any = {};
          for (let index = 0; index < dataDetails?.lotId?.length; index++) {
            const element = dataDetails?.lotId[index];
            obj.label = `${v.gender}-${v.salesLotId}`;
            obj.value = v.salesLotId;
            obj.children = [];
            obj.id = v.salesLotId;
            if (element === v.salesLotId) {
              obj.checked = true;
            }
          }
          return obj;
        })
        // console.log(list, 'LIST!!!')
        setLotsList(list);

      }
    });
  };

  const fetchSelectedSales = (value: any) => {
    axios.get(`${api.frontendUrl}/sale/${value}`).then((res) => {
      if (res) {
        setSaleList(res);
        // setselectedSale(null);
      }
    });
  };

  const handleChangeCountry = (type: string, value: any) => {
    setField({
      ...field,
      ['country']: typeof value === 'string' ? value.split(',') : value,
    });

    if (productId === 4 || productId === 14) {
      fetchSelectedSales(typeof value === 'string' ? value.split(',') : value);
    }
  };
  // console.log(field, 'field')

  const selectedSaleListIds: any =
    saleListSelected?.map((item: any) => {
      if (item?.saleId) {
        return item?.saleId;
      } else {
        return Number(item?.id);
      }
    }) || [];

  // call the fetch api based on sale selection to get lots 
  useEffect(() => {
    if (saleListSelected?.length) {
      fetchSelectLots(selectedSaleListIds)
    }
  }, [saleListSelected])

  const handleChange = (type: string, value: any) => {
    setField({
      ...field,
      [type]: value,
    });
  };

  const currentFarm = dataDetails;

  const NewFarmSchema = Yup.object().shape({
    clientName: Yup.string().required('Farm Name is required'),
    countryId: Yup.number().required('country is required'),
    stateId: Yup.number().required('State is required'),
    website: Yup.string().required('Website is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      clientName: currentFarm?.clientName || '',
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
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  React.useEffect(() => {
    if (isEdit && currentFarm) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  const onSubmit = async (data: FormValuesProps) => {
  };

  const handleDrop = React.useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(
          'avatarUrl',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const [countryID, setCountryID] = React.useState(
    currentFarm?.countryId > 0 ? currentFarm?.countryId : 0
  );
  const [isCountrySelected, setIsCountrySelected] = React.useState(
    currentFarm?.countryId > 0 ? true : false
  );
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: !isCountrySelected });

  const [openCancelRefundWrapper, setOpenCancelRefundWrapper] = useState(false);

  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails,
  };

  const [mareSelected, setMareSelected] = useState<any>();
  const [mareOptionList, setMareOptionList] = useState<any>([]);
  const [mareName, setMareName] = useState<any>('');
  const [stallionName, setStallionName] = useState<any>('');

  const [farmNameList, setFarmNameList] = useState<any>([]);
  const [selectedFarmList, setSelectedFarmList] = useState<any>([]);
  const [selectedStallion, setSelectedStallion] = useState<any>();
  const [stallionOptionList, setStallionOptionList] = useState<any>([]);
  const [isStalionFirst, setIsStalionFirst] = useState(true);

  useEffect(() => {
    // console.log(dataDetails, 'dataDetails')
    if (dataDetails?.stallions && dataDetails?.stallions?.length) {
      setField({
        ...field,
      });
    }
    if (productId === 2) {
      setField({
        ...field,
        country: dataDetails?.countryId ? typeof dataDetails?.countryId === 'string' ? dataDetails?.countryId.split(',') : [dataDetails?.countryId] : null,
        currencyId: dataDetails?.currencyId ? Number(dataDetails?.currencyId) : '',
      });
    } else if (productId === 3 || productId === 6) {
      if (dataDetails?.locationIds) {
        setField({
          ...field,
          country: dataDetails?.locationIds ? dataDetails?.locationIds?.map((v: any) => Number(v)) : null,
          reportCountryId: dataDetails?.countryId
        });
      } else {
        setField({
          ...field,
          country: dataDetails?.countryId ? typeof dataDetails?.countryId === 'string' ? dataDetails?.countryId.split(',') : [dataDetails?.countryId] : null,
          reportCountryId: dataDetails?.countryId
        });
      }
    } else {
      setField({
        ...field,
        country: dataDetails?.countryId ? Number(dataDetails?.countryId) : null,
        currencyId: dataDetails?.currencyId ? Number(dataDetails?.currencyId) : '',
      });
    }

    if (dataDetails?.horseName) {
      setMareSelected(
        {
          horseName: dataDetails?.horseName,
          horseId: dataDetails?.horseUuid,
          countryCode: dataDetails?.countryCode,
          yob: dataDetails?.yob
        }
      )
    }
    if (dataDetails?.stallions) {
      let arr: any = [];
      dataDetails?.stallions?.forEach((v: any) => {
        let obj: any = { stallionId: '', stallionName: '', yob: '', countryName: '' };
        obj.stallionId = v?.stallionId;
        obj.horseName = v?.stallionName;
        obj.yob = v?.stallionYob;
        obj.countryName = v?.countryName;

        arr.push(obj);
        setSelectedStallion(arr);
        setStallionOptionList(arr);
      })

    }
    if (productId === 5) {
      setSelectedStallion({
        horseName: dataDetails?.horseName,
        stallionId: dataDetails?.stallionId,
        countryName: dataDetails?.countryCode,
        yob: dataDetails?.yob
      });

      if (dataDetails?.farms) {
        let arr: any = [];
        dataDetails?.farms?.forEach((v: any) => {
          let obj: any = { farmId: '', farmName: '' };
          obj.farmId = v?.farmUuid;
          obj.farmName = v?.farmName;

          arr.push(obj);
          setSelectedFarmList(arr);
          setFarmNameList(arr);
        })
      }
    }
    if (productId === 14) {
      setSelectedStallion({
        horseName: dataDetails?.horseName,
        stallionId: dataDetails?.stallionId,
        countryName: dataDetails?.countryCode,
        yob: dataDetails?.yob
      });
    }
    if (productId === 4 || productId === 14) {
      if (dataDetails?.locationIds) {
        setField({
          ...field,
          country: dataDetails?.locationIds ? dataDetails?.locationIds?.map((v: any) => Number(v)) : null,
        });
        handleChangeCountry('country', dataDetails?.locationIds?.map((v: any) => Number(v)));
      } else {
        handleChangeCountry('country', [dataDetails?.countryId]);
      }
      if (dataDetails?.sales) {
        setselectedSale(dataDetails?.sales);
        setSaleListSelected(dataDetails?.sales);
        fetchSelectLots(Number(dataDetails?.sales[0]?.id))
      }
    }
    if (productId === 2) {
      if (dataDetails?.selectedPriceRange) {
        let splitRange: any = dataDetails?.selectedPriceRange?.split('-');
        // console.log(dataDetails, splitRange, 'splitRange');
        setMinAmount(splitRange[0]);
        setMaxAmount(splitRange[1]);
      }
    }
    removeSelectorChip();

  }, [dataDetails]);

  // api param for Stallion Match PRO Report
  const stallionRangeParams: any = {
    country: field?.country ? field?.country : '11',
    currency: field?.currencyId ? field?.currencyId : "1",
    priceRange: dataDetails?.selectedPriceRange?.length ? `${minAmount}-${maxAmount}` : '0-1000000',
    includePrivateFee: true
  }

  const { data: stallionListInRange, isSuccess: stallionListInRangeSuccess, isFetching: stallionListInRangeFetching } = useGetStallionByFeeAndLocationQuery(stallionRangeParams, { skip: !(productId === 2 && dataDetails) });

  useEffect(() => {
    let list: any = [];
    if (stallionListInRangeSuccess && stallionListInRange) {
      list = stallionListInRange?.data?.map((v: any, i: number) => {
        let obj: any = {};
        for (let index = 0; index < selectedStallion?.length; index++) {
          const element = selectedStallion[index];
          obj.label = toPascalCase(v.horseName);
          obj.value = v.stallionId;
          obj.children = [];
          obj.id = v.stallionId;
          if (element.stallionId === v.stallionId) {
            obj.checked = true;
          }
        }
        return obj;
      })
      let idLists = stallionListInRange?.data?.map((v: any) => v.stallionId);
      setStallionListProReport(list);
      setStallionSelectedListProReport(idLists);
      if (list?.length > 0 && treeDropdownRef?.current?.searchInput.getAttribute("placeholder").length > 0) {
        treeDropdownRef?.current?.searchInput.setAttribute("placeholder", "Select Stallion" ? "Select Stallion" : "");

      } else if (list?.length == 0 && treeDropdownRef?.current?.searchInput.getAttribute("placeholder").length > 0) {
        treeDropdownRef?.current?.searchInput.setAttribute("placeholder", "Select Stallion");
      }
      // console.log(list, 'LIST>>>')
    }
  }, [stallionListInRangeFetching]);

  const onFocus = async () => {
    treeDropdownRef.current.searchInput.setAttribute('style', 'display:block');
  };

  const removeSelectorChip = () => {
    setTimeout(() => {
      let doc: any = document?.getElementById('select-stallion-search');
      // console.log(doc,'DOC>>>');
      if (doc) {
        let list = Array.from(doc?.querySelectorAll('.MuiChip-filled'));
        list?.forEach((v: any) => v.style.display = 'none');
        doc?.querySelectorAll('#checkboxes-tags-demo')[0].setAttribute("placeholder", 'Select Stallion');
      }
    }, 100);
  }

  let selectedList: any = selectedStallion;
  const onChangeProStallionList = async (currentNode: any, selectedNodes: any) => {
    selectedList = [];
    const selectedData = await selectedNodes.map((res: any) => res.id);
    selectedList = [...selectedData];
    // if (selectedNodes.length === 0) {
    //   treeDropdownRef.current.searchInput.setAttribute('placeholder', 'Select Stallion');
    // } else {
    //   treeDropdownRef.current.searchInput.setAttribute('placeholder', '  ');
    // }

    let elems: any = document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag-item')
    if (!elems) return
    // @ts-ignore
    // console.log(elems, 'confrm_stln_match_pro_12')
    for (let i = 0; i < elems?.length; i++) {
      // @ts-ignore
      if (!(elems[i].childNodes[0].nodeName === 'INPUT')) {

        elems[i].style.display = "none";
      }
      // elems[i].style.display = "none";
    }

  }

  let selectedLots: any = [];
  const onChangeSelectLots = async (currentNode: any, selectedNodes: any) => {
    selectedLots = selectedNodes?.map((v: any) => v.id);
    // console.log(selectedNodes, 'selectedNodes');
    if (selectedNodes?.length > 0 && treeDropdownRef?.current?.searchInput.getAttribute("placeholder").length > 0) {
      treeDropdownRef?.current?.searchInput.setAttribute("placeholder", "Select Stallion" ? "Select Stallion" : "");

    } else if (selectedNodes?.length == 0 && treeDropdownRef?.current?.searchInput.getAttribute("placeholder").length > 0) {
      treeDropdownRef?.current?.searchInput.setAttribute("placeholder", "Select Stallion");
    }

    let elems: any = document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag')
    // console.log(document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag'), 'confrm_stln_match_pro_12')
    if (!elems) return
    // @ts-ignore
    for (let i = 0; i < elems?.length; i++) {
      // @ts-ignore
      // if (!(elems[i].childNodes[0].nodeName === 'INPUT')) {

      elems[i].style.display = "none";
      // }
      // elems[i].style.display = "none";
    }
    // document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('input')[0].click()

  }

  const handleCloseCancelRefundWrapper = () => {
    setOpenCancelRefundWrapper(false);
  };

  const handleOpenCancelRefundWrapper = () => {
    if (!reportModuleAccess?.report_cancel_report) {
      setClickedPopover(true);
    } else {
      setOpenCancelRefundWrapper(true);
    }
  };

  const handleApprove = async () => {
    if (!reportModuleAccess?.report_approve_report) {
      setClickedPopover(true);
    } else {
      if (!(productId === 7 || productId === 8 || productId === 9 || productId === 10)) {
        setApproveLoading(true);
      }
      let payloadData: any = {};

      if (productId === 1) {
        payloadData = {
          actionType: 'approve',
          stallions: selectedStallion.map((val: any) => val.stallionId),
          mareId: mareSelected?.horseId,
          orderProductId: orderProductId,
        };
        await postShortlistStallionReport(payloadData)
          .then((res: any) => {
            if (res?.status === 500) {
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            } else {
              setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
              setApiStatus(true);
              handleClearField();
              setApproveLoading(false);
            }
          })
          .catch((error: any) => {
            handleClearField();
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            setApproveLoading(false);
          });
      }

      if (productId === 2) {
        payloadData = {
          actionType: 'approve',
          stallions: [...selectedList.map((val: any) => val.stallionId)],
          countryId: field?.country,
          currencyId: field?.currencyId,
          orderProductId: orderProductId,
          locations: [field?.country],
          mareId: mareSelected?.horseId
        };
        await postStallionMatchProReport(payloadData).then((res: any) => {
          if (res?.status === 500) {
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            setApproveLoading(false);
          } else {
            setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
            setApiStatus(true);
            handleClearField();
            setApproveLoading(false);
          }
        })
          .catch((error: any) => {
            handleClearField();
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            setApproveLoading(false);
          });
      }

      if (productId === 3 || productId === 6) {
        payloadData = {
          actionType: 'approve',
          locations: [...field?.country],
          countryId: field?.reportCountryId,
          // stallions: selectedStallion?.map((val: any) => val.stallionId),
          orderProductId: orderProductId,
          mareId: mareSelected?.horseId
        };
        if (productId === 6) {
          await postBoodMareSireReport(payloadData)
            .then((res: any) => {
              if (res?.status === 500) {
                setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                setApiStatus(true);
                setApproveLoading(false);
              } else {
                setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
                setApiStatus(true);
                handleClearField();
                setApproveLoading(false);
              }
            })
            .catch((error: any) => {
              handleClearField();
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            });
        } else {
          await postBoodMareAfinityReport(payloadData)
            .then((res: any) => {
              if (res?.status === 500) {
                setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                setApiStatus(true);
              } else {
                setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
                setApiStatus(true);
                handleClearField();
              }
              setApproveLoading(false);
            })
            .catch((error: any) => {
              handleClearField();
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            });
        }
      }

      if (productId === 4) {
        payloadData = {
          // name: field.name,
          // email: field.email,
          actionType: 'approve',
          currencyId: field?.currencyId,
          countryId: field?.country,
          sales: [...saleListSelected.map((val: any) => val?.saleId !== undefined ? val?.saleId : Number(val.id))],
          lots: lotsList?.filter((v: any) => {
            return v.checked
          })?.map(((v1: any) => v1.id)),
          orderProductId: orderProductId,
        };
        // console.log(payloadData,'payloadData selectedLots')
        await postSalesCatelogueReport(payloadData)
          .then((res: any) => {
            if (res?.status === 500) {
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            } else {
              setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
              setApiStatus(true);
              handleClearField();
              setApproveLoading(false);
            }
          })
          .catch((error: any) => {
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            handleClearField();
            setApproveLoading(false);
          });
      }

      if (productId === 14) {
        payloadData = {
          // name: field.name,
          // email: field.email,
          actionType: 'approve',
          currencyId: field?.currencyId,
          countryId: field?.country,
          sales: [...saleListSelected.map((val: any) => val?.saleId !== undefined ? val?.saleId : Number(val.id))],
          lots: lotsList?.filter((v: any) => {
            return v.checked
          })?.map(((v1: any) => v1.id)),
          stallionId: selectedStallion?.stallionId,
          orderProductId: orderProductId,
        };
        // console.log(payloadData,'payloadData selectedLots')
        await postStallionXBreedingStockReport(payloadData)
          .then((res: any) => {
            if (res?.status === 500) {
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            } else {
              setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
              setApiStatus(true);
              handleClearField();
              setApproveLoading(false);
            }
          })
          .catch((error: any) => {
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            handleClearField();
            setApproveLoading(false);
          });
      }

      if (productId === 5) {
        payloadData = {
          actionType: 'approve',
          countryId: field?.country,
          stallionId: selectedStallion?.stallionId,
          farms: farmNameList.length ? farmNameList?.map((v: any) => v?.farmId) : [],
          orderProductId: orderProductId,
        };
        await postStallionAfinityReport(payloadData)
          .then((res: any) => {
            if (res?.status === 500) {
              setApiStatusMsg({ status: 422, message: 'Some error occurs' });
              setApiStatus(true);
              setApproveLoading(false);
            } else {
              setApiStatusMsg({ status: 201, message: 'Report approved successfully!' });
              setApiStatus(true);
              handleClearField();
              setApproveLoading(false);
            }
          })
          .catch((error: any) => {
            setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            setApiStatus(true);
            handleClearField();
            setApproveLoading(false);
          });
      }
    }
  };
  // sales: [...saleListSelected.map((val: any) => val.saleId)],
  // lots: [...selectedLots],
  console.log(dataDetails, saleListSelected, lotsList, 'selectedLots')

  const handleClearField = () => {
    setField({
      report: 1,
      name: '',
      email: '',
      country: [],
      currencyId: '',
      mareId: '',
      stallionId: '',
      quantity: 0,
      confirmedStallion: 'none',
      farms: [],
    });
    setMareSelected(null);
    setSelectedStallion(null);
    handleCloseEditState();
    setLotsList([]);
  };

  const handleMareInput = async (e: any) => {
    if (e?.target?.value && e?.target?.value?.length >= 3) {
      setMareName(e?.target?.value);
      await getSearchMareList(e?.target?.value).then((res: any) => {
        setMareOptionList(res?.data || []);
      });
    }
  };

  const handleStallionInput = async (e: any) => {
    if (e?.target?.value && e?.target?.value?.length >= 3) {
      setStallionName(e?.target?.value);
      await getsearchStallions(e?.target?.value).then((res: any) => {
        setStallionOptionList([...stallionOptionList, ...res?.data]);
      });
    }
  };

  const handleFarmInput = async (e: any) => {
    if (e?.target?.value && e?.target?.value?.length >= 3) {
      await getfarms(e?.target?.value).then((res: any) => {
        setFarmNameList([...selectedFarmList, ...res?.data]);
      });
    }
  };

  console.log(dataDetails, 'dataDetails')
  const countryValue = (type = '') => {
    return (
      <Grid item xs={12} md={12} mt={2} className="racelistgroup">
        <Box className="edit-field ">
          <Typography variant="h4" className="" mb={0.5}>
            Stallion Location(s)
          </Typography>
          {type !== 'multi' ?
            <Select
              MenuProps={{
                disableScrollLock: true,
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                ...MenuProps,
              }}
              displayEmpty
              IconComponent={KeyboardArrowDownRoundedIcon}
              value={field?.country || 'none'}
              onChange={(e) => handleChangeCountry('country', e.target.value)}
              className="countryDropdown filter-slct"
              defaultValue={'none'}
              name="expiredStallion"
              placeholder="Select Country"
            >
              <MenuItem className="selectDropDownList countryDropdownList selectstallions-field" value="none" disabled><em>Select Country</em></MenuItem>
              {countriesList?.map(({ id, countryName }) => {
                return (
                  <MenuItem className="selectDropDownList countryDropdownList selectstallions-field" value={id} key={id}>
                    {countryName}
                  </MenuItem>
                );
              })}
            </Select> :
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
              value={(field?.country.length === 0 || field?.country === null) ? [] : field?.country}
              multiple
              displayEmpty
              // renderValue={
              //   field?.country.length !== 0 ? undefined : () => <Placeholder><em>Country</em></Placeholder>
              // }
              renderValue={(selected: any) => {
                if (selected?.length === 0) {
                  return <em>Select Country</em>;
                }
                return <em>View Selected Countries</em>;
                // return getCountryListByComma(selected);

              }}
              IconComponent={KeyboardArrowDownRoundedIcon}
              onChange={(e) => handleChangeCountry('country', e.target.value)}
              name="countryId" defaultValue="none" className="countryDropdown filter-slct">
              {/* <MenuItem className="selectDropDownList countryDropdownList" value="none" disabled><em>Country</em></MenuItem> */}
              {countriesList?.map(({ id, countryName }) => {
                return (
                  <MenuItem className="selectDropDownList countryDropdownList selectstallions-field" value={id} key={id} disableRipple>
                    {/* {countryName} */}
                    <ListItemText primary={countryName} />
                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                    <Checkbox
                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                      checked={field?.country?.indexOf(id) > -1}
                      disableRipple
                    />
                  </MenuItem>
                );
              })}
            </Select>
          }
        </Box>
      </Grid>
    );
  };

  const renderSearchMare = () => {
    return (
      <Grid item xs={12} md={12} mt={2} className="racelistgroup">
        <Box className="edit-field">
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Select Mare
          </Typography>
          <Autocomplete
            className="reports-data"
            disablePortal
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            id="checkboxes-tags-demo"
            options={mareOptionList || []}
            onInputChange={handleMareInput}
            sx={{ margin: '0px', padding: '0px' }}
            getOptionLabel={(option: any) =>
              `${Object.keys(option).length
                ? `${toPascalCase(option?.horseName)?.toString()} (${option.countryCode}) ${option.yob ? option.yob : ''
                }`
                : ''
              }`
            }
            onChange={(e, selectedOptions: any) => {
              setMareSelected(selectedOptions);
              handleChange('horseId', selectedOptions?.horseId);
            }}
            value={mareSelected}
            renderOption={(props, option: any) => (
              <li className="searchstallionListBox" {...props}>
                <span className="stallionListBoxName">
                  {toPascalCase(option.horseName)} ({option.countryCode}) {option.yob}
                </span>
              </li>
            )}
            noOptionsText={mareName.length ? 'No options found' : ''}
            renderInput={(params: any) => (
              <TextField
                {...params}
                name="mare-name"
                className="edit-field"
                placeholder="Enter Mare Name"
              />
            )}
          />
        </Box>
      </Grid>
    );
  };

  const searchStallion = (type = '') => {
    return (
      <Grid
        item
        xs={12}
        md={12}
        mt={2}
        className={`racelistgroup reportModalForm ${selectedStallion?.length && 'selectedStall'}`}
      >
        <Box className="edit-field stallionReportPro" id="select-stallion-search">
          <Typography variant="h4" className="" mb={0.5}>
            Confirm Stallions Selected{' '}
            {type !== 'multi'
              ? ''
              : selectedStallion && selectedStallion?.length
                ? '(' + selectedStallion?.length + ')'
                : ''}
          </Typography>
          {type !== 'multi' ? (
            <Autocomplete
              disablePortal
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              id="checkboxes-tags-demo"
              options={stallionOptionList || []}
              onInputChange={handleStallionInput}
              sx={{ margin: '0px', padding: '0px' }}
              getOptionLabel={(option: any) =>
                `${option ? `${toPascalCase(option?.horseName)} ${' - '} ${option?.yob}` : ''}`
              }
              onChange={(e, selectedOptions: any) => {
                setSelectedStallion(selectedOptions);
                handleChange('stallionId', selectedOptions?.stallionId);
                removeSelectorChip();
              }}
              noOptionsText={stallionName ? 'No options found' : ''}
              value={selectedStallion}
              renderOption={(props, option: any) => (
                <li className="searchstallionListBox" key={option?.stallionId} {...props}>
                  <span className="stallionListBoxName">
                    {toPascalCase(option?.horseName)} {' - '} {option?.yob}
                  </span>
                </li>
              )}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  name="stallion-name"
                  className="edit-field"
                  placeholder={'Enter Stallion'}
                />
              )}
            />
          ) : (
            <Box className='selectStallions'>
              <Autocomplete
                disablePortal
                // open={openSelectStallion}
                // // openSelectStallion,setOpenSelectStallion setOpenSelectStallion(!openSelectStallion)
                // onOpen={(e) => {console.log(e,'openSelectStallion')}}
                id="checkboxes-tags-demo"
                options={stallionOptionList?.length ? stallionOptionList : []}
                popupIcon={<KeyboardArrowDownRoundedIcon />}
                ChipProps={{ deleteIcon: <CloseIcon /> }}
                multiple
                value={selectedStallion ? selectedStallion : stallionOptionList?.length ? [] : ''}
                onInputChange={handleStallionInput}

                getOptionLabel={(option: any) =>
                  `${option ? `${toPascalCase(option?.horseName)}` : ''}`
                }
                onChange={(e, selectedOptions: any) => {
                  setSelectedStallion(selectedOptions);
                  handleChange('stallionId', selectedOptions?.stallionId);
                  removeSelectorChip();
                }}
                noOptionsText={stallionName ? 'No options found' : ''}
                renderOption={(props, option, { selected }) => {
                  return (
                    <MenuList sx={{ boxShadow: 'none', padding: '0px' }} key={option?.stallionId}>
                      <MenuItem
                        {...props}
                        disableRipple
                        className="LoactionFilter reportfilter stallionfilter"
                      >
                        <span
                          style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                        >
                          {toPascalCase(option?.horseName)}
                        </span>
                        <Checkbox
                          checkedIcon={<img src={Images.checked} alt="checkbox" />}
                          icon={<img src={Images.unchecked} alt="checkbox" />}
                          checked={selected}
                          disableRipple
                        />
                      </MenuItem>
                    </MenuList>
                  );
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    name="stallion-name"
                    className="edit-field"
                    placeholder={selectedStallion?.length ? ' ' : 'Select Stallion'}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </Grid>
    );
  };

  const searchStallionProReport = () => {
    return (
      <Grid
        item
        xs={12}
        md={12}
        mt={2}
        className={`racelistgroup reportModalForm ${selectedStallion?.length && 'selectedStall'}`}
      >
        <Box className="edit-field stallionReportPro" id="confrm_stln_match_pro_12">
          <Typography variant="h4" className="" mb={0.5}>
            Confirm Stallions Selected{' '}
            ({selectedStallion?.length})
          </Typography>
          <Box className="SDmultiselect listSelect">
            <DropdownTreeSelect
              aria-hidden="true"
              data={stallionListProReport || []}
              className={'mdl-demo list-demo'}
              onChange={onChangeProStallionList}
              texts={{ placeholder: 'Select Stallion' }}
              ref={treeDropdownRef}
              onFocus={onFocus}
            // showDropdown="always"
            />
          </Box>
        </Box>
      </Grid>
    )

  }

  const searchFarm = () => {
    return (
      <Grid
        item
        xs={12}
        md={12}
        mt={2}
        className={`racelistgroup reportModalForm ${selectedStallion?.length && 'selectedStall'}`}
      >
        <Box className="edit-field select-farm">
          <Typography variant="h4" sx={{ mb: 1 }}>
            Select Farm
          </Typography>
          <Autocomplete
            disablePortal
            id="checkboxes-tags-demo"
            options={farmNameList?.length ? farmNameList : []}
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            ChipProps={{ deleteIcon: <CloseIcon /> }} multiple
            disableCloseOnSelect
            value={selectedFarmList}
            onInputChange={handleFarmInput}
            sx={{ margin: '0px', padding: '0px' }}
            getOptionLabel={(option: any) => `${toPascalCase(option?.farmName)?.toString()}`}
            onChange={(e, selectedOptions: any) => {
              setSelectedFarmList(selectedOptions);
            }}
            noOptionsText={'No options found'}
            renderOption={(props, option, { selected }) => {
              return (
                <MenuList sx={{ boxShadow: 'none', padding: "2px 0px" }}>
                  <MenuItem {...props} disableRipple className="LoactionFilter reportfilter">
                    <span
                      style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                    >
                      {option?.farmName}
                    </span>
                    <Checkbox
                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                      icon={<img src={Images.unchecked} alt="checkbox" />}
                      checked={selected}
                      disableRipple
                    />
                  </MenuItem>
                </MenuList>
              );
            }}
            renderInput={(params: any) => <TextField {...params} placeholder={selectedFarmList.length ? '' : 'Select Farm'} />}
          />
        </Box>
      </Grid>
    );
  };

  const renderSaledAndLots = () => {
    return (
      <>
        <Grid item xs={12} md={12} mt={2} className="racelistgroup">
          <Box className="edit-field">
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Select Sale
            </Typography>

            <Autocomplete
              disablePortal
              id="checkboxes-tags-demo"
              options={saleList?.length ? saleList : []}
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              ChipProps={{ deleteIcon: <CloseIcon /> }}
              defaultValue={dataDetails ? selectedSale ? selectedSale[0] : null : null}
              disableCloseOnSelect
              onInputChange={(e) => setInputValueSales(e)}
              sx={{ margin: '0px', padding: '0px' }}
              noOptionsText={lotsName.length ? 'No options found' : ''}
              getOptionLabel={(option: any) => `${toPascalCase(option?.salesName)?.toString()}`}
              onChange={(e, selectedOptions: any) => {
                let selectedOpt: any = [];
                selectedOpt.push(selectedOptions);
                setSaleListSelected([...selectedOpt]);
              }}
              renderOption={(props, option, { selected }) => {
                return (
                  <MenuList sx={{ boxShadow: 'none' }}>
                    <MenuItem
                      {...props}
                      disableRipple
                      className="LoactionFilter reportfilter"
                      onWheel={(e) => { }}
                    >
                      <span
                        style={{ width: '100%', paddingLeft: '16px', whiteSpace: 'break-spaces' }}
                      >
                        {toPascalCase(option?.salesName)}
                      </span>
                      <Checkbox
                        checkedIcon={<img src={Images.checked} alt="checkbox" />}
                        icon={<img src={Images.unchecked} alt="checkbox" />}
                        checked={selected}
                        disableRipple
                      />
                    </MenuItem>
                  </MenuList>
                );
              }}
              renderInput={(params: any) => <TextField {...params} placeholder={'Select Sale'} />}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={12} mt={2} className="racelistgroup">
          <Box className="edit-field stallionReportPro" id="confrm_stln_match_pro_12">
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Select Lots
            </Typography>
            <Box className="SDmultiselect listSelect">
              <DropdownTreeSelect
                data={lotsList || []}
                className={'mdl-demo list-demo'}
                onChange={onChangeSelectLots}
                texts={{ placeholder: 'Select Lots' }}
                ref={treeDropdownRef}
                onFocus={onFocus}
                showDropdown="always"
              />
            </Box>
            {/* <Autocomplete
              disablePortal
              id="checkboxes-tags-demo"
              options={lotsList?.length ? lotsList : []}
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              ChipProps={{ deleteIcon: <CloseIcon /> }}
              filterSelectedOptions
              multiple
              disableCloseOnSelect
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
                        checkedIcon={<img src={Images.checked} alt="checkbox" />}
                        icon={<img src={Images.unchecked} alt="checkbox" />}
                        checked={selected}
                        disableRipple
                      />
                    </MenuItem>
                  </MenuList>
                );
              }}
              renderInput={(params: any) => <TextField {...params} placeholder={'Select Lots'} />}
            /> */}
          </Box>
        </Grid>
      </>
    );
  };

  const renderStudFeeRange = () => {
    return (
      <Grid item xs={12} md={12} mt={2} className="racelistgroup">
        <Box className="edit-field">
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Stud Fee Range
          </Typography>

          <Box className="stud-fee-range">
            <Select
              MenuProps={{
                disableScrollLock: true,
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                ...MenuProps,
              }}
              displayEmpty
              IconComponent={KeyboardArrowDownRoundedIcon}
              value={field?.currencyId || 'none'}
              onChange={(e) => setField({
                ...field,
                ['currencyId']: e?.target?.value
              })}
              className="countryDropdown filter-slct"
              defaultValue={'none'}
              name="expiredStallion"
              placeholder="Selected Currency"
            >
              <MenuItem className="selectDropDownList countryDropdownList selectstallions-field" value="none" disabled><em>Selected Currency</em></MenuItem>
              {currencyList?.map((v: any) => {
                return (
                  <MenuItem className="selectDropDownList countryDropdownList selectstallions-field" disabled={v.id === 1 ? false : true} value={v.id} key={v.id}>
                    {v.currencyName}
                  </MenuItem>
                );
              })}
            </Select>

            <TextField
              name=""
              placeholder="Min Amount"
              className="edit-field studefee"
              type='number'
              value={minAmount}
              onChange={(e: any) => setMinAmount(e.target.value)}
            />

            <TextField
              name=""
              placeholder="Max Amount"
              className="edit-field studefee"
              type='number'
              value={maxAmount}
              onChange={(e: any) => setMaxAmount(e.target.value)}
            />
          </Box>
        </Box>
      </Grid>
    )
  }

  const closeModal = () => {
    setSelectedStallion(null);
    handleClearField();
    if (isEdit) {
      handleCloseModal();
    } else {
      handleCloseEditState();
    }
  };

  const handleShareEmail = async () => {
    if (!reportModuleAccess?.report_activate_link) {
      setClickedPopover(true);
    } else {
      const accessToken = localStorage.getItem('accessToken');
      setButtonLoading(true);

      if (!emailToShare) {
        setApiStatusMsg({ status: 422, message: 'Please provide email!' });
        setApiStatus(true);
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(emailToShare)) {
        try {
          const response = await axios.get(
            api.baseUrl + `/report/share-report/${orderProductId}/${emailToShare}`,
            {
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
              },
            }
          );

          setButtonLoading(false);

          if (response) {
            setApiStatusMsg({ status: 201, message: 'Email shared successfully!' });
            handleDrawerClose();
            setEmailToShare('');
            setApiStatus(true);
            scrollToTop();
            return;
          }

          setApiStatusMsg({ status: 422, message: 'Some Error Occurs' });
          setApiStatus(true);
        } catch (error) {
          setApiStatusMsg({ status: 422, message: 'Some Error Occurs' });
          setApiStatus(true);
          return;
        }
      } else {
        setButtonLoading(false);
        enqueueSnackbar('Invalid email address!', { variant: 'error' });
        return;
      }
    }
  };

  const handleCancelOrder = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(api.baseUrl + `/report/cancel-report/${orderProductId}`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        enqueueSnackbar('Order Cancelled!');
        handleCloseEditState();
        return;
      }

      enqueueSnackbar('Some Error Occurs');
    } catch (error) {
      enqueueSnackbar('Some Error Occurs');
      return;
    }
  };

  const handleSaveOrder = async () => {
    if (!reportModuleAccess?.report_send_resend_report) {
      setClickedPopover(true);
    } else {
      setSendButtonLoading(true);

      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(api.baseUrl + `/report/send-report/${orderProductId}`, {
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
        });

        setSendButtonLoading(false);
        // console.log(response, 'response');
        if (response?.status === 500) {
          setApiStatusMsg({ status: 422, message: 'Some Error Occurs' });
          setApiStatus(true);
        } else {
          setApiStatusMsg({ status: 201, message: 'Order Sent!' });
          setApiStatus(true);
          handleClearField();
          handleCloseEditState();
          return;
        }
        // if (response) {
        //   enqueueSnackbar('Order Sent!');
        //   return;
        // }

        // enqueueSnackbar('Some Error Occurs');
      } catch (error) {
        setSendButtonLoading(false);
        setApiStatusMsg({ status: 422, message: 'Some Error Occurs' });
        setApiStatus(true);
        return;
      }
    }
  };

  const renderBorderLine = (status: string) => {
    switch (status) {
      case 'Ordered':
        return <BorderLinearProgress variant="determinate" value={25} />;
      case 'Initiated':
        return <BorderLinearProgress variant="determinate" value={25} />;
      case 'Generated':
        return <BorderLinearProgress1 variant="determinate" value={50} />;
      case 'Completed':
        return <BorderLinearProgress1 variant="determinate" value={75} />;
      case 'Delivered':
        return <BorderLinearProgress1 variant="determinate" value={100} />;
      case 'Cancelled':
        return <BorderLinearProgress variant="determinate" value={100} />;
      default:
        return <BorderLinearProgress variant="determinate" value={25} />;
        break;
    }
  };

  const [csvShareData, setCsvShareData] = useState<any>([]);

  React.useEffect(() => {
    let tempArr: any = [];
    let {
      orderId,
      clientName,
      productName,
      email,
      horseName,
      horseId,
      yob,
      cob,
      sireName,
      damName,
      status,
      subTotal,
      tax,
      discount,
      promoCode,
      total,
      paymentMethod,
      currencyCode,
      currencySymbol,
    } = dataDetails;
    const subTotalValue = `${currencyCode?.substring(0, 2)}${currencySymbol}${subTotal}`;
    const taxValue = `${currencyCode?.substring(0, 2)}${currencySymbol}${tax}`;
    const discountValue = `${currencyCode?.substring(0, 2)}${currencySymbol}${discount}`;
    const totalValue = `${currencyCode?.substring(0, 2)}${currencySymbol}${total}`;
    const horseNameValue = toPascalCase(horseName);
    const sireNameValue = toPascalCase(sireName);
    const damNameValue = toPascalCase(damName);
    const promoCodeValue = toPascalCase(promoCode);
    tempArr.push({
      orderId,
      clientName,
      productName,
      email,
      horseNameValue,
      horseId,
      yob,
      cob,
      sireNameValue,
      damNameValue,
      status,
      subTotalValue,
      taxValue,
      discountValue,
      promoCodeValue,
      totalValue,
      paymentMethod,
      paymentStatus,
    });
    setCsvShareData(tempArr);
  }, [dataDetails]);

  useEffect(() => {
    // if (!isStalionFirst) {
    // } else {
    // if (!document.getElementById('confrm_stln_match_pro_12')) {
    //   return
    // setTimeout(() => {
    // let elems = document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag-item')
    // // console.log(document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag'), 'confrm_stln_match_pro_12')
    // if (!elems) return
    // // @ts-ignore
    // for (let i = 0; i < elems?.length; i++) {
    //   // @ts-ignore
    //   elems[i].style.display = "none";
    // }
    // document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('input')[0].click()
    // }, 1500);

    // if (document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li') && document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li').length) {
    //   let elems = document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li')
    //   // @ts-ignore
    //   for (let i = 0; i < elems.length - 1; i++) {
    //     console.log(elems, 'elems')
    //     // @ts-ignore
    //     elems[i].style.display = "none";
    //   }
    //   // @ts-ignore
    //   document.getElementById('confrm_stln_match_pro_12').getElementsByTagName('input')[0].click()
    // }



    if (!isStalionFirst) {
      let elems = document.getElementById('confrm_stln_match_pro_12')?.getElementsByClassName('tag')
      if (!elems) return
      // @ts-ignore
      for (let i = 0; i <= elems.length - 1; i++) {
        // @ts-ignore
        elems[i].style.display = "none";
      }
    } else {
      if (!document.getElementById('confrm_stln_match_pro_12')) {
        return
      }
      if (document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li') && document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li').length) {
        let elems: any = document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li')
        // @ts-ignore
        for (let i = 0; i < elems?.length - 1; i++) {
          // @ts-ignore
          if (!(elems[i].childNodes[0].nodeName === 'INPUT')) {

            elems[i].style.display = "none";
          }
        }
        // @ts-ignore
        document.getElementById('confrm_stln_match_pro_12').getElementsByTagName('input')[0].click()
      }
      setTimeout(() => {
        setIsStalionFirst(false)
      }, 100);
    }


  }, [selectedLots, selectedList, document.getElementById('confrm_stln_match_pro_12'), document.getElementById('confrm_stln_match_pro_12')?.getElementsByTagName('li')])

  let checkItisOpen = document.querySelectorAll('.dropdown-trigger.arrow.bottom');

  // console.log(checkItisOpen,'checkItisOpen')
  if (checkItisOpen?.length === 1) {

    treeDropdownRef?.current?.searchInput.setAttribute("placeholder", 'Select Stallion');

  }
  // console.log(dataDetails,'dataDetails')

  return (
    <>
      <Drawer
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: '100vh',
            background: '#E2E7E1',
          },

          '.MuiInputBase-root-MuiOutlinedInput-root': {
            height: 'auto !important',
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
        className="filter-section DrawerRightModal RaceEditModal reportQueueModal"
      >
        {loadingMain ? (
          <Box height={'500px'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <CircularProgress />
          </Box>
        ) : (
          <Scrollbar
            className="DrawerModalScroll"
            sx={{
              width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: open || openAddEditForm ? drawerWidth : 0,
                height: '100vh',
                background: '#E2E7E1',
              },
            }}
          >
            <CssBaseline />

            <DrawerHeader
              className="DrawerHeader"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}
            >
              <IconButton className="closeBtn" onClick={() => closeModal()}>
                <i style={{ color: '#161716' }} className="icon-Cross" />
              </IconButton>
              {(dataDetails?.status !== 500 || dataDetails?.status !== 401) && <Button type="button" className="ShareBtn">
                <CsvLink data={csvShareData} fileName={`Reports_Details (${new Date()})`}>
                  <i className="icon-Share"></i>
                </CsvLink>
              </Button>}
            </DrawerHeader>
            {
              dataDetails?.status === 403 ? <UnAuthorized /> :
                dataDetails?.status === 500 ? <Box className='nodata'>No Data Found</Box> :
                  dataDetails?.status === 401 ? <Box className='nodata'>No Data Found</Box> :
                    <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
                      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                        <Box px={0}>
                          {/* SM PRO Report - Needs to Approval */}
                          <Grid container spacing={3} mt={0} pt={0} className="RaceListModalBox">
                            <Grid item xs={12} md={12} mt={0} className="racelistgroup">
                              <Grid container xs={12} md={12} mt={0} width={'100%'} position={'relative'}>
                                <Typography mr={1} variant="h4">
                                  Report Details
                                </Typography>
                                {status === 'Completed' || status === 'Delivered' ? (
                                  <Box
                                    style={{ cursor: 'pointer' }}
                                    position={'absolute'}
                                    right={'55px'}
                                    top={'15px'}
                                    onClick={() => handleSaveOrder()}
                                  >
                                    <img src={Repeat} />
                                  </Box>
                                ) : (
                                  ''
                                )}
                              </Grid>

                              <Box className="FormGroup">
                                <Stack className="accuracy-rating" my={2}>
                                  <Box mb={1} sx={{ display: 'flex' }}>
                                    <Typography
                                      variant="h6"
                                      flexGrow={1}
                                      sx={{ display: 'flex', alignItems: 'end' }}
                                    >
                                      Status:<b>{approveLoading ? 'Generating' : status}</b>

                                      {isLinkActive ? (
                                        <i
                                          style={{ cursor: 'pointer', fontSize: 18, marginLeft: 5 }}
                                          onClick={() => navigator.clipboard.writeText(reportLink)}
                                          className="icon-Link-green"
                                        ></i>
                                      ) : (
                                        <span
                                          style={{ height: 18, width: 25, top: 0 }}
                                          className="link-green link-disable"
                                        >
                                          <img src={Images.Link} alt="" />
                                        </span>
                                      )}
                                    </Typography>
                                  </Box>

                                  <Box className="ProgressBar-Line">
                                    <Box sx={{ flexGrow: 1 }}>{renderBorderLine(status)}</Box>
                                  </Box>
                                </Stack>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                              <Box className="FormGroup">
                                <List className="RawDataList">
                                  <ListItem>
                                    <ListItemText primary="Order ID:" secondary={orderId} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Name:" secondary={toPascalCase(clientName)} />
                                  </ListItem>
                                  <ListItem sx={{ marginTop: '16px' }}>
                                    <ListItemText
                                      primary={`${productId === 5 ? "Stallion Name: " : "Mare Name: "} `}
                                      secondary={
                                        horseName ? (
                                          <Typography
                                            style={{
                                              textDecoration: 'underline',
                                              textDecorationThickness: '1.5px',
                                              textUnderlineOffset: '3px',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                              navigate(PATH_DASHBOARD.horsedetails.edit(horseUuid));
                                            }}
                                          >
                                            {toPascalCase(horseName)}
                                          </Typography>
                                        ) : (
                                          '--'
                                        )
                                      }
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="YOB:" secondary={yob} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Sire:" secondary={toPascalCase(sireName)} />
                                  </ListItem>
                                </List>
                              </Box>
                            </Grid>

                            <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                              <Box className="FormGroup">
                                <List className="RawDataList">
                                  <ListItem>
                                    <ListItemText primary="Report Type:" secondary={productName} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Email:" secondary={email} />
                                  </ListItem>
                                  <ListItem sx={{ marginTop: '16px' }}>
                                    <ListItemText primary="Horse ID:" secondary={horseId} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="COB:" secondary={cob} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Dam:" secondary={toPascalCase(damName)} />
                                  </ListItem>
                                </List>
                              </Box>
                            </Grid>

                            {horseUuid && <Grid item xs={11} md={11} mt={0} className="racelistgroup">
                              <Box className="FormGroup">
                                <Stack className="accuracy-rating" my={2} mt={0}>
                                  <Box mb={1} sx={{ display: 'flex' }}>
                                    <Typography variant="h6" flexGrow={1}>
                                      Accuracy Rating:<b>{runnerRatingDetails && horseUuid && runnerRatingDetails[0]?.accuracyRating}</b>
                                    </Typography>
                                    <HtmlTooltip
                                      placement="bottom"
                                      className="CommonTooltip"
                                      sx={{ width: '346px !important' }}
                                      title={
                                        <Box>
                                          {
                                            'This looks at the pedigree’s completeness and takes into account the horse, sire, dam along with the required data points for each (YoB, CoB, Colour, Sex, etc).'
                                          }{' '}
                                        </Box>
                                      }
                                    >
                                      <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                                    </HtmlTooltip>
                                  </Box>
                                  <Box className="ProgressBar-Line">
                                    <Box sx={{ flexGrow: 1 }}>
                                      <BorderLinearProgress2 variant="determinate" value={calculateHorseRating()} />
                                    </Box>
                                  </Box>
                                </Stack>
                              </Box>
                            </Grid>}
                            {productId === 1 ? (
                              <>
                                {renderSearchMare()}
                                {searchStallion('multi')}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 2 ? (
                              <>
                                {countryValue('multi')}
                                {renderStudFeeRange()}
                                {/* {searchStallion('multi')} */}
                                {searchStallionProReport()}
                                {renderSearchMare()}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 3 ? (
                              <>
                                {countryValue('multi')}
                                {renderSearchMare()}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 4 ? (
                              <>
                                {countryValue('multi')}
                                {renderSaledAndLots()}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 14 ? (
                              <>
                                {searchStallion('')}
                                {countryValue('multi')}
                                {renderSaledAndLots()}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 5 ? (
                              <>
                                {searchStallion('single')}
                                {searchFarm()}
                              </>
                            ) : (
                              ''
                            )}

                            {productId === 6 ? (
                              <>
                                {countryValue('multi')}
                                {renderSearchMare()}
                              </>
                            ) : (
                              ''
                            )}

                            <Grid item xs={6} md={6} mt={1} className="racelistgroup">
                              <Box className="FormGroup">
                                <List className="RawDataList">
                                  <ListItem>
                                    <ListItemText
                                      primary="Subtotal: "
                                      secondary={`${currencyCode?.substring(0, 2)}${currencySymbol}${subTotal}`}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText
                                      primary="Discount: "
                                      secondary={`${currencyCode?.substring(0, 2)}${currencySymbol}${discount}`}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText
                                      primary="Total: "
                                      secondary={`${currencyCode?.substring(0, 2)}${currencySymbol}${total}`}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText
                                      primary="Payment Status: "
                                      primaryTypographyProps={{
                                        minWidth: '120px !important',
                                      }}
                                      secondary={`${paymentStatus} ${parseDateTime(statusTime)}`}
                                      secondaryTypographyProps={{
                                        minWidth: '210px !important',
                                        whiteSpace: 'nowrap',
                                      }}
                                    />
                                  </ListItem>
                                </List>
                              </Box>
                            </Grid>

                            <Grid item xs={6} md={6} mt={1} className="racelistgroup">
                              <Box className="FormGroup">
                                <List className="RawDataList">
                                  <ListItem>
                                    <ListItemText
                                      primary="Tax:"
                                      secondary={`${currencyCode?.substring(0, 2)}${currencySymbol}${tax}`}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Promo Code:" secondary={promoCode} />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText primary="Gateway:" secondary={paymentMethod} />
                                  </ListItem>
                                </List>
                              </Box>
                            </Grid>
                            {status === 'Completed' || status === 'Delivered' ? (
                              <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                                <Stack sx={{ mt: 4 }} className="DrawerBtnWrapper">
                                  <Grid container className="DrawerBtnBottom">
                                    <Grid
                                      item
                                      xs={6}
                                      md={6}
                                      sx={{ paddingTop: '10px !important', marginRight: '8px' }}
                                    >
                                      <TextField
                                        value={emailToShare}
                                        onChange={(e) => setEmailToShare(e.target.value)}
                                        fullWidth
                                        placeholder="Enter Email Address"
                                        className="edit-field"
                                      />
                                    </Grid>
                                    <Grid item xs={3} md={3} sx={{ paddingTop: '10px !important' }}>
                                      <LoadingButton
                                        onClick={handleShareEmail}
                                        disabled={emailToShare?.trim() === '' ? true : false}
                                        fullWidth
                                        className="search-btn"
                                        type="submit"
                                        variant="contained"
                                        loading={buttonLoading}
                                      >
                                        Share
                                      </LoadingButton>
                                    </Grid>
                                  </Grid>
                                </Stack>
                              </Grid>
                            ) : (
                              ''
                            )}
                            <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                              <Stack sx={{ mt: 4 }} className="DrawerBtnWrapper">
                                <Grid container spacing={4} className="DrawerBtnBottom">
                                  <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                                    <LoadingButton
                                      fullWidth
                                      className="search-btn"
                                      onClick={
                                        status === 'Completed' || status === 'Delivered'
                                          ? handleSaveOrder
                                          : handleApprove
                                      }
                                      type="submit"
                                      disabled={(productId === 7 || productId === 8 || productId === 9 || productId === 10) ? true : false}
                                      variant="contained"
                                      loading={approveLoading || sendButtonLoading}
                                    >
                                      {status === 'Completed' || status === 'Delivered'
                                        ? 'Send'
                                        : 'Approve'}
                                    </LoadingButton>
                                  </Grid>
                                  <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                                    <Button
                                      fullWidth
                                      type="button"
                                      className="add-btn"
                                      onClick={handleOpenCancelRefundWrapper}
                                    >
                                      Cancel
                                    </Button>
                                  </Grid>
                                </Grid>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Box>
                      </FormProvider>
                    </Box>
            }
            <CancelRefundWrapperDialog
              title="Are you sure?"
              data={dataDetails}
              canelOrder={() => {
                handleCancelOrder();
                setOpenCancelRefundWrapper(false);
                handleCloseEditState();
              }}
              open={openCancelRefundWrapper}
              close={handleCloseCancelRefundWrapper}
            />
          </Scrollbar>
        )}
      </Drawer>
      {approveLoading ? (
        <Box className="overlay">
          <CircularProgress />
        </Box>
      ) : null}
    </>
  );
}

const Placeholder = ({ children }: any) => {
  return <div>{children}</div>;
};