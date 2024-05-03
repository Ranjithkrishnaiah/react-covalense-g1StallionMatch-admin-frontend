// @mu
import { 
  Box, 
  Container,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableSortLabel,
  styled 
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom'
import Page from 'src/components/Page';
import './dashboard.css'
import HorseFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseFilterSidebar';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useHorseQuery, useHorsesQuery } from 'src/redux/splitEndpoints/horseSplit'
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// hooks
import useSettings from 'src/hooks/useSettings';
// @types
import { Horse } from 'src/@types/horse';
import Scrollbar from 'src/components/Scrollbar';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// sections
import { HorseListTableRow } from 'src/sections/@dashboard/horse/list';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import DatePicker from 'src/components/DatePicker';
import { MenuProps } from '../../constants/MenuProps';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DataAnalytics from 'src/sections/@dashboard/horse/DataAnalytics';
import HorseEditModal from 'src/sections/@dashboard/horse/HorseEditModal';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

function descendingComparator(a: any, b: any, orderBy: any) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
};

const headCells = [
  {
    id: 'horseName',
    numeric: false,
    disablePadding: true,
    label: 'Horse',
  },
  {
    id: 'sex',
    numeric: false,
    disablePadding: true,
    label: 'Sex',
  },  
  {
    id: 'yob',
    numeric: true,
    disablePadding: true,
    label: 'YOB',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'breeding',
    numeric: false,
    disablePadding: true,
    label: 'Breeding',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Created',
  },
  {
    id: 'runner',
    numeric: false,
    disablePadding: true,
    label: 'Runner',
  },
  {
    id: 'stakes',
    numeric: false,
    disablePadding: true,
    label: 'Stakes',
  },
  {
    id: 'isVerified',
    numeric: false,
    disablePadding: true,
    label: 'Verified',
  },
  {
    id: 'progeny',
    numeric: false,
    disablePadding: true,
    label: 'Progeny',
  },
];

