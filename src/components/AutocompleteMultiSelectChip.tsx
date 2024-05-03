import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import {
  useMemberFavouriteStallionQuery,
  useMemberFavouriteBroodmareSireQuery,
  useMemberFavouriteFarmQuery,
  useMemberLinkedFarmQuery,
  useMemberFavMareQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import { useNotificationtypesQuery } from 'src/redux/splitEndpoints/notificationTypesSplit';
import { Images } from 'src/assets/images';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useFarmStallionsQuery } from 'src/redux/splitEndpoints/farmSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { useRaceStakeQuery } from 'src/redux/splitEndpoints/raceSplit';
import { useRunnerFinalPositionQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import { useMemberProductListQuery } from 'src/redux/splitEndpoints/productSplit';
import { useMembersListWithoutAdminsQuery } from 'src/redux/splitEndpoints/memberSplit';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function AutocompleteMultiSelectChip(props: any) {
  // Get all Member Favourite Stallion api call
  // const { data: stallions, isSuccess: isColoursSuccess } = useMemberFavouriteStallionQuery(
  //   props.memberId,
  //   { skip: props.memberId === undefined }
  // );

  // Get all Member Favourite Mares api call
  // const { data: mares, isSuccess: isMareSuccess } = useMemberFavMareQuery(props.memberId, {
  //   skip: props.memberId === undefined,
  // });

  // Get all Member Favourite BrrodmareSire api call
  // const { data: sires, isSuccess: isBrrodmareSireSuccess } = useMemberFavouriteBroodmareSireQuery(
  //   props.memberId,
  //   { skip: props.memberId === undefined }
  // );

  // // Get all Member Favourite Farm api call
  // const { data: farms, isSuccess: isFarmSuccess } = useMemberFavouriteFarmQuery(props.memberId, {
  //   skip: props.memberId === undefined,
  // });

  // Get all MemberFavouriteStallion api call
  const { data: linkedfarms, isSuccess: isLinkedFarmSuccess } = useMemberLinkedFarmQuery(
    props.memberId,
    { skip: props.memberId === undefined }
  );

  // Get all Preference Centre api call
  const { data: preferenceCentre, isSuccess: isPreferenceCentreSuccess } =
    useNotificationtypesQuery();

  // Get all Farm Stallion api call
  const { data: farmStallions, isSuccess: isFarmStallionsSuccess } = useFarmStallionsQuery(
    props.farmId,
    { skip: props.farmId === undefined }
  );

  // Get all MemberFavouriteStallion api call
  const { data: raceStakeList } = useRaceStakeQuery();

  // Get all Runner Final Position api call
  const { data: runnerFinalPositionList } = useRunnerFinalPositionQuery();

  // Get all Member ProductList api call
  const { data: productList } = useMemberProductListQuery();

  // Get all MembersList Without Admins api call
  const { data: membersListWithoutAdminsList, isSuccess: isMemberListSuccess } =
    useMembersListWithoutAdminsQuery();
  const [defaultList, setDefaultList] = React.useState<any>([]);

  // Based on component props, display the appropriate place holder
  let customPlaceholder = '';
  let customMyListName = props.placeholder;
  let memberMyList: any = [];
  switch (props.placeholder) {
    // case 'Stallions':
    //   customPlaceholder = 'Stallions';
    //   memberMyList = stallions;
    //   break;
    // case 'Mares':
    //   customPlaceholder = 'My Mares';
    //   memberMyList = mares;
    //   break;
    // case 'Sires':
    //   customPlaceholder = 'Broodmare Sires';
    //   memberMyList = sires;
    //   break;
    // case 'Farms':
    //   customPlaceholder = 'Farms';
    //   memberMyList = farms;
    //   break;
    case 'Linkedfarms':
      customPlaceholder = 'Linked Farms';
      memberMyList = linkedfarms;
      break;
    case 'PreferenceCentre':
      customPlaceholder = 'Preference Centre';
      memberMyList = preferenceCentre || [];
      break;
    case 'FarmStallions':
      customPlaceholder = 'Farm Stallions';
      memberMyList = farmStallions || [];
      break;
    case 'RaceStake':
      customPlaceholder = 'Stakes Level';
      memberMyList = raceStakeList || [];
      break;
    case 'position':
      customPlaceholder = 'Position';
      memberMyList = runnerFinalPositionList || [];
      break;
    case 'selectProduct':
      customPlaceholder = 'Select Product';
      memberMyList = productList || [];
      break;
    case 'specifieduser':
      customPlaceholder = 'Restrict to specific user';
      memberMyList = membersListWithoutAdminsList || [];
      break;
  }
  
  // On selection, saved the options in state variable
  const [isMyListSelected, setIsMyListSelected] = React.useState(false);
  const handleMylistSelect = (selectedOptions: any, listName: any) => {
    switch (listName) {
      case 'Stallions':
        let myStallionData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myStallionData.push({
              stallionId: record.stallionId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setMyStallions(myStallionData);
        break;
      case 'Mares':
        let myMareData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myMareData.push({
              horseId: record.horseId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setMyMares(myMareData);
        break;
      case 'Sires':
        let mySireData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            mySireData.push({
              horseId: record.horseId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setMyBroodmareSires(mySireData);
        break;
      case 'Farms':
        let myFarmData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myFarmData.push({
              farmId: record.farmId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setMyFarms(myFarmData);
        break;
      case 'Linkedfarms':
        let myLinkedFarmData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myLinkedFarmData.push({
              farmId: record.farmId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setLinkedFarms(myLinkedFarmData);
        break;
      case 'PreferenceCentre':
        let myPreferenceCentreData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myPreferenceCentreData.push({
              notificationTypeId: record.id,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setMyPreferenceCentre(myPreferenceCentreData);
        break;
      case 'FarmStallions':
        let myFarmStallionData: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myFarmStallionData.push({
              stallionId: record.stallionId,
            });
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setFarmStallions(myFarmStallionData);
        break;
      case 'RaceStake':
        let myRaceStakeList: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myRaceStakeList.push(record.id);
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setStateValue({ ...props.state, stakes: myRaceStakeList });
        break;
      case 'position':
        let myPositionList: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myPositionList.push(record.id);
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setStateValue({ ...props.state, position: myPositionList });
        break;
      case 'selectProduct':
        let myProductList: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myProductList.push(record.id);
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setStateValue({ ...props.state, inputProductIds: myProductList });
        break;
      case 'specifieduser':
        let myUserList: any = [];
        if (selectedOptions.length > 0) {
          selectedOptions?.map((record: any) => {
            myUserList.push(record.id);
          });
          setIsMyListSelected(true);
        } else {
          setIsMyListSelected(false);
        }
        props.setStateValue({ ...props.state, inputUserIds: myUserList });
        break;
    }
  };

  // call on isFilterCleared
  React.useEffect(() => {
    if (props.isFilterCleared) {
      memberMyList = [];
    }
  }, [props.isFilterCleared]);

  // call on isDefaultList
  React.useEffect(() => {
    if (props.isDefaultList) {
      let arr: any = [];
      membersListWithoutAdminsList?.forEach((v: any, i) => {
        props.state.inputUserIds.forEach((id: any) => {
          if (v.id == id) {
            arr.push(v);
          }
        });
      });
      setDefaultList(arr);
    }
  }, [props.state]);

  return (
    // autocomplete start
    <Autocomplete
      id="checkboxes-tags-demo"
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      options={memberMyList || []}
      multiple
      disableCloseOnSelect
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      getOptionLabel={(option: any) =>
        props.placeholder === 'Farms' || props.placeholder === 'Linkedfarms'
          ? toPascalCase(option?.farmName)?.toString()
          : props.placeholder === 'PreferenceCentre'
            ? option?.notificationTypeName
            : props.placeholder === 'RaceStake' || props.placeholder === 'position'
              ? toPascalCase(option?.displayName)?.toString()
              : props.placeholder === 'selectProduct'
                ? toPascalCase(option?.productName)?.toString()
                : props.placeholder === 'specifieduser'
                  ? toPascalCase(option?.fullName)?.toString()
                  : toPascalCase(option?.horseName)?.toString()
      }
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <span className="autocompleteTitle">
            {customMyListName === 'Linkedfarms'
              ? toPascalCase(option?.farmName)?.toString() + '(' + option?.accessLevel + ')'
              : customMyListName === 'Farms'
                ? toPascalCase(option?.farmName)?.toString()
                : customMyListName === 'RaceStake' || customMyListName === 'position'
                  ? toPascalCase(option?.displayName)?.toString()
                  : customMyListName === 'selectProduct'
                    ? toPascalCase(option?.productName)?.toString()
                    : customMyListName === 'specifieduser'
                      ? toPascalCase(option?.fullName)?.toString()
                      : customMyListName === 'PreferenceCentre'
                        ? option?.notificationTypeName
                        : toPascalCase(option?.horseName)?.toString()}
          </span>
          <Checkbox
            checkedIcon={<img src={Images.checked} />}
            icon={<img src={Images.unchecked} />}
            style={{ marginRight: 0 }}
            checked={selected}
          />
        </li>
      )}
      onChange={(e: any, selectedOptions: any,reason:any) =>{
        handleMylistSelect(selectedOptions, customMyListName);
        console.log(reason,'reason');}
      }
      className="AutoCompleteBox"
      sx={{ margin: '0px', padding: '0px' }}
      renderInput={(params) => (
        <TextField {...params} placeholder={!isMyListSelected ? customPlaceholder : ''} />
      )}
      disabled={props.disabled ? props.disabled : false}
    />
    // autocomplete ends
  );
}
