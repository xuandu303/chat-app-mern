import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (!userInfo) return;

    socketRef.current = io(HOST, {
      withCredentials: true,
      query: { userId: userInfo.id },
    });

    setSocket(socketRef.current);

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    const handleOnlineUsers = (users) => {
      const { setOnlineUsers } = useAppStore.getState();
      setOnlineUsers(users);
    };

    const handleReceiveMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        updateContactLastMessage,
        markAsUnread,
        userInfo,
      } = useAppStore.getState();
      updateContactLastMessage(message);
      const isCurrentChat =
        selectedChatType !== undefined &&
        (selectedChatData._id === message.sender._id ||
          selectedChatData._id === message.recipient._id);
      if (isCurrentChat) {
        addMessage(message);
      } else if (message.sender._id !== userInfo.id) {
        const contactId = message.sender._id;
        markAsUnread(contactId);
      }
    };

    const handleReceiveChannelMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        addChannelInChannelList,
        markAsUnread,
      } = useAppStore.getState();
      const isCurrentChat =
        selectedChatType !== undefined &&
        selectedChatData._id === message.channelId;
      if (isCurrentChat) {
        addMessage(message);
      } else {
        markAsUnread(message.channelId);
      }
      addChannelInChannelList(message);
    };

    socketRef.current.on("onlineUsers", handleOnlineUsers);
    socketRef.current.on("receiveMessage", handleReceiveMessage);
    socketRef.current.on("receiveChannelMessage", handleReceiveChannelMessage);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
