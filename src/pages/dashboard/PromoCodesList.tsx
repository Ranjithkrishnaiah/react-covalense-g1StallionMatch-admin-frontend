import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  TableContainer,
  StyledEngineProvider,
} from '@mui/material';
import CsvLink from 'react-csv-export';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { visuallyHidden } from '@mui/utils';
// redux
import { useDispatch } from 'react-redux';
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { Farm } from '../../@types/farm';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { PromoCodesListTableRow } from 'src/sections/@dashboard/products/list';
import { Spinner } from 'src/components/Spinner';
import ProductsFilterSidebar from 'src/sections/@dashboard/products/filter/ProductFilterSidebar';
import PromoCodesEditModal from 'src/sections/@dashboard/products/PromoCodesEditModal';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import {
  usePromoCodesQuery,
  useSharePromocodeListQuery,
} from 'src/redux/splitEndpoints/promoCodeSplit';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { parseDateAsDotFormat, toPascalCase } from 'src/utils/customFunctions';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { TableSortLabel } from '@mui/material';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
// ----------------------------------------------------------------------
export default function PromoCodesList() {

  const pageId = process.env.REACT_APP_PROMOCODE_PAGE_ID;
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Farm[]>([]);
  // react states
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState('createdOn');
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const [openHeader, setOpenHeader] = useState(false);
  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [order, setOrder] = useState('DESC');
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const { data: currenciesList } = useCurrenciesQuery();
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [productModuleAccess, setProductModuleAccess] = useState({
    search_product_promocode: false,
    search_product_promocode_export: false,
  });
  const [valuesExist, setValuesExist] = useState<any>({});

  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const { data: promocodeSettings, isFetching: isPromocodeSettingFetching, isLoading: isPromocodeSettingLoading, isSuccess: isPromocodeSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
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
    if (valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY')) {
      setUserModuleAccess(true);
    }
    setProductModuleAccess({
      ...productModuleAccess,
      search_product_promocode: !valuesExist?.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_SEARCH_VIEW_READONLY') ? false : true,
      search_product_promocode_export: !valuesExist?.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_SEARCH_EXPORT_FUNCTION') ? false : true,
    });
  }, [valuesExist]);

  // Check the Promocode page settings
  useEffect(() => {
    if (isPromocodeSettingSuccess) {
      setOrderBy(promocodeSettings?.settingsResponse?.defaultDisplay);
    }
    // if (isSearchClicked) {
    setGetFilters(
      {
        ...getFilters,
        sortBy: promocodeSettings?.settingsResponse?.defaultDisplay
      }
    );
    // }
  }, [promocodeSettings]);

  // filter handler
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  // filter applied handler
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
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

  // API call to get promocodes lists
  const data = usePromoCodesQuery(isFilterApplied ? getFilters : newState);
  const statusCode = data?.status;
  const PromoCodesList = data?.data?.data ? data?.data?.data : [];

  // share download handler
  const downloadData: any = useSharePromocodeListQuery({});
  const [csvShareData, setCsvShareData] = useState<any>([]);
  useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let { createdOn, endDate, startDate } = item;
      tempArr.push({
        ...item,
        createdOn: createdOn ? parseDateAsDotFormat(createdOn) : '--',
        endDate: endDate ? parseDateAsDotFormat(endDate) : '--',
        startDate: startDate ? parseDateAsDotFormat(startDate) : '--',
      });
    });
    setCsvShareData(tempArr);
  }, [downloadData?.data]);

  // Promo Codes List Props
  const PromoCodesListProps = {
    page: page == 0 ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
  };

  const [editId, setEditId] = useState('');
  const [openAddEditForm, setOpenAddEditForm] = useState(false);
  // open drawer handler
  const handleDrawerOpenRow = (stallionId: string) => {
    setOpenAddEditForm(true);
  };
  // close drawer handler
  const handleDrawerCloseRow = () => {
    setOpenAddEditForm(false);
  };
  // edit popup handler
  const handleEditPopup = () => {
    setOpen(!open);
  };
  const handleEditState = () => {
    setEdit(true);
  };
  const handleCloseEditState = () => {
    setEdit(!isEdit);
  };

  // table head cells
  const headCells = [
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'ID',
      disabled: false,
    },
    {
      id: 'promoCodeName',
      numeric: false,
      disablePadding: true,
      label: 'Name',
      disabled: false,
    },
    {
      id: 'promoCode',
      numeric: false,
      disablePadding: true,
      label: 'Code',
      disabled: false,
    },
    {
      id: 'price',
      numeric: false,
      disablePadding: true,
      label: 'Terms',
      disabled: false,
    },
    {
      id: 'redemtions',
      numeric: false,
      disablePadding: true,
      label: 'Redemptions',
      disabled: false,
    },
    {
      id: 'createdOn',
      numeric: false,
      disablePadding: true,
      label: 'Created',
      disabled: false,
    },
    {
      id: 'endDate',
      numeric: false,
      disablePadding: true,
      label: 'Expires',
      disabled: false,
    },
    {
      id: 'isActive',
      numeric: false,
      disablePadding: true,
      label: 'Active',
      disabled: false,
    },
  ];

  // Enhanced TableHead function
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;

    // sort create handler
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      // table head section
      <TableHead className="runnerTableHead">
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                IconComponent={
                  order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon
                }
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
                {headCell.label === 'Name' ? <Box className="tooltipPopoverbox"></Box> : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell
            align="left"
            className={`icon-share-wrapper ${(downloadData?.isFetching || productModuleAccess.search_product_promocode_export === false) ? 'disabled-icon' : ''}`}
          >
            <CsvLink data={csvShareData} fileName={`Promocode_Data (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  // menu handlers
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setOpenPopper((previousOpen) => !previousOpen);
  };
  const canBeOpen = openPopper && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const hidePopover = () => {
    setOpenPopper(false);
  };
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  // menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // pagination limit handler
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...{ page: page },
      ...{ limit: pageLimit },
      ...{ order: order },
    };
    handleFilter(datafltr);
    data?.refetch();
  };

  // pagination handler
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...{ page: pageNum },
      ...{ limit: limit },
      ...{ order: order },
    };
    handleFilter(datafltr);
    data?.refetch();
  };

  // table sort handler
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: isAsc ? 'DESC' : 'ASC' },
      ...{ sortBy: property },
    };
    handleFilter(datafltr);
    data?.refetch();
  };

  return (
    <StyledEngineProvider injectFirst>
      {/*  header section */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      <Page title="Promo Codes List" sx={{ display: 'flex' }}>
        {/* Products filter section */}
        <ProductsFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          rowCount={data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          productModuleAccess={productModuleAccess}
        />
        {statusCode === 'rejected' ? (
          <UnAuthorized />
        ) : (
          <>
            <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
              {/* toast message */}
              {apiStatus && (
                <CustomToasterMessage
                  apiStatus={true}
                  setApiStatus={setApiStatus}
                  apiStatusMsg={apiStatusMsg}
                  setApiStatusMsg={setApiStatusMsg}
                />
              )}
              {data?.isFetching ? (
                <Box className="Spinner-Wrp">
                  {' '}
                  <Spinner />
                </Box>
              ) : PromoCodesListProps?.result?.length > 0 ? (
                <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                  <Scrollbar>
                    {/* table head section */}
                    <TableContainer className="productsList datalist" sx={{ minWidth: 800 }}>
                      <Table
                        sx={{
                          borderCollapse: 'separate',
                          borderSpacing: '0 4px',
                          background: '#FAF8F7',
                        }}
                      >
                        <EnhancedTableHead
                          numSelected={selected.length}
                          order={order}
                          orderBy={orderBy}
                          onRequestSort={handleRequestSort}
                          rowCount={PromoCodesList.length}
                        />
                        {/* PromoCodes lists */}
                        <TableBody>
                          {PromoCodesList.map((row: any, index: number) => (
                            <PromoCodesListTableRow
                              key={row.promoCode + row.id}
                              row={row}
                              selected={row.promoCode}
                              onSelectRow={row.promoCode}
                              onEditPopup={() => handleEditPopup()}
                              onSetRowId={() => setRowId(row.promoCode)}
                              handleEditState={() => handleEditState()}
                              currenciesList={currenciesList}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>

                  {/* pagination section */}
                  <Box className="Pagination-wrapper">
                    <PaginationSettings
                      data={PromoCodesListProps}
                      handleRequestPagination={handleRequestPagination}
                      limit={limit}
                      setLimit={setLimit}
                    />
                    <PaginationLimit
                      data={PromoCodesListProps}
                      handleRequestPaginationLimit={handleRequestPaginationLimit}
                      limit={limit}
                      setLimit={setLimit}
                    />
                  </Box>
                </Card>
              ) : (
                <NoDataComponent />
              )}
            </Container>

            {/* PromoCodes Edit Modal */}
            <PromoCodesEditModal
              open={open}
              rowId={rowId}
              isEdit={isEdit}
              handleEditPopup={handleEditPopup}
              handleCloseEditState={handleCloseEditState}
              apiStatus={true}
              setApiStatus={setApiStatus}
              apiStatusMsg={apiStatusMsg}
              setApiStatusMsg={setApiStatusMsg}
            />
          </>
        )}
      </Page>
    </StyledEngineProvider>
  );
}
