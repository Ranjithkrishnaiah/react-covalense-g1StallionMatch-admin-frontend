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
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  Typography,
  Stack,
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
import { useStallionsQuery, useStallionQuery } from 'src/redux/splitEndpoints/stallionsSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
//import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
import { Stallion } from '../../@types/stallion';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import {
  StallionListTableRow
} from '../../sections/@dashboard/stallion/list';
import StallionFilterSidebar from '../../sections/@dashboard/stallion/filters/StallionFilterSidebar';
import StallionNewEditModal from 'src/sections/@dashboard/stallion/StallionNewEditModal';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
import { visuallyHidden } from '@mui/utils'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
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
    id: 'horseName',
    numeric: false,
    disablePadding: true,
    label: 'Stallion',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },  
  {
    id: 'farmName',
    numeric: false,
    disablePadding: true,
    label: 'Farm',
  },
  {
    id: 'fee',
    numeric: true,
    disablePadding: true,
    label: 'Stud Fee',
  },
  {
    id: 'yearToStud',
    numeric: true,
    disablePadding: true,
    label: 'Last Updated',
  },
  {
    id: 'isPromoted',
    numeric: true,
    disablePadding: true,
    label: 'Promoted',
  },
  {
    id: 'isPromoted',
    numeric: false,
    disablePadding: true,
    label: 'Active',
  },
]

export default function StallionList() { 
  
  
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
      <TableHead className='stallionTableHead'>
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
                {headCell.label === 'Promoted' ? 
                <Box className='tooltipPopoverbox'>
                  <HtmlTooltip
                    className="tableTooltip"
                    title={
                      <React.Fragment>
                        <Box className='tooltipPopoverBody'>
                          <p><i className='icon-Confirmed-24px'></i> Valid Promotion</p>
                          <p><i className='icon-Incorrect'></i> Recently Expired</p>
                          <p><i className='icon-NonPromoted'></i> Not Promoted</p>
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
  const [tableData, setTableData] = useState<Stallion[]>([]);
  
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);

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
    order: order,
    sortBy: orderBy,
  };
  // const [currentStallion, setCurrentStallion] = useState<any>([]);
  const data = useStallionsQuery(isFilterApplied ? getFilters : newState);  
  const stallionList = data?.data?.data ? data?.data?.data : [];
  let currentStallion = {
    "stallionId": "",
    "profilePic": "",
    "url": "",
    "height": 0,
    "yearToStud": 0,
    "yearToRetired": 0,
    "reasonId": 0,
    "isActive": false,
    "colourId": 0,
    "isPromoted": 0,
    "horseName": "",
    "yob": 0,
    "horseId": "",
    "farmId": "",
    "farmName": "",
    "currencyCode": "",
    "feeYear": 0,
    "currencyId": 0,
    "fee": 0,
    "isPrivateFee": false,
    "countryId": 0,
    "stateId": 0,
  }
  const stallionListProps = {
    page : (page == 0) ? 1 : page,
    setPage,
    result: data?.data?.data,
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

  const [editId, setEditId] = useState('');
  const [openAddEditForm, setOpenAddEditForm] = useState(false);
  const handleDrawerOpenRow = (stallionId: string) => {
    setOpenAddEditForm(true);
  };
  
  const handleDrawerCloseRow = () => {
    setOpenAddEditForm(false);
  };

  const [open, setOpen] = useState(false);
  const [isEdit,setEdit] = useState(false);
  const [rowId, setRowId] = useState("");

  const handleEditPopup = () =>{
    setOpen(!open);
  }

  const handleEditState = () =>{
    setEdit(true);
  }

  const handleCloseEditState =() => {
    setEdit(!isEdit);
  }
  const [selected, setSelected] = useState([]);
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
  
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };
  
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
  }
  
  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = stallionList.map((n: any) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const { data: stallionDataById, error, isFetching, isLoading, isSuccess } = useStallionQuery(rowId, { skip: (!isEdit) }); 
  // setCurrentStallion(stallionDataById);  
  currentStallion = stallionDataById;
  
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [stallionModuleAccess, setStallionModuleAccess] = useState({
    stallion_list: false,
    stallion_dashboard: false,
    stallion_dashboard_download: false,
    stallion_list_download: false,
    stallion_edit: false,
    stallion_edit_promoted_page: false,
    stallion_feehistory: false,
    // horse_list: false,
  });
  
  return (
    <StyledEngineProvider injectFirst> 
    <Page title="Stallion List" sx={{display: 'flex'}}>     
      <StallionFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} handleRemoveFilterApplied={handleRemoveFilterApplied} isFilterApplied={isFilterApplied} rowCount={data?.data?.meta?.itemCount} page={page} limit={limit} />     
      <Container maxWidth={themeStretch ? false : 'lg'} >
      { data?.isLoading ?
     <Box className='Spinner-Wrp'>  <Spinner /></Box> : 
     (stallionListProps?.result?.length > 0) ?
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
                rowCount={stallionList.length}
              />
            <TableBody>
              {stallionList.map((row:any, index:number) => (
                <StallionListTableRow
                  key={row.stallionId}
                  row={row}
                  selected={row.stallionId}
                  onSelectRow={row.stallionId}
                  onEditPopup={() => handleEditPopup()}
                  onSetRowId={() => setRowId(row.stallionId)}
                  handleEditState={() => handleEditState()}
                  open={open}      
                  stallionModuleAccess={stallionModuleAccess}
                  setStallionModuleAccess={setStallionModuleAccess}
                  clickedPopover={clickedPopover}
                  setClickedPopover={setClickedPopover}          
                  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>            
          </Scrollbar>          
          <Box className='Pagination-wrapper'>
            <PaginationSettings data={stallionListProps} />
            <PaginationLimit data={stallionListProps}/>
          </Box>
        </Card>
        :
        <NoDataComponent />
        }
      </Container>
      {isEdit && 
        <StallionNewEditModal 
          open={open} 
          rowId={rowId} 
          isEdit={isEdit} 
          handleEditPopup={handleEditPopup} 
          handleCloseEditState={handleCloseEditState} 
          currentStallion={currentStallion}
        />  
      }
    </Page>
    </StyledEngineProvider>
  );
}