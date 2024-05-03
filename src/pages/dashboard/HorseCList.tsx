import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
  Switch,
  Tooltip,
  TableBody,
  Container,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  StyledEngineProvider,
  Fade,
  Popper,
  MenuItem,
  Divider 
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useHorsesQuery } from 'src/redux/splitEndpoints/horseSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
//import { Product } from '../../@types/product';
import { Horse } from '../../@types/horse';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedActions,
} from '../../components/table';
// sections
import {
  HorseListTableRow,
} from '../../sections/@dashboard/horse/list';
import HorseFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseFilterSidebar';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
import { TableMoreMenu } from 'src/components/table';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: 'Horse', align: 'left' },
    { id: 'sex', label: 'Sex', align: 'left' },
    { id: 'yob', label: 'YOB', align: 'left' },
    { id: 'cob', label: 'Country', align: 'center' },
    { id: 'breeding', label: 'Breeding', align: 'center' },
    { id: 'createdAt', label: 'Created', align: 'left' },
    { id: 'runner', label: 'Runner', align: 'left' },
    { id: 'stakes', label: 'Stakes', align: 'left' },
    { id: 'followed', label: 'Followed', align: 'left' },
    { id: 'progeny', label: 'Progeny', align: 'left' },
    { id: 'action', label: '', align: 'left', icon:`icon-Share` },
  ];

// ----------------------------------------------------------------------

export default function HorseCList() {
  
  const filterCounterhook = useCounter(0);
  const { themeStretch } = useSettings();

  const navigate = useNavigate();

  const dispatch = useDispatch();
  
  const [tableData, setTableData] = useState<Horse[]>([]);
  
  const [filterName, setFilterName] = useState('');

  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
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

  const handleFilter =  (value : any) =>  {
    setGetFilters(value);
  }

  const handleFilterApplied =()=>{
    setIsFilterApplied(true);
  }

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  let newState = {
    page: page,
    limit: limit,
  };
  const data = useHorsesQuery(isFilterApplied ? getFilters : newState);   
  let horseList = data?.data?.data ? data?.data?.data : [];
  const horseListProps = {
    page : (page == 0) ? 1 : page,
    setPage,
    result: horseList,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,    
    limit: rowsPerPage,
    setLimit
  };  
  useEffect(() => {
    setTableData(data?.data || tableData)
  }, [data])
  
  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.horsedetails.edit(id));
  };
  
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event:any) => {
     setAnchorEl(event.currentTarget);
     setOpenPopper((previousOpen) => !previousOpen);
  };

  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;  
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

  return (
    <StyledEngineProvider injectFirst>
    <Page title="Horse List" sx={{display: 'flex'}}>
      <HorseFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} rowCount={data?.data?.meta?.itemCount} horseModuleAccess={horseModuleAccess}/>
      <Container maxWidth={themeStretch ? false : 'lg'}> 
      { data?.isLoading ?
      <Box className='Spinner-Wrp'> <Spinner /> </Box>: 
      (horseListProps?.result?.length > 1) ? 
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          <Scrollbar>
            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
            <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Horse <Box className='tooltipPopover'><i className={'icon-Info-circle tooltip-table'} onMouseOver={handleClick} onMouseOut={hidePopover} /></Box></TableCell>
                  <TableCell align="left">Sex</TableCell>
                  <TableCell align="left">YOB</TableCell>
                  <TableCell align="left">Country</TableCell>
                  <TableCell align="left">Breeding</TableCell>
                  <TableCell align="left">Created</TableCell>
                  <TableCell align="left">Runner</TableCell>
                  <TableCell align="left">Stakes</TableCell>
                  <TableCell align="left">Followed</TableCell>
                  <TableCell align="left">Progeny</TableCell>
                  <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horseList.map((row:any, index:number) => (
                  <HorseListTableRow
                  key={row.horseId}
                  row={row}
                  selected={row.horseId}
                  onEditRow={() => handleEditRow(row.horseId)}     
                  isProgenyPage={true}                      
                  />
                  // <TableRow
                  //   key={row.horseId}
                  //   sx={{ marginBottom: '10px' }}
                  //   hover selected={row.horseId}
                  // >
                  //   <TableCell align="left">{row.horseName}</TableCell>
                  //   <TableCell align="left">{row.horseId}</TableCell>
                  //   <TableCell align="left">{row.yob}</TableCell>
                  //   <TableCell align="left">{row.countryName}</TableCell>
                  //   <TableCell align="left">&nbsp;</TableCell>
                  //   <TableCell align="left">{row.createdOn}</TableCell>
                  //   <TableCell align="left">&nbsp;</TableCell>
                  //   <TableCell align="left">&nbsp;</TableCell>
                  //   <TableCell align="left">&nbsp;</TableCell>
                  //   <TableCell align="left">&nbsp;</TableCell>
                  //   <TableCell align="left" className='table-more-btn'>
                  //     <TableMoreMenu
                  //       open={openMenu}
                  //       onOpen={handleOpenMenu}
                  //       onClose={handleCloseMenu}
                  //       actions={
                  //         <>
                  //           <MenuItem
                  //             onClick={() => {
                  //               handleEditRow(row.horseId);
                  //               handleCloseMenu();                  
                  //             }}
                  //           >Edit Horse</MenuItem>
                  //           <Divider style={{ margin: "0"}} />
                  //           <MenuItem>View  Progeny</MenuItem>
                  //           <Divider style={{ margin: "0"}} />
                  //           <MenuItem>View Races</MenuItem>
                  //           <Divider style={{ margin: "0"}} />
                  //           <MenuItem>View Activity</MenuItem>
                  //         </>
                  //          }
                  //          />
                  //   </TableCell>
                  // </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer> 
          </Scrollbar>
          <Box className='Pagination-wrapper'>
            <PaginationSettings data={horseListProps} />
            <PaginationLimit data={horseListProps} />
          </Box>
        </Card>
        :
        <NoDataComponent />
        }
      </Container>       
    </Page>
    <div className='tooltipPopover'>
      <Popper className='tooltipPopover' id={id} open={openPopper} anchorEl={anchorEl} transition placement='auto-end'>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Box className='tooltipPopoverBody HorseDetailsPopover'>
            <p><i className='popover-circle yellow'></i> Unverified Horse</p>
            <p><i className='popover-circle red'></i> Missing Information</p>
            <p><i className='popover-circle black'></i> Verified & Complete</p>
          </Box>
        </Fade>
      )}
    </Popper>
    </div>
    </StyledEngineProvider>
  );
}