export default function HorseProgeny() {
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('horseName');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleAddModal = (value: boolean) => {
    setShowAddModal(value)
  }

  function EnhancedTableHead(props: any) {
    const {
      //onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property)
    }
  
    return (
      <TableHead className='horseTableHead'>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowUpRoundedIcon : KeyboardArrowDownRoundedIcon}
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'ASC'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
  {order === 'DESC' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
                {headCell.label === 'Horse' ? 
                <Box className='tooltipPopoverbox'>                  
                  <HtmlTooltip
                      className="tableTooltip"
                      title={
                        <React.Fragment>
                          <Box className='tooltipPopoverBody HorseDetailsPopover'>
                            <p><i className='popover-circle yellow'></i> Unverified Horse</p>
                            <p><i className='popover-circle red'></i> Missing Information</p>
                            <p><i className='popover-circle black'></i> Verified & Complete</p>
                          </Box>
                        </React.Fragment>
                      }
                    >
                    <i className="icon-Info-circle tooltip-table" />
                  </HtmlTooltip>
                </Box>

                : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
        </TableRow>
      </TableHead>
    )
  }
  const filterCounterhook = useCounter(0);
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/");  
  const horseSubModule = currentPage[3];
  const horseID:any = (horseSubModule === 'progeny') ? currentPage[4] : "";
  const [ishorseID, setIshorseID] = useState((horseID === "")  ? false : true);
  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);
  
  
  const [tableData, setTableData] = useState<Horse[]>([]);  
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [dateValue, setDateValue] = React.useState(null);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [horseModuleAccess, setHorseModuleAccess] = useState({
    horse_list: false,
    horse_dashboard: false,
    horse_dashboard_download: false,
    horse_list_download: false,
    horse_filter_duplicate: false,
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
    if (valuesExist.hasOwnProperty('HORSE_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    setHorseModuleAccess({
      ...horseModuleAccess,
      horse_list: !valuesExist?.hasOwnProperty('HORSE_ADMIN_READ_ONLY') ? false : true,
      horse_list_download: !valuesExist?.hasOwnProperty('HORSE_ADMIN_EXPORT_LISTS') ? false : true,
      horse_dashboard: !valuesExist?.hasOwnProperty('HORSE_ADMIN_VIEW_HORSE_DETAILS_DASHBOARD')
        ? false
        : true,
      horse_dashboard_download: !valuesExist?.hasOwnProperty('HORSE_ADMIN_DASHBOARD_EXPORT_FUNCTION')
        ? false
        : true,
      horse_filter_duplicate: !valuesExist?.hasOwnProperty('HORSE_ADMIN_ACCESS_TO_FIND_DUPLLICATES_FUNCTION')
        ? false
        : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const handlePromotedDate = (date: any) => {
    // console.log(date, 'EE')
    setDateValue(date)
  };

  const handleFilter =  (value : any) =>  {
    setGetFilters(value);
  }

  const handleFilterApplied =()=>{
    setIsFilterApplied(true);
  }

  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };
  
  const [state, setStateValue] = React.useState({
    horseName: "",
    isHorseNameExactSearch: true,
    sireName: "",
    isSireNameExactSearch: true,
    damName: "",
    isDamNameExactSearch: true,
    sireId: horseID,
    countryId: "none",
    stateId: "none",
    eligibility: "none",
    horseBreed: "none",
    stakesStatus: "All",
    runnerStatus: "All",
    accuracyProfile: "none",
    sireStatus: "none",
    damStatus: "none",
    createdBy: "none",
    missingYob: false,
    missingCob: false,
    unVerified: false,
    isMissingYobClicked: false,
    isMissingCobClicked: false,
    isUnverifiedClicked: false,
    YobDate: "",
    yobDateValue: [null, null],
    createDate: "",
    createDateValue: [null, null],
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy
  });

  const clearAll = () => {
    setStateValue({
      horseName: "",
      isHorseNameExactSearch: true,
      sireName: "",
      isSireNameExactSearch: true,
      damName: "",
      isDamNameExactSearch: true,
      sireId: horseID,
      countryId: "none",
      stateId: "none",
      eligibility: "none",
      horseBreed: "none",
      stakesStatus: "All",
      runnerStatus: "All",
      accuracyProfile: "none",
      sireStatus: "none",
      damStatus: "none",
      createdBy: "none",
      missingYob: false,
      missingCob: false,
      unVerified: false,
      isMissingYobClicked: false,
      isMissingCobClicked: false,
      isUnverifiedClicked: false,
      YobDate: "",
      yobDateValue: [null, null],
      createDate: "",
      createDateValue: [null, null],
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy
    });   
    setIsSearchClicked(false)
    handleRemoveFilterApplied();
  };

  

  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [loadingData, setLoadingData] = useState<any>(false)


  useEffect(() => {
    if(ishorseID) {
      handleFilter({
        sireId: horseID,
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
      });
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else {
      setIsSearchClicked(false);   
    }    
  }, [horseID]);

  const data:any = useHorsesQuery(isFilterApplied ? getFilters : newState, {skip: (!isSearchClicked)});   
  let horseList = data?.data?.data ? data?.data?.data : [];
  //horseList = horseList.filter((item:any) => item?.isActive !== false)
  
  const horseListProps = {
    page : page,
    setPage,
    result: horseList,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
    clearAll
  };  
  useEffect(() => {
    setTableData(data?.data || tableData)
    if(data?.status !== "pending"){
      setLoadingData(false)
    }
  }, [data])
  
  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.horsedetails.edit(id));
  };

  const gotoRace = () => {
    navigate(PATH_DASHBOARD.race.data);
  };

  const gotoDashboard = () => {
    clearAll()
    navigate(PATH_DASHBOARD.horsedetails.data);
  };
  
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event:any) => {
     setAnchorEl(event.currentTarget);
     setOpenPopper((previousOpen) => !previousOpen);
  };

  const canBeOpen = openPopper && Boolean(anchorEl);
  // const id = canBeOpen ? 'transition-popper' : undefined;  
  const hidePopover = () => {
    setOpenPopper(false);
  } 

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };


  const handleRequestPaginationLimit = (pageLimit: number) => 
    {
      const datafltr = {
        ...({ page: page }), 
        ...({ limit: pageLimit }),
        ...({ order: order }),
        ...({ sortBy: orderBy }),
        ...(state?.horseName !== '' && { horseName: state?.horseName }),
        ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
        ...(state?.sireName !== '' && { sireName: state?.sireName }),
        ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
        ...(state?.damName !== '' && { damName: state?.damName }),
        ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
        ...(state?.sireId !== '' && { sireId: state?.sireId }),
        ...(state?.countryId !== 'none' && { country: state?.countryId }),
        ...(state?.stateId !== 'none' && { state: state?.stateId }),
        ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
        ...(state?.horseBreed !== 'none' && { horseBreed: state?.horseBreed }),
        ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
        ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
        ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
        ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
        ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
        ...(state?.createdBy !== 'none' && { createdBy: state?.createdBy }),
        ...(state?.isMissingYobClicked && {missingYob: state?.missingYob}),
        ...(state?.isMissingCobClicked && {missingCob: state?.missingCob}),
        ...(state?.isUnverifiedClicked && {unVerified: state?.unVerified}),
      }
      handleFilter(datafltr)
      // data?.refetch();
  }

  const handleRequestPagination = (pageNum: number) => 
  {
    const datafltr = {
      ...({ page: pageNum }), 
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ sortBy: orderBy }),
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
      ...(state?.sireId !== '' && { sireId: state?.sireId }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== 'none' && { horseBreed: state?.horseBreed }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy !== 'none' && { createdBy: state?.createdBy }),
      ...(state?.isMissingYobClicked && {missingYob: state?.missingYob}),
      ...(state?.isMissingCobClicked && {missingCob: state?.missingCob}),
      ...(state?.isUnverifiedClicked && {unVerified: state?.unVerified}),
    }
    handleFilter(datafltr)
    setLoadingData(true)
    // data?.refetch();
  }

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...({ page: page }), 
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ sortBy: property }),
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName !== '' && { isHorseNameExactSearch: state?.isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName !== '' && { isSireNameExactSearch: state?.isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName !== '' && { isDamNameExactSearch: state?.isDamNameExactSearch }),
      ...(state?.sireId !== '' && { sireId: state?.sireId }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== 'none' && { horseBreed: state?.horseBreed }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy !== 'none' && { createdBy: state?.createdBy }),
      ...(state?.isMissingYobClicked && {missingYob: state?.missingYob}),
      ...(state?.isMissingCobClicked && {missingCob: state?.missingCob}),
      ...(state?.isUnverifiedClicked && {unVerified: state?.unVerified}),
    }
    handleFilter(datafltr)
    // data?.refetch();
  }
  const [selected, setSelected] = useState([]);
  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = horseList.map((n: any) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const [apiStatus, setApiStatus] = useState(false);
  const { themeLayout } = useSettings();
  
  const { id = '' } = useParams();
  
  const isEdit = pathname.includes('edit');  
  const horseResponse = useHorseQuery(id, {skip: (!isEdit)});
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  return (
    <>
    <DashboardHeader handleShowAddHorse={toggleAddModal} isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
    <Page title="Horse List" sx={{display: 'flex'}} className='HorseDataDashboard'> 
        {showAddModal ?
          <HorseEditModal
            horseId={id}
            currentHorse={horseResponse?.data}
            isEdit={isEdit}
            genId={0}
            progenyId={0}
            apiStatus={true}
            setApiStatus={setApiStatus}
            apiStatusMsg={apiStatusMsg}
            setApiStatusMsg={setApiStatusMsg}
            toggleAddModal={toggleAddModal}
            showAddModal={showAddModal}
          />
      : <HorseFilterSidebar 
        handleFilter={handleFilter}
        handleFilterApplied={handleFilterApplied}
        handleRemoveFilterApplied={handleRemoveFilterApplied}
        isFilterApplied={isFilterApplied}
        rowCount={(!isFilterApplied) ? 0 : data?.data?.meta?.itemCount}
        horseModuleAccess={horseModuleAccess}
        page={page}
        limit={limit}
        orderBy={orderBy} 
        setOrderBy={setOrderBy} 
        order={order} 
        setOrder={setOrder}
        isSearchClicked={isSearchClicked}
        setIsSearchClicked={setIsSearchClicked}
        state={state}
        setStateValue={setStateValue}
      />}
   <Box className='HorseDataDashboardRight' px={2}>
     <Container>
     { !isSearchClicked ?
     <Box>
        <DataAnalytics />
     </Box>
     :
     (!isFilterApplied) ?
      <NoDataComponent {...horseListProps} />
      :
     (data?.isFetching) ?
      <Box className='Spinner-Wrp'> <Spinner /> </Box>: 
      (horseList?.length > 0) ? 
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          {loadingData ? <Box className='Spinner-Wrp' sx={{ minHeight: 350 }} > <Spinner /> </Box>: 
          <Scrollbar>
            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
            <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                //onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={horseList.length}
              />
              <TableBody>
                {horseList.map((row:any, index:number) => (
                  <HorseListTableRow
                  key={row.horseId}
                  row={row}
                  selected={row.horseId}
                  onEditRow={() => handleEditRow(row.horseId)}  
                  gotoRace={gotoRace}
                  gotoDashboard={gotoDashboard} 
                  isProgenyPage={true}                 
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer> 
          </Scrollbar>}
          <Box className='Pagination-wrapper'>
            <PaginationSettings data={horseListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
            <PaginationLimit data={horseListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
          </Box>
        </Card>
        :
        <NoDataComponent {...horseListProps} />
    }
       </Container>
     </Box>
</Page>
</>
  );
}
