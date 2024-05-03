import { useState } from 'react';
//import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider } from '@mui/material';
// utils
//import { fDate } from '../../../../utils/formatTime';
//import { fCurrency } from '../../../../utils/formatNumber';
// @types
//import { Product } from '../../../../@types/product';
import { Stallion } from '../../../../@types/stallion';
// components
import Label from '../../../../components/Label';
//import Image from '../../../../components/Image';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import 'src/sections/@dashboard/css/list.css'
import SvgIconStyle from '../../../../components/SvgIconStyle';
import { Images } from 'src/assets/images';
// ----------------------------------------------------------------------

type Props = {
  row: Stallion;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditPopup : VoidFunction;
  onSetRowId : VoidFunction;
  handleEditState: VoidFunction;
};

const getIcon = (name: string) => (
  <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  ecommerce: getIcon('Globe'),
};

export default function StallionTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onEditPopup,
  onSetRowId,
  handleEditState
}: Props) {
  const theme = useTheme();

  //const { id, name, countryName, farmName, serviceFee, lastUpdated, promoted, status } = row;
  const { stallionId, horseName, countryName, farmName, fee, currencyCode, isPromoted, yearToStud } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let promotediconClass = (isPromoted == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted'; 
  
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow hover selected={selected} className='datalist'> 
      
      <TableCell>{horseName}</TableCell>

      <TableCell align="left">{countryName}</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>{farmName}</TableCell>

      <TableCell align="left">{currencyCode?.substring(0, 2)} {fee}</TableCell>

      <TableCell align="left">{yearToStud}</TableCell>

      <TableCell align="center"><i className={promotediconClass} /></TableCell>

      <TableCell  align="center"><i className={promotediconClass} /></TableCell>

      <TableCell align="right" className='table-more-btn'>
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem className='selectDropDownList'
                onClick={() => {
                  onDeleteRow();
                  handleCloseMenu();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify className='icon-Link' icon={'eva:trash-2-outline'} />
                Delete
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem className='selectDropDownList'
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                {/* <Iconify icon={'eva:edit-fill'} /> */}
                Edit
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem className='selectDropDownList'
                onClick={() => {
                  onEditPopup();
                  onSetRowId();
                  handleCloseMenu();
                  handleEditState();
                }}
              >
                {/* <Iconify icon={'eva:edit-fill'} /> */}
                Edit Stallion Page
              </MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem className='selectDropDownList'><i className='icon-Link popoverLink'><img src={Images.LinkGray} alt=''/></i>Copy URL</MenuItem>
              <Divider style={{ margin: "0"}} />
              {/* <MenuItem className='selectDropDownList'>Public Profile</MenuItem> */}
              <MenuItem className='selectDropDownList'>View Activity</MenuItem>
              <Divider style={{ margin: "0"}} />
              <MenuItem className='selectDropDownList'>View Analytics</MenuItem>
            </>
          }
        />
      </TableCell>

    </TableRow>
    </StyledEngineProvider>
  );
}
