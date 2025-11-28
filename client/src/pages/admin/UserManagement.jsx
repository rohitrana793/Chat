import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { Avatar, Skeleton } from "@mui/material";
import { transformImage } from "../../lib/features";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

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
    renderCell: (params) => (
      <Avatar alt={params.row.name} src={params.row.avatar} sx={{ m: 0.7 }} />
    ),
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 150,
  },
];

function UserManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${server}/api/v1/admin/users`, {
          method: "GET",
          credentials: "include", // same as withCredentials: true
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        // console.log("Fetched data:", data);

        // handle both { users: [...] } and just [...]
        const users = Array.isArray(data) ? data : data.users;

        if (Array.isArray(users)) {
          setRows(
            users.map((i) => ({
              ...i,
              id: i._id,
              avatar: transformImage(i.avatar, 50),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useErrors([
    {
      isError: !!error,
      error: error,
    },
  ]);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton height={"100vh"} />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Table heading={"All Users"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
}

export default UserManagement;

/*
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { Avatar, Skeleton } from "@mui/material";
import { dashboardData } from "../../constants/sampleData";
import { transformImage } from "../../lib/features";
import { useFetchData } from "6pp";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

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
    renderCell: (params) => (
      <Avatar alt={params.row.name} src={params.row.avatar} sx={{ m: 0.7 }} />
    ),
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 150,
  },
];

function UserManagement() {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/users`,
    "dashboard-users",
    { withCredentials: true }
  );

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  console.log(data);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setRows(
        data.users.map((i) => ({
          ...i,
          id: i._id,
          avatar: transformImage(i.avatar, 50),
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Table heading={"All Users"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
}

export default UserManagement;
*/
