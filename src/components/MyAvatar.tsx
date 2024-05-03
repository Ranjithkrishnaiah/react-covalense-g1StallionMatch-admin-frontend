// hooks
import { Images } from 'src/assets/images';
import useAuth from '../hooks/useAuth';
// utils
import createAvatar from '../utils/createAvatar';
//
import Avatar, { Props as AvatarProps } from './Avatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }: AvatarProps) {
  const { user } = useAuth();
  const userData = (user !== null) ? JSON.parse(JSON.stringify(user)) : null;

  return (
    <Avatar
      src={userData?.memberprofileimages ? `${userData?.memberprofileimages}?h=40&w=40&fit=crop&ar=1:1&mask=ellipse&nr=-100&nrs=100` : Images.userSign}
      alt={userData?.fullName}
    // color={userData?.fullName ? 'default' : createAvatar(userData?.userData).color}
    // {...other}
    >
      {/* {createAvatar(userData?.fullName).name} */}
    </Avatar>
  );
}
