import { useState, useEffect, SetStateAction } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider,Divider, FormControlLabel, Radio, RadioGroup, FormControl } from '@mui/material';
// @types
import { Stallion } from '../../../../../@types/stallion';
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import { Images } from 'src/assets/images';
import {
  RHFRadioGroup,
  RHFCheckbox,
  RHFCheckboxWithRadio
} from 'src/components/hook-form';
// components
import Iconify from 'src/components/Iconify';
// ----------------------------------------------------------------------

type Props = {
  row: any;
  state: any,
  setStateValue: React.Dispatch<React.SetStateAction<any>>,
};

export default function TrendsListTableRow({
  row,
  state,
  setStateValue,
}: Props) {
  const theme = useTheme();  
  const { id, isAnonymous, isRegistered, position, title } = row;
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // console.log('id: ', id, ' Ano: ', isAnonymous, ' Reg: ', isRegistered, 'position', position, 'title', title);
  
  const [isAnonymousChecked, setIsAnonymousChecked] = useState(false);
  const [isRegisteredChecked, setIsRegisteredChecked] = useState(false);

  useEffect(() => {
    setIsAnonymousChecked(isAnonymous);
    setIsRegisteredChecked(isRegistered);
  }, [row]);

  const handleAnonymousCheckboxChange = (position: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnonymousChecked(event.target.checked);
    let tilePermission = '';    
    
    switch (position) {
        case 0:
            tilePermission = "TPSA";
            break;
        case 1:
            tilePermission = "MPSA";
            break;
        case 2:
          tilePermission = "MPBSA";
          break;
            break;
        case 3:
          tilePermission = "MSSA";
          break;
            break;
        case 4:
          tilePermission = "MSBSA";
          break;
            break;
        case 5:
          tilePermission = "FAA";
          break;
        case 6:
          tilePermission = "T102020MSA";
          break;
        case 7:
          tilePermission = "T102020MBSA";
          break;
        case 8:
          tilePermission = "HCA";
          break;
        case 9:
          tilePermission = "T10PMMSA";
          break;
        case 10:
          tilePermission = "T10PMMBSA";
          break;
          case 11:
            tilePermission = "SMSAA";
            break;
    };
    setStateValue({
      ...state,
      [tilePermission]: event.target.checked,
      isCheckboxChangedA: true,
    })
  };
  const handleRegisteredCheckboxChange = (position: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setIsRegisteredChecked(event.target.checked);
    let tilePermission = '';   
    switch (position) {
      case 0:
          tilePermission = "TPSR";
          break;
      case 1:
          tilePermission = "MPSR";
          break;
      case 2:
        tilePermission = "MPBSR";
        break;
          break;
      case 3:
        tilePermission = "MSSR";
        break;
          break;
      case 4:
        tilePermission = "MSBSR";
        break;
          break;
      case 5:
        tilePermission = "FAR";
        break;
      case 6:
        tilePermission = "T102020MSR";
        break;
      case 7:
        tilePermission = "T102020MBSR";
        break;
      case 8:
        tilePermission = "HCR";
        break;
      case 9:
        tilePermission = "T10PMMSR";
        break;
      case 10:
        tilePermission = "T10PMMBSR";
        break;
        case 11:
          tilePermission = "SMSAR";
          break;
  };
  setStateValue({
    ...state,
    [tilePermission]: event.target.checked,
    isCheckboxChangedR: true,
  })
  };
  return (
    <StyledEngineProvider injectFirst>   
    <TableRow className='datalist'>
        <TableCell align="left" className='title-td'>
            <Typography variant='h5'>{title}</Typography>
        </TableCell>
        <TableCell align="center" className='minwidth-table'>
          <FormControlLabel
              control={
                <Checkbox
                  disableRipple
                  className='isPrivateFee'
                  name={"anonymous_"+position}
                  checked={isAnonymousChecked}
                  onChange={(e) => handleAnonymousCheckboxChange(position, e)}
                  key={"anonymous_"+id} 
                  checkedIcon={<img src={Images.Radiochecked} />}
                  icon={<img src={Images.Radiounchecked} />}
                />
              }
              label={''}
          />
          {/* <FormControl className='RHFCheckboxWithLabel'>
            <RHFCheckboxWithRadio className='RHFCheckboxWithRadio' name={"anonymous_"+position} key={"anonymous_"+id} label={""} options={isAnonymousChecked} />            
          </FormControl>           */}
        </TableCell>
        <TableCell align="center" className='minwidth-table'>
          <FormControlLabel
              control={
                <Checkbox
                  disableRipple
                  className='isPrivateFee'
                  name={"registered_"+position}
                  checked={isRegisteredChecked}
                  onChange={(e) => handleRegisteredCheckboxChange(position, e)}
                  key={"registered_"+id} 
                  checkedIcon={<img src={Images.Radiochecked} />}
                  icon={<img src={Images.Radiounchecked} />}
                />
              }
              label={''}
          />
          {/* <FormControl  className='RHFCheckboxWithLabel'>
            <RHFCheckboxWithRadio  className='RHFCheckboxWithRadio' name={"registered_"+position} key={"registered_"+id} label={""} options={isRegisteredChecked} />            
          </FormControl>         */}
        </TableCell>
    </TableRow>
    </StyledEngineProvider>
  );
}
