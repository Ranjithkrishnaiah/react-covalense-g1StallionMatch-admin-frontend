import { useState, useEffect } from 'react';
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
  TableSortLabel,
  styled,
} from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// @types
import { Member } from '../../@types/member';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
// sections
import { FarmListTableRow } from 'src/sections/@dashboard/farm/list';
import { Spinner } from 'src/components/Spinner';
import FarmFilterSidebar from 'src/sections/@dashboard/farm/filter/FarmFilterSidebar';
import FarmNewEditModal from 'src/sections/@dashboard/farm/FarmNewEditModal';
import { useFarmsQuery } from 'src/redux/splitEndpoints/farmSplit';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { visuallyHidden } from '@mui/utils';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
// ----------------------------------------------------------------------
// HtmlTooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

// table head Cells
const headCells = [
  {
    id: 'farmName',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'countryName',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'stateName',
    numeric: false,
    disablePadding: true,
    label: 'State',
  },
  {
    id: 'totalStallions',
    numeric: true,
    disablePadding: true,
    label: 'Total Stallions',
  },
  {
    id: 'promoted',
    numeric: true,
    disablePadding: true,
    label: 'Promoted',
  },
  {
    id: 'users',
    numeric: true,
    disablePadding: true,
    label: '# Users',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Last Active',
  },
];

export default function FarmList() {
  const [order, setOrder] = useState('ASC');
  const [orderBy, setOrderBy] = useState('totalStallions');
  // Enhanced TableHead handler
  function EnhancedTableHead(props: any) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    return (
      // table section
      <TableHead className="farmTableHead">
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
                {headCell.label === 'Name' ? (
                  <Box className="tooltipPopoverbox">
                    <HtmlTooltip
                      className="tableTooltip"
                      title={
                        <React.Fragment>
                          <Box className="tooltipPopoverBody HorseDetailsPopover">
                            <p>
                              <i className="popover-circle red"></i> Requires Verification
                            </p>
                            <p>
                              <i className="popover-circle black"></i> Verified & Complete
                            </p>
                          </Box>
                        </React.Fragment>
                      }
                    >
                      <i className="icon-Info-circle tooltip-table" />
                    </HtmlTooltip>
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="left" className="icon-share-wrapper">
            <i className={'icon-Share'} />
          </TableCell>
        </TableRow>
      </TableHead>
      // table section ends
    );
  }
  const { themeStretch } = useSettings();
  const [tableData, setTableData] = useState<Member[]>([]);
  const [filterName, setFilterName] = useState('');
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState('');

  // Filter handler
  const handleFilter = (value: any) => {
    setGetFilters(value);
  };
  // Filter Applied handler
  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };
  // Remove Filter Applied handler
  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };
  const [clear, setClear] = useState<any>(false);
  // newState
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };
  // API call to get farms data
  const data = useFarmsQuery(isFilterApplied ? getFilters : newState);
  const farmList = data?.data?.data ? data?.data?.data : [];
  // farm List Props
  const farmListProps = {
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

  // edit popup handler
  const handleEditPopup = () => {
    setOpen(!open);
  };
  // open edit popup
  const handleEditState = () => {
    setEdit(true);
  };
  // close edit popup
  const handleCloseEditState = () => {
    setEdit(!isEdit);
  };
  const [selected, setSelected] = useState([]);
  // Request Sort handler for table
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
  };

  return (
    <StyledEngineProvider injectFirst>
      <Page title="Farm List" sx={{ display: 'flex' }}>
        {/* Farm Filter Sidebar section */}
        <FarmFilterSidebar
          handleFilter={handleFilter}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          rowCount={data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          order={order}
          setOrder={setOrder}
        />
        <Container maxWidth={themeStretch ? false : 'lg'} className="datalist">
          {data?.isLoading ? (
            <Box className="Spinner-Wrp">
              {/* Spinner */} <Spinner />
            </Box>
          ) : farmListProps?.result?.length > 0 ? (
            <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
              <Scrollbar>
                {/* Table section */}
                <TableContainer className="datalist" sx={{ minWidth: 800 }}>
                  <Table
                    sx={{
                      borderCollapse: 'separate',
                      borderSpacing: '0 4px',
                      background: '#FAF8F7',
                    }}
                  >
                    {/* Enhanced Table Head */}
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      rowCount={farmList.length}
                    />
                    <TableBody>
                      {/* Farm List Table Row section */}
                      {farmList.map((row: any, index: number) => (
                        <FarmListTableRow
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
                {/* Table section ends */}
              </Scrollbar>

              {/* Pagination section */}
              <Box className="Pagination-wrapper">
                <PaginationSettings data={farmListProps} />
                <PaginationLimit data={farmListProps} />
              </Box>
            </Card>
          ) : (
            <NoDataComponent />
          )}
        </Container>
        {/* Farm New Edit Modal */}
        <FarmNewEditModal
          open={open}
          rowId={rowId}
          isEdit={isEdit}
          handleEditPopup={handleEditPopup}
          handleCloseEditState={handleCloseEditState}
        />
      </Page>
    </StyledEngineProvider>
  );
}
