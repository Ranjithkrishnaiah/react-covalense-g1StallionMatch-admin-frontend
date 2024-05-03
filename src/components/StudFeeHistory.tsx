import { useEffect, useState } from 'react';
import { Box, StyledEngineProvider, Typography, Stack } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  useStallionStudFeeHistoryQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import { toPascalCase } from 'src/utils/customFunctions';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';

function StudFeeHistory(props: any) {

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [order, setOrder] = useState('DESC');
  const [clear, setClear] = useState<any>(false);
  const [getFilters, setGetFilters] = useState({});
  const [isPaginationApplied, setIsPaginationApplied] = useState(false);
  const stallionId = props.stallionId;

  let newState = {
    page: page,
    limit: limit,
    order: order,
    id: stallionId,
    date: props.dateFilter
  };

  useEffect(() => {
    setPage(1);
    setGetFilters({
      page: 1,
      limit: limit,
      order: order,
      id: stallionId,
      date: props.dateFilter
    })
  }, [props.dateFilter])

  // Stud fee history api call  
  const data: any = useStallionStudFeeHistoryQuery(isPaginationApplied ? getFilters : newState,{refetchOnMountOrArgChange: true});
  let StudFeeHistoryList = data?.data?.data ? data?.data?.data : [];

  // set the variable to be used in pagination
  const stusFeeListProps = {
    page: page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: limit,
    setLimit,
  };

  // set the filter value
  const handleFilter = (value: any) => {
    setGetFilters(value);
  }

  // Handle pagination
  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...({ page: pageNum }),
      ...({ limit: limit }),
      ...({ order: order }),
      ...({ id: stallionId }),
      ...({ date: props.dateFilter }),
    }
    setIsPaginationApplied(true);
    handleFilter(datafltr)
    // data?.refetch();
  }


  return (
    <>
      <StyledEngineProvider injectFirst>
        <Box py={5} className='stallion-report-datatable progency-tracker-table'>
          {/* Table title */}
          <Box mt={3}>
            <Stack direction={{ lg: 'row', xs: 'column' }} sx={{ marginBottom: '18px' }}>
              <Box flexGrow={1}>
                <Typography variant='h3' sx={{ color: '#1D472E' }}>Stud Fee History</Typography>
              </Box>
            </Stack>
          </Box>
          {/* Table title */}

          {/* Table Header with Data */}
          <Box className='common-table-scroll'>
            <TableContainer component={Paper} className='datalist'>
              <Table className='DataListTable' aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Year</TableCell>
                    <TableCell align="left">Previous Fee</TableCell>
                    <TableCell align="left">Updated Fee</TableCell>
                    <TableCell align="left">Updated On</TableCell>
                    <TableCell align="left">Updated By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {StudFeeHistoryList.map((row: any) => (
                    <TableRow
                      key={row.horse}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="left">{row.year}</TableCell>
                      <TableCell align="left">{row.currencyCode?.substring(0, 2)}{row.currencySymbol}&nbsp;{row.previousFee?.toLocaleString()}</TableCell>
                      <TableCell align="left">{row.currencyCode?.substring(0, 2)}{row.currencySymbol}&nbsp;{row.updatedFee?.toLocaleString()}</TableCell>
                      <TableCell align="left">{parseDateAsDotFormat(row.updatedOn)}</TableCell>
                      <TableCell align="left">{toPascalCase(row.updatedBy)?.toString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{background:'#FAF8F7'}}>
                  {StudFeeHistoryList?.length === 0 && (
                  
                      <Box className="smp-no-data">
                        <Typography variant="h6">No data found!</Typography>
                      </Box>
                  
                  )}
                </Box>
            </TableContainer>
            <Box className='Pagination-wrapper'>
              <PaginationSettings data={stusFeeListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit} />
            </Box>
          </Box>
          {/* Table Header with Data */}
        </Box>
      </StyledEngineProvider>
    </>
  );
}
export default StudFeeHistory;