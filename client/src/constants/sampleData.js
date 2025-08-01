export const sampleChats = [
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Doe",
    _id: "1",
    groupChat: false,
    members: ["1", "2"],
  },
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Boi",
    _id: "2",
    groupChat: true,
    members: ["1", "2"],
  },
];

export const sampleUsers = [
  {
    avatar: "https://www.w3schools.com/howto/img_avatar.png",
    name: "John Doe",
    _id: "1",
  },
  {
    avatar: "https://www.w3schools.com/howto/img_avatar.png",
    name: "John Boi",
    _id: "2",
  },
];

export const sampleNotifications = [
  {
    sender: {
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      name: "John Doe",
    },
    _id: "1",
  },
  {
    sender: {
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      name: "John Boi",
    },
    _id: "2",
  },
];

export const sampleMessage = [
  {
    attachments: [],
    content: "ka ko mads la",
    _id: "asdaskdnaskldnkasd",
    sender: {
      _id: "user._id",
      name: "chamma",
    },
    chat: "chatId",
    createdAt: "2025-07-27T18:15:00.000Z",
  },
  {
    attachments: [
      {
        public_id: "assfd 2",
        url: "https://www.w3schools.com/howto/img_avatar.png",
      },
    ],
    content: "",
    _id: "asdaskdnaskldnssskasd",
    sender: {
      _id: "asdasdasd",
      name: "chamma 2",
    },
    chat: "chatId",
    createdAt: "2025-07-27T18:15:00.000Z",
  },
];
