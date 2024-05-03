import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, TableCell, MenuItem, StyledEngineProvider, Divider } from '@mui/material';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import React from 'react';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { InsertCommas } from 'src/utils/customFunctions';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
// ----------------------------------------------------------------------
// props type
type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
};

export default function ProductsListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  // data from row
  const { id, createdOn, isPromoted, productName, categoryName, MRR, active, created, updated,currencyId } =
    row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const { data: currenciesList } = useCurrenciesQuery();
  // open menu handler
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  // close menu handler
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // time conversion handler
  function parseDate(dateToParse: string) {
    let parsedDate = dateToParse ? new Date(dateToParse) : new Date();
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  const countryNameAndSymbol = (id: number) => {
    let symbolStr = '';
    currenciesList?.forEach((v:any) => {
      if(id === v.id) {
        symbolStr = `${v.currencyCode?.substring(0, 2)}${v.currencySymbol}`;
      }
    })
    return symbolStr;
  }

  let ImportediconClass = active == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  return (
    <StyledEngineProvider injectFirst>
      {/* table row section */}
      <TableRow hover selected={selected}>
        <TableCell align="left">{id}</TableCell>
        <TableCell align="left">{productName}</TableCell>
        <TableCell align="left">{categoryName}</TableCell>
        <TableCell align="left">{MRR > 0 ? countryNameAndSymbol(currencyId)+''+ InsertCommas(MRR) : '--'} </TableCell>
        <TableCell align="left">{created ? parseDate(created) : '\u00A0 \u00A0 \u00A0\u00A0\u2014'}</TableCell>
        <TableCell align="left">{updated ? parseDate(updated) : '--'}</TableCell>
        <TableCell align="center">
          <i className={ImportediconClass} />
        </TableCell>

        <TableCell align="right" className="table-more-btn">
          {/* table more menu */}
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                  // disabled={true}
                >
                  Edit
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                <MenuItem
                  onClick={() => {
                    navigate(PATH_DASHBOARD.reports.filter(id));
                  }}
                >
                  View Orders
                </MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>
      {/* table row section end */}
    </StyledEngineProvider>
  );
}
