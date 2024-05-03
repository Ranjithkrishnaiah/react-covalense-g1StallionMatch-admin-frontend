import * as React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { StyledEngineProvider } from '@mui/material/styles';
import { Checkbox, ListItemText } from '@mui/material';
import * as _ from 'lodash';
import {
  useMemberFavouriteStallionQuery,
  useMemberFavouriteMareQuery,
  useMemberFavouriteBroodmareSireQuery,
  useMemberFavouriteFarmQuery,
  useMemberLinkedFarmQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import { Images } from 'src/assets/images';
// MenuProps
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps: any = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      boxShadow: 'none',
      border: 'solid 1px #333333',
      borderTopLeftRadius: 0,
      maxWidth: 0,
      borderTopRightRadius: 0,
      marginTop: '-0px',
      boxSizing: 'border-box',
    },
  },
  variant: 'menu',
  getContentAnchorEl: null,
};

export default function MultipleSelectChip(props: any) {
  // states
  const { data: colours, isSuccess: isColoursSuccess } = useMemberFavouriteStallionQuery(19);
  const { data: mares, isSuccess: isMareSuccess } = useMemberFavouriteMareQuery(19);
  const { data: sires, isSuccess: isBrrodmareSireSuccess } =
    useMemberFavouriteBroodmareSireQuery(19);
  const { data: farms, isSuccess: isFarmSuccess } = useMemberFavouriteFarmQuery(19);
  const { data: linkedfarms, isSuccess: isLinkedFarmSuccess } = useMemberLinkedFarmQuery(19);
  const [name, setName] = React.useState<String[]>([]);
  // call on clear
  React.useEffect(() => {
    if (props.clear) {
      setName([]);
    }
  }, [props.clear]);
  // list values
  const list: any = {
    Stallions: colours,
    Farms: farms,
    Mares: mares,
    Sires: sires,
    Linkedfarms: linkedfarms,
  };

  // set name based on placeholder value
  React.useEffect(() => {
    if (props.searchColour?.length > 0 && props?.placeholder === 'Stallions') {
      let newChipValueArray = null;
      newChipValueArray = colours?.filter((colour: any) =>
        props.searchColour?.includes(colour?.horseName)
      );
      let labelValues = newChipValueArray?.map((colourObject: any) => colourObject.horseName);
      setName(labelValues);
    }
    if (props.searchColour?.length > 0 && props?.placeholder === 'Farms') {
      let newChipValueArray = null;
      newChipValueArray = farms?.filter((farm: any) => props.searchFarm?.includes(farm?.farmName));
      let labelValues = newChipValueArray?.map((farmObject: any) => farmObject.farmName);
      setName(labelValues);
    }
    if (props.searchColour?.length > 0 && props?.placeholder === 'Mares') {
      let newChipValueArray = null;
      newChipValueArray = mares?.filter((mare: any) => props.searchMare?.includes(mare?.horseName));
      let labelValues = newChipValueArray?.map((mareObject: any) => mareObject.horseName);
      setName(labelValues);
    }
    if (props.searchColour?.length > 0 && props?.placeholder === 'Sires') {
      let newChipValueArray = null;
      newChipValueArray = sires?.filter((sire: any) =>
        props.searchBroodmareSire?.includes(sire?.horseName)
      );
      let labelValues = newChipValueArray?.map((sireObject: any) => sireObject.horseName);
      setName(labelValues);
    }
    if (props.searchColour?.length > 0 && props?.placeholder === 'Linkedfarms') {
      let newChipValueArray = null;
      newChipValueArray = linkedfarms?.filter((linkedfarm: any) =>
        props.searchBroodmareSire?.includes(linkedfarms?.farmName)
      );
      let labelValues = newChipValueArray?.map(
        (linkedfarmObject: any) => linkedfarmObject.farmName
      );
      setName(labelValues);
    }
  }, [props.searchColour?.length]);

  // chip change handler
  const handleChange = (event: SelectChangeEvent<String[]>): void => {
    let chipValue: any = event.target.value;
    search(chipValue);
  };
  // chip delete handler
  const handleDelete = (e: any, value: any) => {
    e.stopPropagation();
    let afterRemove = name?.filter((res: any) => res != value);
    setName(afterRemove);
    setTimeout(() => {
      search(afterRemove);
    }, 500);
  };
  // chip search handler
  function search(chipValue: any) {
    const { placeholder } = props;
    setName(
      // On autofill we get a stringified value.
      typeof chipValue === 'string' ? chipValue.split(',') : chipValue
    );

    let newChipValueArray = null;
    // newChipValueArray based on placeholder value
    if (placeholder === 'Stallions') {
      newChipValueArray = colours?.filter((colour: any) => chipValue.includes(colour.label));
      newChipValueArray = newChipValueArray?.map((colourObject: any) => colourObject.label);
    }
    if (placeholder === 'Farms') {
      newChipValueArray = farms?.filter((farm: any) => chipValue.includes(farm.label));
      newChipValueArray = newChipValueArray?.map((farmObject: any) => farmObject.label);
    }
    if (placeholder === 'Mares') {
      newChipValueArray = mares?.filter((mare: any) => chipValue.includes(mare.label));
      newChipValueArray = newChipValueArray?.map((mareObject: any) => mareObject.label);
    }
    if (placeholder === 'Sires') {
      newChipValueArray = sires?.filter((sire: any) => chipValue.includes(sire.label));
      newChipValueArray = newChipValueArray?.map((sireObject: any) => sireObject.label);
    }
    if (placeholder === 'Linkedfarms') {
      newChipValueArray = linkedfarms?.filter((linkedfarm: any) =>
        chipValue.includes(linkedfarm.label)
      );
      newChipValueArray = newChipValueArray?.map((linkedfarmObject: any) => linkedfarmObject.label);
    }
  }

  let customPlaceholder = '';
  // customPlaceholder base on placeholder value
  switch (props.placeholder) {
    case 'Stallions':
      customPlaceholder = 'Stallions';
      break;
    case 'Mares':
      customPlaceholder = 'My Mares';
      break;
    case 'Sires':
      customPlaceholder = 'Broodmare Sires';
      break;
    case 'Farms':
      customPlaceholder = 'Farms';
      break;
    case 'Linkedfarms':
      customPlaceholder = 'Linked Farms';
      break;
  }

  return (
    <>
      <StyledEngineProvider injectFirst>
        <Box className="SDmultiselect">
          {/* forcontrol */}
          <FormControl sx={{ width: '100%' }}>
            <InputLabel id="demo-multiple-chip-label"> {customPlaceholder}</InputLabel>
            <Select
              labelId="demo-multiple-chip-checkbox-label"
              id="demo-multiple-chip-checkbox"
              multiple
              value={name}
              onChange={handleChange}
              IconComponent={KeyboardArrowDownIcon}
              input={<OutlinedInput label={customPlaceholder} />}
              renderValue={(selected: React.ReactNode[]) => (
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, fontFamily: 'Synthese-Book' }}
                >
                  {selected.map((value: React.ReactNode, index: number) => (
                    <Chip
                      key={index}
                      label={value}
                      clickable
                      deleteIcon={
                        <i
                          className="icon-Cross"
                          onMouseDown={(e) => handleDelete(e, value)}
                          style={{ color: '#161716' }}
                        />
                      }
                      onDelete={(e: any) => handleDelete(e, value)}
                    />
                  ))}
                </Box>
              )}
              //
              MenuProps={MenuProps}
            >
              {list[props?.placeholder] &&
                list[props?.placeholder].map((res: any) => (
                  <MenuItem
                    disableRipple
                    key={
                      props.placeholder === 'Farms' || props.placeholder === 'Linkedfarms'
                        ? res.farmId
                        : res.stallionId
                    }
                    value={
                      props.placeholder === 'Farms' || props.placeholder === 'Linkedfarms'
                        ? res.farmName
                        : res.horseName
                    }
                    className="multiselect-menu"
                    sx={{
                      fontFamily: 'Synthese-Book',
                      fontSize: '14px',
                      fontWeight: '400',
                      lineHeight: '20px',
                      padding: '0px',
                    }}
                  >
                    <ListItemText
                      primary={
                        props.placeholder === 'Farms' || props.placeholder === 'Linkedfarms'
                          ? res.farmName
                          : res.horseName
                      }
                      className="multiselect-listitem"
                    />
                    <Checkbox
                      checkedIcon={<img src={Images.checked} />}
                      icon={<img src={Images.unchecked} />}
                      checked={
                        name.indexOf(
                          props.placeholder === 'Farms' || props.placeholder === 'Linkedfarms'
                            ? res.farmName
                            : res.horseName
                        ) > -1
                      }
                    />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </StyledEngineProvider>
    </>
  );
}
