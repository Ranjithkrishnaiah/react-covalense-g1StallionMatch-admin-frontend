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
import { Member } from '../../@types/member';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { ProductsListTableRow } from 'src/sections/@dashboard/products/list';
import { Spinner } from 'src/components/Spinner';
import ProductsFilterSidebar from 'src/sections/@dashboard/products/filter/ProductFilterSidebar';
import ProductsEditModal from 'src/sections/@dashboard/products/ProductsEditModal';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { useProductsQuery } from 'src/redux/splitEndpoints/productSplit';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DashboardHeader from 'src/layouts/dashboard/header';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import { TableSortLabel } from '@mui/material';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
// ----------------------------------------------------------------------
export default function ProductsList() {

  const pageId = process.env.REACT_APP_PRODUCT_PAGE_ID;
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Member[]>([]);
  // react states
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');
  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('ASC');
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [productModuleAccess, setProductModuleAccess] = useState({
    search_product_promocode: false,
    search_product_promocode_export: false,
  });
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('id');

  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const { data: productSettings, isFetching: isProductSettingFetching, isLoading: isProductSettingLoading, isSuccess: isProductSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });

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

  // Check the Product page settings
  useEffect(() => {
    if (isProductSettingSuccess) {
      setOrderBy(productSettings?.settingsResponse?.defaultDisplay);
    }
    // if (isSearchClicked) {
    setGetFilters(
      {
        ...getFilters,
        sortBy: productSettings?.settingsResponse?.defaultDisplay
      }
    );
    // }
  }, [productSettings]);

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

  // API call to get products lists
  const data = useProductsQuery(isFilterApplied ? getFilters : newState);
  const statusCode = data?.status;
  const ProductsList = data?.data?.data ? data?.data?.data : [];

  // share download handler
  const [csvShareData, setCsvShareData] = useState<any>([]);
  useEffect(() => {
    let tempArr: any = [];
    ProductsList?.forEach((item: any) => {
      let { created, updated, productName, categoryName, MRR } = item;
      tempArr.push({
        productName,
        categoryName,
        MRR,
        created: created ? parseDateAsDotFormat(created) : '--',
        updated: updated ? parseDateAsDotFormat(updated) : '--',
      });
    });
    setCsvShareData(tempArr);
  }, [data?.data]);

  // Products List Props
  const ProductsListProps = {
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

  useEffect(() => {
    setTableData(data?.data || tableData);
  }, [data]);

  const [editId, setEditId] = useState('');
  const [openAddEditForm, setOpenAddEditForm] = useState(false);
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});

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
      id: 'productName',
      numeric: false,
      disablePadding: true,
      label: 'Name',
      disabled: false,
    },
    {
      id: 'categoryName',
      numeric: false,
      disablePadding: true,
      label: 'Category',
      disabled: false,
    },
    {
      id: 'MRR',
      numeric: false,
      disablePadding: true,
      label: 'MRR',
      disabled: false,
    },
    {
      id: 'created',
      numeric: false,
      disablePadding: true,
      label: 'Created',
      disabled: false,
    },
    {
      id: 'updated',
      numeric: false,
      disablePadding: true,
      label: 'Updated',
      disabled: false,
    },
    {
      id: 'Active',
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
            className={`icon-share-wrapper ${(data?.isFetching || productModuleAccess.search_product_promocode_export === false) ? 'disabled-icon' : ''}`}
          >
            <CsvLink data={csvShareData} fileName={`Products_Data (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

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
  };

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  // menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();

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
      <Page title="Products List" sx={{ display: 'flex' }}>
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
              ) : ProductsListProps?.result?.length > 1 ? (
                <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                  {/* table head section */}
                  <Scrollbar>
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
                          rowCount={ProductsList.length}
                        />
                        {/* products lists */}
                        <TableBody>
                          {ProductsList.map((row: any, index: number) => (
                            <ProductsListTableRow
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

                  {/* pagination section */}
                  <Box className="Pagination-wrapper">
                    <PaginationSettings
                      data={ProductsListProps}
                      handleRequestPagination={handleRequestPagination}
                      limit={limit}
                      setLimit={setLimit}
                    />
                    <PaginationLimit
                      data={ProductsListProps}
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

            {/* Products Edit Modal */}
            <ProductsEditModal
              open={open}
              rowId={rowId}
              isEdit={isEdit}
              ProductsList={ProductsList}
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
