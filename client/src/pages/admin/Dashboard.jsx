import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Container, Stack, Paper, Typography, Box } from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Message as MesssageIcon,
} from "@mui/icons-material";
import moment from "moment";
import {
  CurveButton,
  SearchField,
} from "../../components/styles/StyledComponent";
import { matBlack } from "../../constants/color";
import { DoughnutChart, LineChart } from "../../components/specific/Charts";
import { LayoutLoaders } from "../../components/layout/Loaders";
import { server } from "../../constants/config";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${server}/api/v1/admin/stats`, {
          credentials: "include", // important for sending cookies
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        // console.log("Fetched admin stats:", data);
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const AppBar = (
    <Paper
      elevation={3}
      sx={{ padding: "2rem", margin: "2rem 0", borderRadius: "1rem" }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />
        <SearchField placeholder="Search..." />
        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography
          display={{ xs: "none", lg: "block" }}
          color={"rgba(0,0,0,0.7"}
          textAlign={"center"}
        >
          {moment().format("dddd, D MMMM  YYYY")}
        </Typography>
        <NotificationsIcon />
      </Stack>
    </Paper>
  );

  const widgets = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={"2rem"}
      justifyContent={"space-between"}
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.usersCount} Icon={<PersonIcon />} />
      <Widget
        title={"Chats"}
        value={stats?.totalChatsCount}
        Icon={<GroupIcon />}
      />
      <Widget
        title={"Messages"}
        value={stats?.messagesCount}
        Icon={<MesssageIcon />}
      />
    </Stack>
  );

  if (loading) return <LayoutLoaders />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <AdminLayout>
      <Container component={"main"}>
        {AppBar}

        <Stack
          direction={{ xs: "column", lg: "row" }}
          flexWrap={"wrap"}
          justifyContent={"center"}
          alignItems={{ xs: "center", lg: "stretch" }}
          sx={{ gap: "2rem" }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "2rem 1rem",
              borderRadius: "1rem",
              width: "57%",
              maxWidth: "45rem",
            }}
          >
            <Typography>Last Messages</Typography>
            <LineChart value={stats?.messageChart || []} />
          </Paper>

          <Paper
            elevation={3}
            sx={{
              padding: "1rem",
              borderRadius: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "25rem",
              height: "25rem",
              position: "relative",
            }}
          >
            <DoughnutChart
              labels={["Single Chats", "Group Chats"]}
              value={[
                stats?.totalChatsCount - stats?.groupsCount || 0,
                stats?.groupsCount || 0,
              ]}
            />
            <Stack
              position={"absolute"}
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={"0.5rem"}
              width={"100%"}
              height={"100%"}
            >
              <GroupIcon />
              <Typography>Vs</Typography>
              <PersonIcon />
            </Stack>
          </Paper>
        </Stack>

        {widgets}
      </Container>
    </AdminLayout>
  );
};

const Widget = ({ title, value, Icon }) => (
  <Paper
    elevation={3}
    sx={{
      padding: "2rem",
      margin: "2rem 0",
      borderRadius: "1.5rem",
      width: "20rem",
    }}
  >
    <Stack alignItems={"center"} spacing={"1rem"}>
      <Typography
        sx={{
          color: matBlack,
          borderRadius: "50%",
          border: `5px solid ${matBlack}`,
          width: "5rem",
          height: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </Typography>
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
);

export default Dashboard;

/*
import React, { useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Container, Stack, Paper, Typography, Box } from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Message as MesssageIcon,
} from "@mui/icons-material";
import moment from "moment";
import {
  CurveButton,
  SearchField,
} from "../../components/styles/StyledComponent";
import { matBlack } from "../../constants/color";
import { DoughnutChart, LineChart } from "../../components/specific/Charts";
import { useFetchData } from "6pp";

import { LayoutLoaders } from "../../components/layout/Loaders";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

const Dashboard = () => {
  useEffect(() => {
    fetch(`${server}/api/v1/admin/stats`, { credentials: "include" })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  }, []);

  // const { loading, data, error } = useFetchData(
  //   `${server}/api/v1/admin/stats`,
  //   "dashboard-stats",
  //   { withCredentials: true }
  // );

  // const { stats } = data || {};

  // useErrors([
  //   {
  //     isError: error,
  //     error: error,
  //   },
  // ]);

  const AppBar = (
    <Paper
      elevation={3}
      sx={{ padding: "2rem", margin: "2rem 0", borderRadius: "1rem" }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />
        <SearchField placeholder="Search..." />
        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography
          display={{
            xs: "none",
            lg: "block",
          }}
          color={"rgba(0,0,0,0.7"}
          textAlign={"center"}
        >
          {moment().format("dddd, D MMMM  YYYY")}
        </Typography>
        <NotificationsIcon />
      </Stack>
    </Paper>
  );

  const widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={"2rem"}
      justifyContent={"space-between"}
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.usersCount} Icon={<PersonIcon />} />
      <Widget title={"Chats"} value={stats?.groupsCount} Icon={<GroupIcon />} />
      <Widget
        title={"Messages"}
        value={stats?.messageCount}
        Icon={<MesssageIcon />}
      />
    </Stack>
  );

  // console.log("data", data);

  return (
    <AdminLayout>
      <Container component={"main"}>
        {AppBar}

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          flexWrap={"wrap"}
          justifyContent={"center"}
          alignItems={{
            xs: "center",
            lg: "stretch",
          }}
          sx={{ gap: "2rem" }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "2rem 1rem", // changes 2rem & 3.5rem to 2rem 1rem
              borderRadius: "1rem",
              width: "57%", // changes made for dashbaord from 100% to 60%
              maxWidth: "45rem",
            }}
          >
            <Typography>Last Messages</Typography>
            <LineChart value={stats?.messageChart || []} />
          </Paper>

          <Paper
            elevation={3}
            sx={{
              padding: "1rem",
              borderRadius: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: { xs: "100%", sm: "50%" },
              position: "relative",
              width: "100%",
              maxWidth: "25rem",
              height: "25rem",
            }}
          >
            <DoughnutChart
              labels={["Single Chats", "Group Chats"]}
              value={[
                stats?.totalChatsCount - stats?.groupChats || 0,
                stats?.groupChats || 0,
              ]}
            />

            <Stack
              position={"absolute"}
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={"0.5rem"}
              width={"100%"}
              height={"100%"}
            >
              <GroupIcon />
              <Typography>Vs</Typography>

              <PersonIcon />
            </Stack>
          </Paper>
        </Stack>

        {widgets}
      </Container>
    </AdminLayout>
  );
};

const Widget = ({ title, value, Icon }) => (
  <Paper
    elevation={3}
    sx={{
      padding: "2rem",
      margin: "2rem 0",
      borderRadius: "1.5rem",
      width: "20rem",
    }}
  >
    <Stack alignItems={"center"} spacing={"1rem"}>
      <Typography
        sx={{
          color: `${matBlack}`,
          borderRadius: "50%",
          border: `5px solid ${matBlack}`,
          width: "5rem",
          height: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </Typography>
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
);

export default Dashboard;
*/
