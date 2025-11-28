import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import {
  deleteFilesFromCloudinary,
  emitEvent,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";

// =============================
// CREATE NEW GROUP CHAT
// =============================
const newGoupChat = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;

  // Prevent duplicate user IDs
  const allMembers = Array.from(
    new Set([...members.map((m) => m.toString()), req.user.toString()])
  );

  await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, allMembers);

  return res.status(201).json({
    success: true,
    message: "Group Created",
  });
});

// =============================
// GET MY CHATS (PRIVATE + GROUP)
// =============================
const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user })
    .populate("members", "name avatar")
    .lean();

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMembers = members.filter(
      (m) => m._id.toString() !== req.user.toString()
    );

    const otherMember = otherMembers.length ? otherMembers[0] : null;

    return {
      _id,
      groupChat,

      avatar: groupChat
        ? members.slice(0, 3).map((m) => m.avatar?.url || "/default.png")
        : [otherMember?.avatar?.url || "/default.png"],

      name: groupChat ? name : otherMember?.name || "Deleted User",

      members: otherMembers.map((m) => m._id),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

// =============================
// GET ONLY GROUPS I AM IN
// =============================
const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
    creator: req.user,
  }).populate("members", "name avatar");

  const groups = chats.map(({ members, _id, groupChat, name }) => ({
    _id,
    groupChat,
    name,
    avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
  }));

  return res.status(200).json({
    success: true,
    groups,
  });
});

// =============================
// ADD MEMBERS TO GROUP
// =============================
const addMembers = TryCatch(async (req, res, next) => {
  const { chatId, members } = req.body;

  if (!members || members.length < 1)
    return next(new ErrorHandler("Please provide members", 400));

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));
  if (chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("You are not allowed to add members", 403));

  const allNewMembers = await Promise.all(
    members.map((i) => User.findById(i, "name"))
  );

  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);

  if (chat.members.length > 100)
    return next(new ErrorHandler("Group members limit reached", 400));

  await chat.save();

  const allUsersName = allNewMembers.map((i) => i.name).join(", ");

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added in the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members Added Successfully",
  });
});

// =============================
// REMOVE MEMBER FROM GROUP
// =============================
const removeMember = TryCatch(async (req, res, next) => {
  const { userId, chatId } = req.body;

  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));
  if (chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("You are not allowed", 403));
  if (chat.members.length <= 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));

  const allChatMembers = chat.members.map((i) => i.toString());
  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, allChatMembers);

  return res.status(200).json({
    success: true,
    message: "Member Removed Successfully",
  });
});

// =============================
// LEAVE GROUP
// =============================
const leaveGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user.toString()
  );

  if (remainingMembers.length < 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));

  if (chat.creator.toString() === req.user.toString()) {
    const randomIndex = Math.floor(Math.random() * remainingMembers.length);
    chat.creator = remainingMembers[randomIndex];
  }

  chat.members = remainingMembers;
  const [user] = await Promise.all([
    User.findById(req.user, "name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, {
    chatId,
    message: `${user.name} has left the group`,
  });

  return res.status(200).json({
    success: true,
    message: "Left Group Successfully",
  });
});

// =============================
// SEND ATTACHMENTS
// =============================
const sendAttachments = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;
  const files = req.files || [];

  if (files.length < 1)
    return next(new ErrorHandler("Please upload attachments", 400));
  if (files.length > 5)
    return next(new ErrorHandler("Max 5 files allowed", 400));

  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "name"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));

  const attachments = await uploadFilesToCloudinary(files);

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };

  const message = await Message.create(messageForDB);

  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: {
      ...messageForDB,
      sender: { _id: me._id, name: me.name },
    },
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json({
    success: true,
    message,
  });
});

// =============================
// GET CHAT DETAILS
// =============================
const getChatDetails = TryCatch(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await Chat.findById(req.params.id)
      .populate("members", "name avatar")
      .lean();

    if (!chat) return next(new ErrorHandler("Chat Not Found", 404));

    chat.members = chat.members.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: avatar?.url || "/default.png",
    }));

    return res.status(200).json({ success: true, chat });
  }

  const chat = await Chat.findById(req.params.id);
  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));

  return res.status(200).json({ success: true, chat });
});

// =============================
// RENAME GROUP
// =============================
const renameGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { name } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("Not allowed", 403));

  chat.name = name;
  await chat.save();

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Group Renamed Successfully",
  });
});

// =============================
// DELETE CHAT
// =============================
const deleteChat = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat Not Found", 404));

  const members = chat.members;

  if (chat.groupChat && chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("Not Allowed", 403));

  if (!chat.groupChat && !chat.members.includes(req.user.toString()))
    return next(new ErrorHandler("Not Allowed", 403));

  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = messagesWithAttachments.flatMap(({ attachments }) =>
    attachments.map((a) => a.public_id)
  );

  await Promise.all([
    deleteFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Chat Deleted Successfully",
  });
});

// =============================
// GET MESSAGES
// =============================
const getMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { page = 1 } = req.query;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.members.includes(req.user.toString()))
    return next(new ErrorHandler("Not allowed", 403));

  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "name avatar")
      .populate("chat", "name groupChat members")
      .lean(),

    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage);

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalPages,
  });
});

export {
  newGoupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMember,
  leaveGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
};
