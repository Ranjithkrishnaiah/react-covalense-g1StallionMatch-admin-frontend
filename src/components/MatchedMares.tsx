import { Box, StyledEngineProvider, Typography } from '@mui/material';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useStallionActivityMatchedMareQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import MatchedMaresTable from './MatchedMaresTable';

function MatchedMares(props: any) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [order, setOrder] = useState('ASC');
  const [clear, setClear] = useState<any>(false);
  const [getFilters, setGetFilters] = useState({});
  const [isPaginationApplied, setIsPaginationApplied] = useState(false);
  const stallionId = props.stallionId;
  const fromDate = props.fromDate;
  const toDate = props.toDate;



  let newState = {
      stallionId: stallionId,
      fromDate: fromDate,
      toDate: toDate,
    };
  const data:any = useStallionActivityMatchedMareQuery(isPaginationApplied ? getFilters : newState);  
  let matchedMaresList = data?.data ? data?.data : [];

  const matchedMareListProps = {
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

  return (
    <>
      <StyledEngineProvider injectFirst>
        <Box py={4} pt={2} className='stallion-report-datatable'>
          <Box className='common-table-scroll'>
            <TableContainer component={Paper} className='datalist stalliondataList'>
              <Table className='DataListTable' aria-label="simple table" sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Mare</TableCell>
                    <TableCell align="left">Sire</TableCell>
                    <TableCell align="left">Dam</TableCell>
                    <TableCell align="left">YOB</TableCell>
                    <TableCell align="left">Prize Money</TableCell>
                    <TableCell align="left">&nbsp;</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matchedMaresList?.length > 0 && matchedMaresList?.map((row: any, index: number) => (
                    <MatchedMaresTable key={index} row={row} stallionId={stallionId} />
                  ))}
                  {
                    matchedMaresList?.length === 0 && 
                    <TableRow>
                    <TableCell colSpan={6} className='stallion-data'>
                     <Box className='smp-no-data'>
                            <Typography variant='h6'>No Mares found!</Typography>
                         </Box>        
                      </TableCell>
                      </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ position: 'relative', background: '#FAF8F7' }}>
            </Box>
          </Box>
        </Box>
      </StyledEngineProvider>
    </>
  );
}
export default MatchedMares;