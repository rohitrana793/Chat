import { Avatar, Box, Stack, Typography } from "@mui/material";
import {
  Face as FaceIcon,
  AlternateEmail as UserNameIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import moment from "moment";
import { transformImage } from "../../lib/features";

const Profile = ({ user }) => {
  return (
    <Stack spacing={"0.75rem"} direction={"column"} alignItems={"center"}>
      <Box paddingLeft={"2rem"}>
        <Avatar
          src={transformImage(user?.avatar?.url)}
          sx={{
            width: "4rem",
            height: "4rem",
            border: "2px solid white",
            objectFit: "contain",
            marginBottom: "0.5rem",
          }}
        />
      </Box>
      <Box paddingLeft={"2rem"}>
        <ProfileCard heading={"Bio"} text={user?.bio} />
      </Box>

      <ProfileCard
        heading={"Username"}
        text={user?.username}
        Icon={<UserNameIcon />}
      />
      <ProfileCard heading={"Name"} text={user?.name} Icon={<FaceIcon />} />
      <ProfileCard
        heading={"Joined"}
        text={moment(user?.createdAt).fromNow()}
        Icon={<CalendarIcon />}
      />
    </Stack>
  );
};

const ProfileCard = ({ text, Icon, heading }) => (
  <Stack
    direction={"row"}
    spacing={"1rem"}
    alignItems={"center"}
    color={"white"}
    textAlign={"center"}
  >
    {Icon && Icon}
    <Stack>
      <Typography variant="body1">{text}</Typography>
      <Typography variant="caption" color={"gray"}>
        {heading}
      </Typography>
    </Stack>
  </Stack>
);
export default Profile;
