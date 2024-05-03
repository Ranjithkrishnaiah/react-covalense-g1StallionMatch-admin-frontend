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
  TableSortLabel,
  styled
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useMembersQuery } from 'src/redux/splitEndpoints/memberSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
//import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
import { Member } from '../../@types/member';
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
  MemberTableRow,
  MemberTableToolbar,
  MemberListTableRow
} from '../../sections/@dashboard/member/list';
import MembersEditModal from 'src/sections/@dashboard/member/MembersEditModal';
import { reset } from 'numeral';
import MembersFilterSidebar from 'src/sections/@dashboard/member/filter/MembersFilterSidebar';
import { Spinner } from 'src/components/Spinner';
import Alert from '@mui/material/Alert';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
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
    id: 'fullName',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'emailAddress',
    numeric: false,
    disablePadding: true,
    label: 'Email',
  },  
  {
    id: 'countryCode',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'memberSince',
    numeric: false,
    disablePadding: true,
    label: 'Member Since',
  },
  {
    id: 'lastActive',
    numeric: false,
    disablePadding: true,
    label: 'Last Active',
  },
  {
    id: 'roleName',
    numeric: false,
    disablePadding: true,
    label: 'Permission',
  },
  {
    id: 'isVerified',
    numeric: false,
    disablePadding: true,
    label: 'Verified',
  },
]

export default function MemberList() {
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('memberSince');

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
      <TableHead className='memberTableHead'>
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
                {headCell.label === 'Name' ? 
                <Box className='tooltipPopoverbox'>
                  {/* <i className={'icon-Info-circle tooltip-table'} onMouseOver={handleClick} onMouseOut={hidePopover} /> */}


                  <HtmlTooltip
                className="tableTooltip"
                title={
                  <React.Fragment>
                    <Box className='tooltipPopoverBody HorseDetailsPopover'>
                      <p><i className='popover-circle yellow'></i> Suspended</p>
                      <p><i className='popover-circle red'></i> Closed</p>
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
  const [tableData, setTableData] = useState<Member[]>([]);
  
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit,setEdit] = useState(false);
  const [rowId,setRowId] = useState("");
  
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

  const data = useMembersQuery(isFilterApplied ? getFilters : newState);   
  const memberList = data?.data?.data ? data?.data?.data : [];
  
  const memberListProps = {
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

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
  }
  
  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = memberList.map((n: any) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  return (
    <StyledEngineProvider injectFirst>
    <Page title="Member List" sx={{display: 'flex'}}>
      <MembersFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied}  rowCount={tableData.length}  />
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
        <Stack sx={{ width: '100%' }} spacing={2} className='AlertMessage'>
          {/* Success Alert */}
          <Alert sx={{background: '#2EFFB4', color:'#1D472E'}} icon={false} onClose={() => {}}><b>Member successfully invited!</b> Member has 48hrs to accept otherwise invitation will expire. Please check <a href="#">Notifications</a> for updates.</Alert>       
          {/* Error Alert */}
          {/* <Alert sx={{background: '#C75227', color:'#fff'}} icon={false} onClose={() => {}}><b>Farm could not be merged!</b>  Please contact Administrator for more information.</Alert> */}
        </Stack>
        { data?.isLoading ?
        <Box className='Spinner-Wrp'>  <Spinner /></Box> : 
        (memberListProps?.result?.length > 0) ?
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
                rowCount={memberList.length}
              />
              <TableBody>
                {memberList.map((row:any, index:number) => (
                  <MemberListTableRow
                  key={row.memberUuid}
                  row={row}
                  selected={row.memberUuid}
                  onSelectRow={row.memberUuid}
                  onEditPopup ={()=> handleEditPopup()}
                  onSetRowId ={() => setRowId(row.memberUuid)}
                  handleEditState={() => handleEditState()}
                  apiStatus={true} 
                  setApiStatus={setApiStatus} 
                  apiStatusMsg={apiStatusMsg} 
                  setApiStatusMsg={setApiStatusMsg}                         
                  />  
                ))}
              </TableBody>
            </Table>
          </TableContainer> 
          </Scrollbar>
          <Box className='Pagination-wrapper'>
            <PaginationSettings data={memberListProps} />
            <PaginationLimit data={memberListProps} />
          </Box>
        </Card>
        :
        <NoDataComponent />
        }
      </Container>
       <MembersEditModal open={open} rowId={rowId} isEdit={isEdit}  handleEditPopup={handleEditPopup} handleCloseEditState={handleCloseEditState} />        
    </Page>
    </StyledEngineProvider>
  );
}