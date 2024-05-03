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
  styled,
  Stack,
  Grid,
  Typography 
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom'
import Page from 'src/components/Page';
import 'src/pages/dashboard/dashboard.css'
import HorseFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseFilterSidebar';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useHorseQuery, useProgenyByHorseIdQuery, useHorseDetailsByIdQuery } from 'src/redux/splitEndpoints/horseSplit'
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
import { MenuProps } from 'src/constants/MenuProps';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DataAnalytics from 'src/sections/@dashboard/horse/DataAnalytics';
import HorseEditModal from 'src/sections/@dashboard/horse/HorseEditModal';
import { toPascalCase } from 'src/utils/customFunctions';
// ----------------------------------------------------------------------

// Tooltip style used in horse name column in horse list
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// Horse table column names
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
];

export default function HorseProgeny1(props: any) {
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('horseName');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleAddModal = (value: boolean) => {
    setShowAddModal(value)
  }

  // Method to display table header with sorting
  function EnhancedTableHead(props: any) {
    const {
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

  const { state, setStateValue, progenyTotal, setProgenyTotal } = props;
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/");  
  const horseSubModule = currentPage[5];
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

  // Set the member payload if filter is choosen
  const handleFilter =  (value : any) =>  {
    setGetFilters(value);
  }

   // upadte the IsFilterApplied state if filter is choosen
  const handleFilterApplied =()=>{
    setIsFilterApplied(true);
  }

  // Update isFilterApplied state variable
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
  
  // Clear all state variable
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

  // Check the horse filter is added
  useEffect(() => {
    if(ishorseID) {
      handleFilter({
        horseId: horseID,
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

  // Horse progeny api call
  const data:any = useProgenyByHorseIdQuery(isFilterApplied ? getFilters : newState, {skip: (!isSearchClicked)});   
  let horseList = data?.data?.data ? data?.data?.data : [];
  
  setProgenyTotal(data?.data?.meta?.itemCount);
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
  
  // routing to horse edit page
  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.horsedetails.edit(id));
  };

  // routing to race page 
  const gotoRace = () => {
    navigate(PATH_DASHBOARD.race.data);
  };

  // routing to horse dashboard page
  const gotoDashboard = () => {
    clearAll()
    navigate(PATH_DASHBOARD.horsedetails.data);
  };
  
  // routing to horse list page
  const handleBackToHorseList = () => {
    setStateValue({
      ...state,
      sireId: ""
    })
    navigate(PATH_DASHBOARD.horsedetails.data);
  }

  // If user change the limit, reload the horse list api with filter payload
  const handleRequestPaginationLimit = (pageLimit: number) => 
    {
      const datafltr = {
        ...({ page: 1 }), 
        ...({ limit: pageLimit }),
        ...({ order: order }),
        ...({ sortBy: orderBy }),
        ...({ horseId: horseID }),
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
      handleFilter(datafltr);
  }

  // If user change the page number, reload the horse list api with filter payload
  const handleRequestPagination = (pageNum: number) => 
  {
    const datafltr = {
      ...({ page: pageNum }), 
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ sortBy: orderBy }),
      ...({ horseId: horseID }),
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
    setLoadingData(true);
  }

  // If user change the sort, reload the horse list api with filter payload
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...({ page: page }), 
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ sortBy: property }),
      ...({ horseId: horseID }),
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
    handleFilter(datafltr);
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
  const horseDetailResponse = useHorseDetailsByIdQuery(id);
  const progenyHorseName = horseDetailResponse?.isSuccess ? horseDetailResponse?.data?.horseName : "";

  return (
    <>
    {/* Header component */}
    <DashboardHeader handleShowAddHorse={toggleAddModal} isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
    <Page title="Horse List" sx={{display: 'flex'}} className='HorseDataDashboard'> 
      {/* Based on condition, it render edit page or Horse Filter or Prgeny filter component */}
        {showAddModal &&
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
          />}
    {/* 
      Horse data table component
      if no filter is applied or no extra query string is available in URL, render Dashboard compoenent
      if data is loading it loads spinner component
      if data is present the data table component loads
      if there is no data NoData component is loaded 
    */}         
    <Box className='HorseDataDashboardRight'>
      <Stack direction='row' className='MainTitleHeader '>
        <Grid item lg={12} sm={12}>
          <Typography variant="h5" className='horse-MainTitle' style={{cursor: "pointer"}} onClick={handleBackToHorseList}> <i className="icon-Chevron-left"/> Back to horse list</Typography>
        </Grid>
      </Stack>
     
      <Stack direction='row' className='MainTitleHeader' pb={3}>
        <Grid item lg={6} sm={6}>
          <Typography variant="h6" style={{float: "left"}} className='MainTitle'>Progeny list of <strong>{toPascalCase(progenyHorseName)}</strong></Typography>
        </Grid>
        <Grid item lg={6} sm={6}>
          <Typography variant="h6" style={{float: "right"}} className='MainTitle'>{data?.data?.meta?.itemCount} result found</Typography>
        </Grid>
      </Stack>
      
     { 
     (data?.isFetching) ?
      <Box className='Spinner-Wrp'> <Spinner /> </Box>: 
      (horseList?.length > 0) ? 
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          {loadingData ? <Box className='Spinner-Wrp' sx={{ minHeight: 350 }} > <Spinner /> </Box>: 
          <Scrollbar>
            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
            <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
              {/* Render sortby table header */}
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={horseList.length}
              />
              {/* End Render sortby table header */}
              <TableBody>
                {/* Render horseList data from MemberListTableRow component */}
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
                {/* End Render horseList data from MemberListTableRow component */}
              </TableBody>
            </Table>
          </TableContainer> 
          </Scrollbar>}
          {/* Render Pagination and limit component */}
          <Box className='Pagination-wrapper'>
            <PaginationSettings data={horseListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
            <PaginationLimit data={horseListProps} handleRequestPaginationLimit={handleRequestPaginationLimit} limit={limit} setLimit={setLimit} />
          </Box>
          {/* End Render Pagination and limit component */}
        </Card>
        :
        <NoDataComponent {...horseListProps} />
    }       
    </Box>
</Page>
</>
  );
}