import React from 'react';
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
  styled,
  TableSortLabel
} from '@mui/material';
import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils'

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
  RaceListTableRow,
  RaceTableRow,
  RaceTableToolbar,
} from 'src/sections/@dashboard/race/list';

import { reset } from 'numeral';
import { Spinner } from 'src/components/Spinner';
import RaceFilterSidebar from 'src/sections/@dashboard/race/filter/RaceFilterSidebar';
import RaceEditModal from 'src/sections/@dashboard/race/RaceEditModal';
import { useFarmsQuery } from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { useRaceClassQuery, useRacesQuery, useRaceStakeQuery, useRaceStatusQuery, useRaceTrackConditionQuery, useRaceTrackTypeQuery, useRaceTypeQuery, useRaceVenueQuery } from 'src/redux/splitEndpoints/raceSplit';
import RaceNewEditModal from 'src/sections/@dashboard/race/RaceNewEditModal';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// ----------------------------------------------------------------------
export default function RaceList() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Member[]>([]);
  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('raceId');
  const [isIncludedFeeActive, setIsIncludedFeeActive] = useState(false);

  const handleFilter = (value: any) => {
    // console.log(value, 'VALUE')
    setGetFilters(value);
  }

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
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

  const data = useRacesQuery(isFilterApplied ? getFilters : newState);
  const raceList = data?.data?.data ? data?.data?.data : [];
  const raceListProps = {
    page: (page == 0) ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit
  };
  // console.log(data, raceList, raceListProps, 'RaceList')
  const { data: countriesList } = useCountriesQuery();
  const [state, setStateValue] = useState({
    page: page,
    limit: limit,
    sortBy: orderBy,
    order: order,
    displayName: '',
    date: null,
    country: 'none',
    class: 'none',
    venue: '',
    trackType: 'none',
    trackCondition: 'none',
    status: 'none',
    racetype: 'none',
    distanceRange: '',
    fieldSize: '',
    isDisplayNameExactSearch: true,
    includeEmptyField: false,
    isEligible: 'none',
  });

  // console.log(venulist, trackCondition, trackType, raceType)

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

  const handleEditPopup = () => {
    setOpen(!open);
  }

  const handleEditState = () => {
    setEdit(true);
  }

  const handleCloseEditState = () => {
    setEdit(!isEdit);
  }
  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: any) => {
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

  const headCells = [
    {
      id: 'raceDate',
      numeric: false,
      disablePadding: true,
      label: 'Race Date',
      disabled: false
    },
    {
      id: 'raceId',
      numeric: false,
      disablePadding: true,
      label: 'Race #id',
      disabled: true
    },
    {
      id: 'venue',
      numeric: false,
      disablePadding: true,
      label: 'Venue',
      disabled: false
    },
    {
      id: 'country',
      numeric: false,
      disablePadding: true,
      label: 'Country',
      disabled: false
    },
    {
      id: 'displayName',
      numeric: false,
      disablePadding: true,
      label: 'Name',
      disabled: false
    },
    {
      id: 'class',
      numeric: false,
      disablePadding: true,
      label: 'Class',
      disabled: false
    },
    {
      id: 'trackType',
      numeric: false,
      disablePadding: true,
      label: 'Track Type',
      disabled: false
    },
    {
      id: 'racestatus',
      numeric: false,
      disablePadding: true,
      label: 'Race Status',
      disabled: false
    },
    {
      id: 'runners',
      numeric: false,
      disablePadding: true,
      label: 'Runners',
      disabled: true
    },
    {
      id: 'isEligible',
      numeric: false,
      disablePadding: true,
      label: 'Eligible',
      disabled: true
    },

  ]

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
              align="center"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'ASC'}
                onClick={createSortHandler(headCell.id)}
                disabled={headCell.disabled}
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
                    {/* <HtmlTooltip
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
                    </HtmlTooltip> */}
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

  const handleRequestSort = (event: any, property: any) => {
    // console.log(property, 'PROPERTY')
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
  }

  return (
    <StyledEngineProvider injectFirst>
      <Page title="Race List" sx={{ display: 'flex' }}>
        <RaceFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          rowCount={data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          state={state}
          setStateValue={setStateValue}
          isSearchClicked={isSearchClicked}
          setIsSearchClicked={setIsSearchClicked}
          setPage={setPage}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          order={order}
          setIsIncludedFeeActive={setIsIncludedFeeActive}
          isIncludedFeeActive={isIncludedFeeActive}
        />
        <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
          {data?.isLoading ?
            <Box className='Spinner-Wrp'>  <Spinner /></Box> :
            (raceListProps?.result?.length) ?
              <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                <Scrollbar>
                  <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                    <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                      {/* <TableHead>
                        <TableRow>
                          <TableCell align="left">Race ID<i className={'icon-Info-circle tooltip-table'} onMouseOver={handleClick} onMouseOut={hidePopover} /></TableCell>
                          <TableCell align="left">Race #</TableCell>
                          <TableCell align="left">Venue</TableCell>
                          <TableCell align="left">Country</TableCell>
                          <TableCell align="left">Name</TableCell>
                          <TableCell align="left">Class</TableCell>
                          <TableCell align="left">Track Type</TableCell>
                          <TableCell align="left">API Status</TableCell>
                          <TableCell align="left">Runners</TableCell>
                          <TableCell align="left">Imported</TableCell>
                          <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
                        </TableRow>
                      </TableHead> */}
                      <EnhancedTableHead
                        numSelected={selected.length}
                        order={order}
                        orderBy={orderBy}
                        //onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={raceList.length}
                      />
                      <TableBody>
                        {raceList.map((row: any, index: number) => (
                          <RaceListTableRow
                            key={row.raceUuid}
                            row={row}
                            selected={row.raceUuid}
                            onSelectRow={row.raceUuid}
                            onEditPopup={() => handleEditPopup()}
                            onSetRowId={() => setRowId(row.raceUuid)}
                            handleEditState={() => handleEditState()}
                            countriesList={countriesList}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <Box className='Pagination-wrapper'>
                  <PaginationSettings data={raceListProps} />
                  <PaginationLimit data={raceListProps} />
                </Box>
              </Card>
              :
              <NoDataComponent clearAll={handleRemoveFilterApplied}/>
          }
        </Container>
        <RaceNewEditModal
          open={open}
          rowId={rowId}
          isEdit={isEdit}
          handleEditPopup={handleEditPopup}
          handleCloseEditState={handleCloseEditState}
        />
      </Page>
      <div className='tooltipPopover'>
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
      </div>
    </StyledEngineProvider>
  );
}