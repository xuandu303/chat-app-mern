import mongoose from "mongoose";
import Channel from "../models/channelModel.js";
import User from "../models/userModel.js";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).json({ message: "Admin user not found." });
    }

    const validMembers = await User.find({
      _id: { $in: members },
    });

    if (validMembers.length !== members.length) {
      return res
        .status(400)
        .json({ message: "Some members are not valid users." });
    }

    const newChannel = await Channel.create({
      name,
      members,
      admin: userId,
    });

    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Create channel error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);

    const channels = await Channel.aggregate([
      {
        $match: {
          $or: [{ admin: userId }, { members: userId }],
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { messageIds: "$messages" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$messageIds"] },
              },
            },
            { $sort: { timestamp: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: "users",
                let: { senderId: "$sender" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$senderId"] },
                    },
                  },
                  {
                    $project: {
                      password: 0,
                      __v: 0,
                      email: 0,
                    },
                  },
                ],
                as: "sender",
              },
            },
            {
              $unwind: {
                path: "$sender",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "lastMessage",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
        },
      },
      {
        $project: {
          name: 1,
          admin: 1,
          members: 1,
          lastMessageType: "$lastMessage.messageType",
          lastMessageTime: "$lastMessage.timestamp",
          lastMessage: "$lastMessage.content",
          lastMessageSender: "$lastMessage.sender",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({ channels });
  } catch (error) {
    console.error("Create channel error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const messages = channel.messages;
    return res.status(201).json({ messages });
  } catch (error) {
    console.error("Create channel error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
