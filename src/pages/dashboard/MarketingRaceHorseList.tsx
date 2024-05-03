import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableSortLabel,
  Container,
  StyledEngineProvider,
  styled
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// hooks
import useSettings from 'src/hooks/useSettings';
// @types
import { Member } from 'src/@types/member';
// components
import Page from 'src/components/Page';
import Scrollbar from 'src/components/Scrollbar';
// sections
import {
  MarketingRaceHorseListTableRow,
} from 'src/sections/@dashboard/marketing/racehorse/list';
import { Spinner } from 'src/components/Spinner';
import { useRaceHorsesQuery, useDownloadRaceHorseExcelFileQuery } from 'src/redux/splitEndpoints/raceHorseSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import 'src/sections/@dashboard/marketing/marketing.css';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { LoadingButton } from '@mui/lab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------
export default function MarketingRaceHorseList() {
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [marketingModuleAccess, setMarketingModuleAccess] = useState({
    marketing_viewonly: false,
    marketing_update: false,
  });

  // Check permission to access the member module
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
    if (valuesExist.hasOwnProperty('MARKETING_RACEHORSE_PAGE')) {
      setUserModuleAccess(true);
    }
    setMarketingModuleAccess({
      ...marketingModuleAccess,
      marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_RACEHORSE_PAGE') ? false : true,
      marketing_update: !valuesExist?.hasOwnProperty('MARKETING_RACEHORSE_PAGE') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const navigate = useNavigate();
  const [tableData, setTableData] = useState<Member[]>([]);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('maindate');
  // Race horse table column names
  const headCells = [
    {
      id: 'maindate',
      numeric: false,
      disablePadding: true,
      label: 'Date',
      disabled: false
    },
    {
      id: 'horsename',
      numeric: false,
      disablePadding: true,
      label: 'Horse Name',
      disabled: false
    },
    {
      id: 'yob',
      numeric: true,
      disablePadding: true,
      label: 'YOB',
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
      id: 'sire',
      numeric: false,
      disablePadding: true,
      label: 'Sire',
      disabled: false
    },
    {
      id: 'dam',
      numeric: false,
      disablePadding: true,
      label: 'Dam',
      disabled: false
    },
    {
      id: 'createddate',
      numeric: false,
      disablePadding: true,
      label: 'Created Date',
      disabled: false
    },
    {
      id: 'link',
      numeric: false,
      disablePadding: true,
      label: 'Link',
      disabled: true
    },
    {
      id: 'active',
      numeric: false,
      disablePadding: true,
      label: 'Active',
      disabled: false
    },
  ];

  // Render race title with Ascending and dscending functionality
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
      <TableHead className='raceTableHead'>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              size="small"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon}
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
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="center" className='icon-share-wrapper copiedIcon'>
            <LoadingButton type="button" loading={isSubmitLoading} onClick={downloadRaceHorseList} >
              <i className={'icon-Share'} />
            </LoadingButton>
          </TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  }

  const [pageCount, setPageCount] = useState(1);
  const [clear, setClear] = useState<any>(false);
  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    setPage(0);
  };
  let newState = {
    order: order,
    page: page,
    limit: limit,
    orderColumn: orderBy
  };
  const data = useRaceHorsesQuery(newState);
  const raceHorseList = data?.data?.data ? data?.data?.data : [];

  const raceHorseListProps = {
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

  useEffect(() => {
    setTableData(data?.data?.data || tableData)
  }, [data])

  // Handle sorting
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC'
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);

    const datafltr = {
      ...getFilters,
      ...({ page: page }),
      ...({ limit: limit }),
      ...({ order: isAsc ? 'DESC' : 'ASC' }),
      ...({ sortBy: property }),
    }
    handleFilter(datafltr)
    data?.refetch();
  };

  //Gets the data based on pagination count 
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: pageNum },
      ...{ limit: limit },
    };
    handleFilter(datafltr);
  };
  //Gets the data based on pagination Limit 
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: page },
      ...{ limit: pageLimit },
    };
    handleFilter(datafltr);
  };

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

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.horsedetails.edit(id));
  };

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);

  // Download race horse list api call
  const { data: csvDownloadData, isFetching: isCsvDownloadFetching, isLoading: isCsvDownloadLoading, isSuccess: isCsvDownloadSuccess } = useDownloadRaceHorseExcelFileQuery({ setupId: 'RaceHorseList', name: 'raceHorse' }, { skip: (!isCsvDownloadDownload) });

  // Once user clicks on share, generate the api call
  const downloadRaceHorseList = (kpiType: any) => {
    setIsSubmitLoading(true);
    setIsCsvDownloadDownload(true);
  };

  // Once download is done, reset the state variable
  useEffect(() => {
    if (isCsvDownloadSuccess) {
      setIsSubmitLoading(false);
      setIsCsvDownloadDownload(false);
    }
  }, [isCsvDownloadFetching]);



  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';


  return (
    <StyledEngineProvider injectFirst>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title="RaceHorse Page" sx={{ display: 'flex' }} className='HomepageData'>
        <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
            {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
              <UnAuthorized />
            ) :
              (data?.isFetching) ?
                <Box className='Spinner-Wrp'>  <Spinner /></Box> :
                (data.isSuccess && raceHorseListProps?.result?.length > 0) ?
                  <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                    <Scrollbar>
                      <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                          <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={raceHorseList.length}
                          />
                          <TableBody>
                            {raceHorseList.map((row: any, index: number) => (
                              <MarketingRaceHorseListTableRow
                                key={row.horseId}
                                row={row}
                                selected={row.horseId}
                                onSelectRow={row.horseId}
                                onEditPopup={() => handleEditPopup()}
                                onSetRowId={() => setRowId(row.horseId)}
                                handleEditState={() => handleEditState()}
                                onEditRow={() => handleEditRow(row.horseId)}
                                apiStatus={true} setApiStatus={setApiStatus}
                                apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg}
                                marketingModuleAccess={marketingModuleAccess}
                                setMarketingModuleAccess={setMarketingModuleAccess}
                                clickedPopover={clickedPopover}
                                setClickedPopover={setClickedPopover}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Scrollbar>

                    <Box className='Pagination-wrapper'>
                      <PaginationSettings data={raceHorseListProps}
                        handleRequestPagination={handleRequestPagination}
                        limit={limit}
                        setLimit={setLimit}
                      />
                      <PaginationLimit data={raceHorseListProps}
                        handleRequestPaginationLimit={handleRequestPaginationLimit}
                        limit={limit}
                        setLimit={setLimit}
                      />
                    </Box>
                  </Card>
                  :
                  <NoDataComponent />
            }
          </Container>
        </Box>
        {clickedPopover &&
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
        }
      </Page>
    </StyledEngineProvider>
  );
}