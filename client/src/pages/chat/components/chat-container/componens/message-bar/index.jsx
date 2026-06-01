import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoCloseSharp } from "react-icons/io5";
import { HiDocumentText } from "react-icons/hi2";
import { formatFileSize } from "@/lib/utils";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
];

const MessageBar = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const { selectedChatType, selectedChatData, userInfo } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!socket) return;

    if (pendingFile) {
      await handleSendFile();
      return;
    }

    if (!message.trim()) return;

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

  const handleSendFile = async () => {
    if (!pendingFile || !socket) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", pendingFile);
      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200 && response.data) {
        const filePayload = {
          url: response.data.filePath,
          name: response.data.fileName,
          size: response.data.fileSize,
        };
        if (selectedChatType === "contact" && socket.connected) {
          socket.emit("sendMessage", {
            sender: userInfo.id,
            content: null,
            recipient: selectedChatData._id,
            messageType: "file",
            file: filePayload,
          });
        } else if (selectedChatType === "channel" && socket.connected) {
          socket.emit("sendChannelMessage", {
            sender: userInfo.id,
            content: null,
            messageType: "file",
            file: filePayload,
            channelId: selectedChatData._id,
          });
        }
        clearPendingFile();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const clearPendingFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isImage = IMAGE_TYPES.includes(file.type);
    setPendingFile(file);
    setPreviewUrl(isImage ? URL.createObjectURL(file) : null);
  };

  const canSend = !uploading && (!!pendingFile || !!message.trim());

  return (
    <div className="bg-[#1c1d25] px-8 mb-3">
      {pendingFile && (
        <div className="flex items-center gap-3 bg-[#2a2b33] rounded-2xl px-4 py-3 mb-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="h-20 w-20 object-cover rounded-xl flex-shrink-0"
            />
          ) : (
            <span className="text-white text-2xl bg-black/20 rounded-full p-2 flex-shrink-0">
              <HiDocumentText />
            </span>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white text-sm font-semibold truncate">{pendingFile.name}</span>
            <span className="text-gray-400 text-xs">{formatFileSize(pendingFile.size)}</span>
          </div>
          <button
            className="text-neutral-400 hover:text-white transition-colors flex-shrink-0"
            onClick={clearPendingFile}
          >
            <IoCloseSharp className="text-xl" />
          </button>
        </div>
      )}
      <div className="h-[10vh] flex justify-center items-center gap-3">
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
            disabled={!!pendingFile}
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
          className="bg-[#8417ff] focus:border-none flex items-center justify-center p-2.75 hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={!canSend}
        >
          <IoSend className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default MessageBar;
