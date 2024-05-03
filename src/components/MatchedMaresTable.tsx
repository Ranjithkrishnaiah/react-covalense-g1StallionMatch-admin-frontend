import { Container, Box, Grid, StyledEngineProvider, Typography, Stack, MenuItem, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useGetFarmMembersQuery } from 'src/redux/splitEndpoints/farmSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { useNavigate } from 'react-router';

type MatchedMareProps = {
  row: any;
  stallionId: string;
};

function MatchedMaresTable(props: MatchedMareProps) {
  const navigate = useNavigate();
  const { row, stallionId } = props;

  const { data: farmMembersList, isSuccess } = useGetFarmMembersQuery(row?.farmid, {
    skip: !row?.farmid,
  });

  const checkNomination =
    isSuccess && farmMembersList?.some((farm: any) => farm?.memberId === row?.farmId);



  const messageBreederHandler = (row: any) => {
    let postData = {
      rxId: row?.farmid,
      txEmail: row?.memberemail,
      txId: row?.createdby,
      stallionId: stallionId,
    };
    const farmApiData: any = {
      message: ' ',
      farmId: row?.farmid,
      stallionId: stallionId,
      subject: 'Report Enquiry',
      channelId: '',
      fromMemberUuid: row?.createdby,
    };
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        <TableRow key={row.horse} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          <TableCell align="left">{toPascalCase(row.mareName)}</TableCell>
          <TableCell align="left">{toPascalCase(row.sireName)}</TableCell>
          <TableCell align="left" className="matched-dam">
            {toPascalCase(row.damName)}
          </TableCell>
          <TableCell align="left" className="matched-yob">
            {row.yob}
          </TableCell>
          <TableCell align="left" className="matched-prize">{`${row.currencySymbol ? row.currencySymbol : ''}${
            (row.totalPrizeMoneyEarned != 0 && row.totalPrizeMoneyEarned !== null)
              ? Number(row.totalPrizeMoneyEarned).toLocaleString()
              : '-'
          }`}</TableCell>
          <TableCell align="left">
            {row?.farmid && row?.createdby && !checkNomination && (
              <Button
                type="button"
                className="Messge-Breeder-Btn"
                onClick={() => messageBreederHandler(row)}
              >
                <i className="icon-Chat" />
                Message Breeder
              </Button>
            )}
          </TableCell>
        </TableRow>
      </StyledEngineProvider>
    </>
  );
}
export default MatchedMaresTable;
