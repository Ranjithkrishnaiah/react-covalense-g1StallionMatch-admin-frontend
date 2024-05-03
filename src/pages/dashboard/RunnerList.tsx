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
  RunnerListTableRow,
  RunnerTableRow,
  RunnerTableToolbar,
} from 'src/sections/@dashboard/runner/list';

import { reset } from 'numeral';
import { Spinner } from 'src/components/Spinner';
import RunnerFilterSidebar from 'src/sections/@dashboard/runner/filter/RunnerFilterSidebar';
import RunnerEditModal from 'src/sections/@dashboard/runner/RunnerEditModal';
import { useFarmsQuery } from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { useRunnersQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import RunnerNewEditModal from 'src/sections/@dashboard/runner/RunnerNewEditModal';
// ----------------------------------------------------------------------
export default function RunnerList() {
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

  const data = useRunnersQuery(isFilterApplied ? getFilters : newState);   
  const runnerList = data?.data ? data?.data : [];

  // console.log(data,)
  
  const runnerListProps = {
    page : (page == 0) ? 1 : page,
    setPage,
    result: data?.data,
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

  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  }

  return (
    <StyledEngineProvider injectFirst> 
    <Page title="Runner List" sx={{display: 'flex'}}>
      <RunnerFilterSidebar handleFilter={handleFilter} handleFilterApplied={handleFilterApplied} handleRemoveFilterApplied={handleRemoveFilterApplied}  rowCount={data?.data?.meta?.itemCount} page={page} limit={limit}  />
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
      { data?.isLoading ?
     <Box className='Spinner-Wrp'>  <Spinner /></Box> : 
     (runnerListProps?.result?.length) ?
        <Card sx={{boxShadow: 'none', background:'#faf8f7'}}>
          <Scrollbar>
            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
            <Table sx={{borderCollapse: 'separate', borderSpacing : '0 4px', background: '#FAF8F7'}}>
              <TableHead>
                <TableRow>    
                  <TableCell align="left">Date
                  {/* <i className={'icon-Info-circle tooltip-table'} onMouseOver={handleClick} onMouseOut={hidePopover} /> */}
                  </TableCell>
                  <TableCell align="left">Venue</TableCell>
                  <TableCell align="left">Race #</TableCell>
                  <TableCell align="left">Class</TableCell>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="left">Sire</TableCell>
                  <TableCell align="left">Dam</TableCell>
                  <TableCell align="left">Position</TableCell>
                  <TableCell align="left">Imported</TableCell>
                  <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runnerList.map((row:any, index:number) => (
                  <RunnerListTableRow
                    key={row.id}
                    row={row}
                    selected={row.id}
                    onSelectRow={row.id}
                    onEditPopup={() => handleEditPopup()}
                    onSetRowId={() => setRowId(row.id)}
                    handleEditState={() => handleEditState()}                
                    />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Scrollbar>

          <Box className='Pagination-wrapper'>
            <PaginationSettings data={runnerListProps} />
            <PaginationLimit data={runnerListProps}/>
          </Box>
        </Card>
        :
        <NoDataComponent clearAll={handleRemoveFilterApplied}/>
        }
      </Container>
       <RunnerNewEditModal open={open} rowId={rowId} isEdit={isEdit}  handleEditPopup={handleEditPopup} handleCloseEditState={handleCloseEditState} />        
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