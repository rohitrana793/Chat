import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { fileFormat, transformImage } from "../../lib/features";
import { Avatar, Box, Skeleton, Stack } from "@mui/material";
import moment from "moment";
import RenderAttachment from "../../components/shared/RenderAttachment";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => {
      const { attachments } = params.row;
      return attachments?.length > 0
        ? attachments.map((att, idx) => {
            const url = att.url;
            const file = fileFormat(url);
            return (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "black" }}
                >
                  {file === "image" ? (
                    <img
                      src={url}
                      alt="attachment"
                      width={70}
                      height={70}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                        marginTop: 5,
                      }}
                    />
                  ) : (
                    RenderAttachment(file, url)
                  )}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },
  },
  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
    renderCell: (params) => params.row.content || "No Content",
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => (
      <Stack direction="row" spacing="1rem" alignItems="center">
        <Avatar
          alt={params.row.sender?.name || "Unknown"}
          src={params.row.sender?.avatar || ""}
        />
        <span>{params.row.sender?.name || "Unknown"}</span>
      </Stack>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
    renderCell: (params) => {
      const chat = params.row.chat;
      return typeof chat === "string" ? chat : chat?.name || "Unknown Chat";
    },
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
    renderCell: (params) => (params.row.groupChat ? "Yes" : "No"),
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

function MessageManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useErrors([{ isError: !!error, error }]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${server}/api/v1/admin/messages`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        const messages = Array.isArray(data) ? data : data.messages;

        if (Array.isArray(messages)) {
          setRows(
            messages.map((msg) => ({
              id: msg._id,
              content: msg.content || "No Content",
              chat: msg.chat?.name || msg.chat || "Unknown Chat",
              groupChat: msg.groupChat,
              attachments: msg.attachments || [],
              sender: {
                name: msg.sender?.name || "Unknown",
                avatar: transformImage(msg.sender?.avatar, 50),
              },
              createdAt: moment(msg.createdAt).format(
                "MMMM Do YYYY, h:mm:ss a"
              ),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton variant="rectangular" height={"100vh"} />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Table
          heading={"All Messages"}
          columns={columns}
          rows={rows}
          rowHeight={80}
        />
      )}
    </AdminLayout>
  );
}

export default MessageManagement;

/*
// original code

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { fileFormat, transformImage } from "../../lib/features";
import { Avatar, Box, Skeleton, Stack } from "@mui/material";
import moment from "moment";
import RenderAttachment from "../../components/shared/RenderAttachment";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => {
      const { attachments } = params.row;
      return attachments?.length > 0
        ? attachments.map((i, idx) => {
            const url = i.url;
            const file = fileFormat(url);
            return (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "black" }}
                >
                  {file === "image" ? (
                    <img
                      src={url}
                      alt="attachment"
                      width={70}
                      height={70}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                        marginTop: 5,
                      }}
                    />
                  ) : (
                    RenderAttachment(file, url)
                  )}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },
  },
  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => (
      <Stack direction="row" spacing="1rem" alignItems="center">
        <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
        <span>{params.row.sender.name}</span>
      </Stack>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

function MessageManagement() {
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
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${server}/api/v1/admin/messages`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        // console.log(data);

        // Handle both { messages: [...] } and just [...]
        const messages = Array.isArray(data) ? data : data.messages;

        if (Array.isArray(messages)) {
          setRows(
            messages.map((i) => ({
              ...i,
              id: i._id,
              sender: {
                name: i.sender.name,
                avatar: transformImage(i.sender.avatar, 50),
              },
              createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton variant="rectangular" height={"100vh"} />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Table
          heading={"All Messages"}
          columns={columns}
          rows={rows}
          rowHeight={80}
        />
      )}
    </AdminLayout>
  );
}

export default MessageManagement;

*/

/*
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { dashboardData } from "../../constants/sampleData";
import { fileFormat, transformImage } from "../../lib/features";
import { Avatar, Box, Skeleton, Stack } from "@mui/material";
import moment from "moment";
import RenderAttachment from "../../components/shared/RenderAttachment";
import { useErrors } from "../../hooks/hook";
import { server } from "../../constants/config";
import { useFetchData } from "6pp";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => {
      const { attachments } = params.row;
      return attachments?.length > 0
        ? attachments.map((i, idx) => {
            const url = i.url;
            const file = fileFormat(url);

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "black" }}
                >
                  {file === "image" ? (
                    <img
                      src={url}
                      alt="attachment"
                      width={70}
                      height={70}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                        marginTop: "5px",
                      }}
                    />
                  ) : (
                    RenderAttachment(file, url)
                  )}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },

    
    renderCell: (params) => {
      const { attachments } = params.row;
      return attachments?.length > 0
        ? attachments.map((i) => {
            const url = i.url;
            const file = fileFormat(url);
            return (
              <Box>
                <a
                  href={url}
                  download
                  target="_blank"
                  style={{
                    color: "black",
                  }}
                >
                  {RenderAttachment(file, url)}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },
    
  },
  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => (
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
        <span>{params.row.sender.name}</span>
      </Stack>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

function MessageManagement() {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/messages`,
    "dashboard-messages",
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
        data.messages.map((i) => ({
          ...i,
          id: i._id,
          sender: {
            name: i.sender.name,
            avatar: transformImage(i.sender.avatar, 50),
          },
          createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Table
          heading={"All Messages"}
          columns={columns}
          rows={rows}
          rowHeight={80}
        />
      )}
    </AdminLayout>
  );
}

export default MessageManagement;

*/
