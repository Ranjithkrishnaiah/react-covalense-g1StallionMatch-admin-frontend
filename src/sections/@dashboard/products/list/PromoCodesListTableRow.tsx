import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, TableCell, MenuItem, StyledEngineProvider, Divider } from '@mui/material';
// components
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import React from 'react';
import { toPascalCase } from 'src/utils/customFunctions';
// ----------------------------------------------------------------------
// props type
type Props = {
  row: any;
  selected: any;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  currenciesList: any;
};

export default function PromoCodesListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  currenciesList,
}: Props) {
  const theme = useTheme();

  // data from row
  const {
    id,
    promoCode,
    createdOn,
    isActive,
    endDate,
    redemtions,
    promoCodeName,
    currencyId,
    discountType,
    price,
  } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
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
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }
  let ImportediconClass = isActive == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  // method to calculate Terms
  const calculateTerms = () => {
    let text = '';
    if (discountType === 'Fixed') {
      let currencySym: any = {};
      currencySym = currenciesList?.filter((v: any) => v.id === currencyId)[0];
      console.log(currencySym,'currencySym')
      text = `${currencySym ? currencySym?.currencyCode?.substring(0, 2) + currencySym?.currencySymbol : '$'} ${price}`;
    }
    if (discountType === 'Percentage') {
      text = price + '%';
    }
    return text;
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* table row section */}
      <TableRow hover selected={selected}>
        <TableCell align="left">{id}</TableCell>
        <TableCell align="left">{toPascalCase(promoCodeName)}</TableCell>
        <TableCell align="left">{promoCode}</TableCell>
        <TableCell align="left">{calculateTerms()}</TableCell>
        <TableCell align="left">{redemtions ? redemtions : '--'}</TableCell>
        <TableCell align="left">{parseDate(createdOn)}</TableCell>
        <TableCell align="left">{endDate ? parseDate(endDate) : '--'}</TableCell>
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
                >
                  Edit
                </MenuItem>
                <Divider style={{ margin: '0' }} />
              </>
            }
          />
        </TableCell>
      </TableRow>
      {/* table row section end */}
    </StyledEngineProvider>
  );
}
