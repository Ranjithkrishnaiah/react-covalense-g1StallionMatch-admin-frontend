import { Container, Box, Grid, StyledEngineProvider, Typography, Stack, MenuItem } from '@mui/material';
import { CustomSelect } from 'src/components/CustomSelect'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import { useProgenyTrackerQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import { toPascalCase } from 'src/utils/customFunctions';
import { useState, useEffect } from 'react';

function ProgenyTracker(props: any) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [order, setOrder] = useState('ASC');
  const [clear, setClear] = useState<any>(false);
  const [getFilters, setGetFilters] = useState({});
  const [isPaginationApplied, setIsPaginationApplied] = useState(false);
  const stallionId = props.stallionId;
  const fromDate = props.fromDate;
  const toDate = props.toDate;

  let newState = {
    page: page,
    limit: limit,
    order: order,
    stallionId: stallionId,
    fromDate: fromDate,
    toDate: toDate,
  };
const data:any = useProgenyTrackerQuery(isPaginationApplied ? getFilters : newState);  
let progenyTrackerList = data?.data?.data ? data?.data?.data : [];

const progenyTrackerListProps = {
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

const handleFilter = (value: any) => {
  setGetFilters(value);
}
const handleRequestPagination = (pageNum: number) => 
{
  const datafltr = {
    ...({ page: pageNum }), 
    ...({ limit: limit }),
    ...({ order: order }),
    ...({ stallionId: stallionId }),
    ...({ fromDate: fromDate }),
    ...({ toDate: toDate }),
  }
  setIsPaginationApplied(true);
  handleFilter(datafltr)
  data?.refetch();
}

  return (
    <>
      <StyledEngineProvider injectFirst>
        <Box py={5} className='stallion-report-datatable progency-tracker-table'>

          <Box mt={3}>
            <Stack direction={{ lg: 'row', xs: 'column' }} sx={{ marginBottom: '10px' }}>
              <Box flexGrow={1}>
                <Typography variant='h3' sx={{ color: '#1D472E' }}>Progeny Tracker</Typography>
              </Box>
            </Stack>
          </Box>

          <Box className='common-table-scroll'>
            <TableContainer component={Paper} className='datalist stalliondataList'>
              <Table className='DataListTable' aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Horse Name</TableCell>
                    <TableCell align="left">Mare</TableCell>
                    <TableCell align="left">Age</TableCell>
                    <TableCell align="left">Distance</TableCell>
                    <TableCell align="left">Class</TableCell>
                    <TableCell align="left">Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {progenyTrackerList?.length > 0 && progenyTrackerList?.map((row: any) => (
                    <TableRow
                      key={row.horse}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="left">{toPascalCase(row.horseName)?.toString()}</TableCell>
                      <TableCell align="left">{toPascalCase(row.damName)?.toString()}</TableCell>
                      <TableCell align="left">{row.age}</TableCell>
                      <TableCell align="left">{row.distance}{row.distanceCode}</TableCell>
                      <TableCell align="left">{row.class}</TableCell>
                      <TableCell align="left">{row.location}</TableCell>
                    </TableRow>
                  ))}
                  {
                    progenyTrackerList?.length === 0 && 
                    <TableRow>
                    <TableCell colSpan={6} className='stallion-data'>
                     <Box className='smp-no-data'>
                            <Typography variant='h6'>No Progeny found!</Typography>
                         </Box>        
                      </TableCell>
                      </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='Pagination-wrapper'>
              <PaginationSettings data={progenyTrackerListProps} handleRequestPagination={handleRequestPagination} limit={limit} setLimit={setLimit}/>
            </Box>        

          </Box>
        </Box>
      </StyledEngineProvider>
    </>
  );
}
export default ProgenyTracker;