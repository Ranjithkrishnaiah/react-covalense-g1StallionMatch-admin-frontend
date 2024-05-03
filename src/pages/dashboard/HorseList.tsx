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
  Divider,
  TableSortLabel,
  styled 
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useHorsesQuery } from 'src/redux/splitEndpoints/horseSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
//import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
//import { Product } from '../../@types/product';
import { Horse } from '../../@types/horse';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';

// sections
import {
  HorseListTableRow,
} from '../../sections/@dashboard/horse/list';
import HorseFilterSidebar from 'src/sections/@dashboard/horse/filter/HorseFilterSidebar';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
import { visuallyHidden } from '@mui/utils'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
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
}
  
function getComparator(order: any, orderBy: any) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy)
}
  
// This method is created for cross-browser 
// compatibility, if you don't need to support IE11, 
// you can use Array.prototype.sort() directly
  
function stableSort(array: any, comparator: any) {
  const stabilizedThis = array.map((el: any, index: number) => [el, index])
  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el: any) => el[0])
}

const headCells = [
  {
    id: 'farmName',
    numeric: false,
    disablePadding: true,
    label: 'Horse',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Sex',
  },  
  {
    id: 'stateName',
    numeric: false,
    disablePadding: true,
    label: 'YOB',
  },
  {
    id: 'totalStallions',
    numeric: true,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'promoted',
    numeric: true,
    disablePadding: true,
    label: 'Breeding',
  },
  {
    id: 'promoted',
    numeric: true,
    disablePadding: true,
    label: 'Created',
  },
  {
    id: 'users',
    numeric: true,
    disablePadding: true,
    label: 'Runner',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Stakes',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Followed',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Progeny',
  },
]

export default function HorseList() {
  const filterCounterhook = useCounter(0);
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('horseName');
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
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
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

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
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
  return (
    <StyledEngineProvider injectFirst>
    <Page title="Horse List" sx={{display: 'flex'}}>
      <HorseFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} handleRemoveFilterApplied={handleRemoveFilterApplied} rowCount={data?.data?.meta?.itemCount} horseModuleAccess={horseModuleAccess}/>
      <Container maxWidth={themeStretch ? false : 'lg'}> 
      { data?.isLoading ?
      <Box className='Spinner-Wrp'> <Spinner /> </Box>: 
      (horseListProps?.result?.length > 0) ? 
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
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
                  isProgenyPage={true}                       
                  />
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
    </StyledEngineProvider>
  );
}