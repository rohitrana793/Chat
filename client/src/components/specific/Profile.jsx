import { Avatar, Stack, Typography } from "@mui/material";
import {
  Face as FaceIcon,
  AlternateEmail as UserNameIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import moment from "moment";

const Profile = () => {
  return (
    <Stack spacing={"0.75rem"} direction={"column"} alignItems={"center"}>
      <Avatar
        sx={{
          width: "4rem",
          height: "4rem",
          border: "2px solid white",
          objectFit: "contain",
          marginBottom: "0.5rem",
        }}
      />
      <ProfileCard heading={"bio"} text={"asndlaskndasdasd"} />
      <ProfileCard
        heading={"username"}
        text={"rohitrana"}
        Icon={<UserNameIcon />}
      />
      <ProfileCard
        heading={"bio"}
        text={"asndlaskndasdasd"}
        Icon={<FaceIcon />}
      />
      <ProfileCard
        heading={"Joined"}
        text={moment("2025-07-24T18:15:00.000Z").fromNow()}
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
