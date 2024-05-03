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
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  StyledEngineProvider,
  Fade,
  Popper,
} from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useMembersQuery } from 'src/redux/splitEndpoints/memberSplit'
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
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
} from 'src/components/table';
// sections
import {
    ReportsListTableRow,
//   RaceTableRow,
//   RaceTableToolbar,
} from 'src/sections/@dashboard/reports/list';

import { reset } from 'numeral';
import { Spinner } from 'src/components/Spinner';
import ReportsFilterSidebar from 'src/sections/@dashboard/reports/filter/ReportsFilterSidebar';
import ViewDetailsModal from 'src/sections/@dashboard/reports/ViewDetailsModal';
import { useFarmsQuery } from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
// ----------------------------------------------------------------------
export default function ReportsList() {
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
  };

  const data = useFarmsQuery(isFilterApplied ? getFilters : newState);   
  const ReportsList = data?.data?.data ? data?.data?.data : [];
  
  const ReportsListProps = {
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

  return (
    <StyledEngineProvider injectFirst> 
    <Page title="Reports  List" sx={{display: 'flex'}} className='ReportListTable'>
      <ReportsFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied}  rowCount={data?.data?.meta?.itemCount} page={page} limit={limit}  />
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
      { data?.isLoading ?
     <Box className='Spinner-Wrp'>  <Spinner /></Box> : 
     (ReportsListProps?.result?.length > 1) ?
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          <Scrollbar>
            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
            <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
              <TableHead className='reportsTableHead'>
                <TableRow>    
                  <TableCell align="left">Order ID</TableCell>
                  <TableCell align="left">Date</TableCell>
                  <TableCell align="left">Client Name</TableCell>
                  <TableCell align="left">Email</TableCell>
                  <TableCell align="left">Report</TableCell>
                  <TableCell align="left">Country</TableCell>
                  <TableCell align="left">Paid</TableCell>
                  <TableCell align="left">Status</TableCell>
                  <TableCell align="left">PDF</TableCell>
                  <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ReportsList.map((row:any, index:number) => (
                  <ReportsListTableRow
                    key={row.farmId}
                    row={row}
                    selected={row.farmId}
                    onSelectRow={row.farmId}
                    onEditPopup={() => handleEditPopup()}
                    onSetRowId={() => setRowId(row.farmId)}
                    handleEditState={() => handleEditState()}                
                    />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Scrollbar>

          <Box className='Pagination-wrapper'>
            <PaginationSettings data={ReportsListProps} />
            <PaginationLimit data={ReportsListProps}/>
          </Box>
        </Card>
        :
        <NoDataComponent />
        }
      </Container>
       <ViewDetailsModal open={open} rowId={rowId} isEdit={isEdit}  handleEditPopup={handleEditPopup} handleCloseEditState={handleCloseEditState} />        
    </Page>
    {/* <div className='tooltipPopover'>
      <Popper className='tooltipPopover' id={id} open={openPopper} anchorEl={anchorEl} transition placement='auto-end'>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Box className='tooltipPopoverBody HorseDetailsPopover'>
            <p><i className='popover-circle red'></i> Requires Verification</p>
            <p><i className='popover-circle black'></i> Verified & Complete</p>
          </Box>
        </Fade>
      )}
    </Popper>
    </div> */}
    </StyledEngineProvider>
  );
}