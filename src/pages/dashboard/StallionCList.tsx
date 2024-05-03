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
  TableSortLabel 
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useStallionsQuery } from 'src/redux/splitEndpoints/stallionsSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// @types
import { Stallion } from '../../@types/stallion';
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
  StallionListTableRow
} from '../../sections/@dashboard/stallion/list';
import StallionFilterSidebar from '../../sections/@dashboard/stallion/filters/StallionFilterSidebar';
import StallionNewEditModal from 'src/sections/@dashboard/stallion/StallionNewEditModal';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { Spinner } from 'src/components/Spinner';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: 'Stallion', align: 'left' },
    { id: 'countryName', label: 'Country', align: 'left' },
    { id: 'farmName', label: 'Farm', align: 'left' },
    { id: 'serviceFee', label: 'Service Fee', align: 'left' },
    { id: 'lastUpdated', label: 'Last Updated', align: 'left' },
    { id: 'promoted', label: 'Promoted', align: 'center', icon: `icon-Info-circle`},
    { id: 'status', label: 'Active', align: 'center' },
    { id: 'action', label: '', align: 'left', icon:`icon-Share` },
  ];

// ----------------------------------------------------------------------

export default function StallionCList() {
  
  
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
  };
  
  const data = useStallionsQuery(isFilterApplied ? getFilters : newState);   
  // console.log('stallion list data', data);
  const stallionList = data?.data?.data ? data?.data?.data : [];
  
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
  
  //console.log('stallion list pop', stallionListProps);
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

  //const denseHeight = dense ? 60 : 80;

  //const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

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
      <StallionFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} rowCount={data?.data?.meta?.itemCount} page={page} limit={limit} />     
      <Container maxWidth={themeStretch ? false : 'lg'} >
      { data?.isLoading ?
     <Box className='Spinner-Wrp'>  <Spinner /></Box> : 
     (stallionListProps?.result?.length > 1) ?
      <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          <Scrollbar>
          <TableContainer className='datalist' sx={{ minWidth: 800 }}>
          <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
            <TableHead>
              <TableRow>
                <TableCell align="left">
                <TableSortLabel
                    active={true}
                    direction={"asc"}
                  >
                    Stallion
                  </TableSortLabel>
                  
                </TableCell>
                <TableCell align="left">Country</TableCell>
                <TableCell align="left">Farm</TableCell>
                <TableCell align="left">Service Fee</TableCell>
                <TableCell align="left">Last Updated</TableCell>
                <TableCell align="left">Promoted<i className={'icon-Info-circle tooltip-table'} onMouseOver={handleClick} onMouseOut={hidePopover} /></TableCell>
                <TableCell align="left">Active</TableCell>
                <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
              </TableRow>
            </TableHead>
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
      <StallionNewEditModal open={open} rowId={rowId} isEdit={isEdit}  handleEditPopup={handleEditPopup} handleCloseEditState={handleCloseEditState} />  
      }
    </Page>
    <div className='tooltipPopover'>
    <Popper className='tooltipPopover' id={id} open={openPopper} anchorEl={anchorEl} transition placement='auto-end'>
    {({ TransitionProps }) => (
      <Fade {...TransitionProps} timeout={350}>
        <Box className='tooltipPopoverBody'>
          <p><i className='icon-Confirmed-24px'></i> Valid Promotion</p>
          <p><i className='icon-Incorrect'></i> Recently Expired</p>
          <p><i className='icon-NonPromoted'></i> Not Promoted</p>
        </Box>
      </Fade>
    )}
  </Popper>
  </div>
    </StyledEngineProvider>
  );
}