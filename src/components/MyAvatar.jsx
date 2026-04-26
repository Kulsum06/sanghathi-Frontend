// hooks
// import useAuth from '../hooks/useAuth';
// utils
import createAvatar from "../utils/createAvatar";
import { getAvatarSrc } from "../utils/avatarResolver";
//
import Avatar from "./Avatar";

// ----------------------------------------------------------------------

export default function MyAvatar({ user }) {
  const { name, color } = createAvatar(user?.name);
  const avatarSrc = getAvatarSrc(user);

  return (
    <Avatar alt={user?.name} color={color} src={avatarSrc || undefined}>
      {name}
    </Avatar>
  );
}
