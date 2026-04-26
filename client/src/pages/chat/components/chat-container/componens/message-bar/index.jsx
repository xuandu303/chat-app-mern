import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const { selectedChatType, selectedChatData, userInfo } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    console.log({
      sender: userInfo.id,
      content: message,
      messageType: "text",
      file: undefined,
      channelId: selectedChatData._id,
    });
    if (!socket || !message.trim()) return;

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        file: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("sendChannelMessage", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        file: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
    setEmojiPickerOpen(false);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 200 && response.data) {
          if (selectedChatType === "contact" && socket?.connected) {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: null,
              recipient: selectedChatData._id,
              messageType: "file",
              file: {
                url: response.data.filePath,
                name: response.data.fileName,
                size: response.data.fileSize,
              },
            });
          } else if (selectedChatType === "channel" && socket?.connected) {
            socket.emit("sendChannelMessage", {
              sender: userInfo.id,
              content: null,
              messageType: "file",
              file: {
                url: response.data.filePath,
                name: response.data.fileName,
                size: response.data.fileSize,
              },
              channelId: selectedChatData._id,
            });
          }
          event.target.value = null;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-3 gap-3">
      <div className="flex-1 flex bg-[#2a2b33] rounded-full items-center gap-4 pr-6">
        <input
          type="text"
          className="flex-1 p-2 px-4 bg-transparent rounded-full focus:border-none focus:outline-none"
          placeholder="Aa"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-xl hover:text-white" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all flex items-center"
            onClick={() => setEmojiPickerOpen((prev) => !prev)}
          >
            <RiEmojiStickerLine className="text-2xl hover:text-white" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              ref={emojiRef}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] focus:border-none flex items-center justify-center p-2.75 hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all rounded-full cursor-pointer"
        onClick={handleSendMessage}
        disabled={!message.trim()}
      >
        <IoSend className="text-xl" />
      </button>
    </div>
  );
};

export default MessageBar;
