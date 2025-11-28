import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { Avatar, Skeleton, Stack } from "@mui/material";
import { transformImage } from "../../lib/features";
import AvatarCard from "../../components/shared/AvatarCard";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 230,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "groupChat",
    headerName: "Group",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    headerClassName: "table-header",
    width: 300,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 250,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
        <span>{params.row.creator.name}</span>
      </Stack>
    ),
  },
];

function ChatManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useErrors([
    {
      isError: !!error,
      error: error,
    },
  ]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${server}/api/v1/admin/chats`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        // console.log(data);

        // Handle both { chats: [...] } and just [...]
        const chats = Array.isArray(data) ? data : data.chats;

        if (Array.isArray(chats)) {
          setRows(
            chats.map((i) => ({
              ...i,
              id: i._id,
              avatar: i.avatar.map((img) => transformImage(img, 50)),
              members: i.members.map((m) => transformImage(m.avatar, 50)),
              creator: {
                name: i.creator.name,
                avatar: transformImage(i.creator.avatar, 50),
              },
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton variant="rectangular" height={"100vh"} />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Table heading={"All Chats"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
}

export default ChatManagement;

/*
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { Avatar, Skeleton, Stack } from "@mui/material";
import { transformImage } from "../../lib/features";
import AvatarCard from "../../components/shared/AvatarCard";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";
import { useFetchData } from "6pp";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 130,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 300,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    headerClassName: "table-header",
    width: 300,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 250,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
        <span>{params.row.creator.name}</span>
      </Stack>
    ),
  },
];

function ChatManagement() {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/chats`,
    "dashboard-chats",
    { withCredentials: true }
  );

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setRows(
        data.chats.map((i) => ({
          ...i,
          id: i._id,
          avatar: i.avatar.map((i) => transformImage(i, 50)),
          members: i.members.map((i) => transformImage(i.avatar, 50)),
          creator: {
            name: i.creator.name,
            avatar: transformImage(i.creator.avatar, 50),
          },
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Table heading={"All Chats"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
}

export default ChatManagement;
*/
