import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTES,
  GET_CHANNEL_MESSAGES,
} from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HiDocumentText } from "react-icons/hi2";
import { formatFileSize, formatLastMessageTime, resolveUrl } from "@/lib/utils";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MessageContainer = () => {
  const containerRef = useRef(null);
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
  } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTES,
          { id: selectedChatData._id },
          { withCredentials: true },
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true },
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, [selectedChatMessages.length]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpeg|jpg|gif|png|bmp|tiff|tif|svg|webp|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    let showAvatar;
    let showName;
    return selectedChatMessages.map((message, idx) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      if (selectedChatType === "channel") {
        const nextMessage = selectedChatMessages[idx + 1];

        showAvatar =
          !nextMessage || nextMessage.sender._id !== message.sender._id;

        const prevMessage = selectedChatMessages[idx - 1];

        showName =
          !prevMessage || prevMessage.sender._id !== message.sender._id;
      }

      return (
        <div key={message._id}>
          {showDate && (
            <div className="text-center text-gray-500 font-semibold text-sm my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message, idx)}
          {selectedChatType === "channel" &&
            renderChannelMessages(message, idx, showAvatar, showName)}
        </div>
      );
    });
  };

  const downloadFile = async (url, name) => {
    const fullUrl = resolveUrl(url);
    const response = await fetch(fullUrl);
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
  };

  const renderDMMessages = (message, idx) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      } mt-1.75`}
    >
      <HoverCard>
        <HoverCardTrigger className="h-auto w-auto inline-block">
          {message.messageType === "text" && (
            <>
              <div
                className={`${
                  message.sender !== selectedChatData._id
                    ? "bg-[#8417ff] text-white"
                    : " bg-gray-500/50 text-white/80"
                } inline-block py-1.5 px-2.5 rounded-full wrap-break-word`}
              >
                {message.content}
              </div>
            </>
          )}
          {message.messageType === "file" && (
            <div
              className={`${
                message.sender !== selectedChatData._id
                  ? "bg-white/20 text-white"
                  : "bg-gray-500/50 text-white/80"
              }  block max-w-none h-auto rounded-[18px] wrap-break-word leading-none`}
            >
              {checkIfImage(message.file.url) ? (
                <div
                  className="relative cursor-pointer group"
                  onClick={() => {
                    setShowImage(true);
                    setImage({
                      url: message.file.url,
                      name: message.file.name,
                    });
                  }}
                >
                  <img
                    className="object-cover rounded-[18px]"
                    src={resolveUrl(message.file.url)}
                    height={300}
                    width={300}
                  />
                  <div className="absolute inset-0 rounded-[18px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center gap-2.5 cursor-pointer p-2.5 px-3"
                  onClick={() =>
                    downloadFile(message.file.url, message.file.name)
                  }
                >
                  <span className="text-white text-[17px] bg-black/20 rounded-full p-2">
                    <HiDocumentText />
                  </span>
                  <div className="flex flex-col items-start justify-center gap-1">
                    <span className="whitespace-nowrap text-[15px] font-semibold">
                      {message.file.name}
                    </span>{" "}
                    <span className="text-xs text-gray-200/50">
                      {formatFileSize(message.file.size)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </HoverCardTrigger>
        <HoverCardContent
          side={`${message.sender === selectedChatData._id ? "right" : "left"}`}
          align="center"
          className="bg-gray-200 p-2 rounded-lg shadow-lg text-xs"
        >
          {moment(message.timestamp).format("LT")}
        </HoverCardContent>
      </HoverCard>
      {selectedChatMessages.length === idx + 1 && (
        <div
          className={`${message.sender === selectedChatData._id ? "ml-2.5" : "mr-2.5"} text-xs text-gray-500 font-semibold`}
        >
          Sent {formatLastMessageTime(message.timestamp)} ago
        </div>
      )}
    </div>
  );

  const renderChannelMessages = (message, idx, showAvatar, showName) => (
    <div
      className={`flex flex-col gap-px ${
        message.sender._id !== userInfo.id ? "items-start" : "items-end"
      } mt-1`}
    >
      <HoverCard>
        <HoverCardTrigger className="h-auto w-auto inline-flex">
          <div className="flex gap-2 items-end">
            {message.sender._id !== userInfo.id &&
              (showAvatar ? (
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="w-8 h-8 rounded-full overflow-hidden">
                    {message.sender.image && (
                      <AvatarImage
                        src={resolveUrl(message.sender.image)}
                        alt="profile"
                        className="object-cover rounded-full w-full h-full bg-black"
                      />
                    )}
                    <AvatarFallback
                      className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                        message.sender.color,
                      )}`}
                    >
                      {message.sender.firstName
                        ? message.sender.firstName.split("").shift()
                        : message.sender.email.split("").shift()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="w-8 h-8"></div>
              ))}

            <div className="flex flex-col max-w-[60vw]">
              {message.sender._id !== userInfo.id && showName && (
                <div className="text-xs text-white/60 ml-2.5">{`${message.sender.firstName}`}</div>
              )}

              <div>
                {message.messageType === "text" && (
                  <div
                    className={`${
                      message.sender._id === userInfo.id
                        ? "bg-[#8417ff] text-white"
                        : " bg-gray-500/50 text-white/80"
                    } inline-block py-1.5 px-2.5 rounded-full wrap-break-word`}
                  >
                    {message.content}
                  </div>
                )}
                {message.messageType === "file" && (
                  <div
                    className={`${
                      message.sender._id === userInfo.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-500/50 text-white/80"
                    }  block max-w-none h-auto rounded-[18px] wrap-break-word leading-none`}
                  >
                    {checkIfImage(message.file.url) ? (
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => {
                          setShowImage(true);
                          setImage({
                            url: message.file.url,
                            name: message.file.name,
                          });
                        }}
                      >
                        <img
                          className="object-cover rounded-[18px]"
                          src={resolveUrl(message.file.url)}
                          height={300}
                          width={300}
                        />
                        <div className="absolute inset-0 rounded-[18px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center gap-2.5 cursor-pointer p-2.5 px-3"
                        onClick={() =>
                          downloadFile(message.file.url, message.file.name)
                        }
                      >
                        <span className="text-white text-[17px] bg-black/20 rounded-full p-2">
                          <HiDocumentText />
                        </span>
                        <div className="flex flex-col items-start justify-center gap-1">
                          <span className="whitespace-nowrap text-[15px] font-semibold">
                            {message.file.name}
                          </span>{" "}
                          <span className="text-xs text-gray-200/50">
                            {formatFileSize(message.file.size)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side={`${message.sender._id !== userInfo.id ? "right" : "left"}`}
          align="center"
          className="bg-gray-200 p-2 rounded-lg shadow-lg text-xs"
        >
          {moment(message.timestamp).format("LT")}
        </HoverCardContent>
      </HoverCard>
      {selectedChatMessages.length === idx + 1 && (
        <div
          className={`${message.sender._id !== userInfo.id ? "ml-12.5" : "mr-2.5"} text-xs text-gray-500 font-semibold leading-none`}
        >
          Sent {formatLastMessageTime(message.timestamp)} ago
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar px-8 w-full"
    >
      {renderMessages()}
      {showImage && (
        <div className="fixed inset-0 z-1000 flex items-start justify-center overflow-hidden">
          <img
            src={resolveUrl(image.url)}
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl"
            alt=""
            onLoad={() => {
              const el = containerRef.current;
              if (el) el.scrollTop = el.scrollHeight;
            }}
          />

          <div className="absolute inset-0 bg-black/60" />

          <img
            src={resolveUrl(image.url)}
            className="relative z-10 top-3 max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            alt=""
          />

          <div className="fixed top-3 right-6 z-20 flex gap-2">
            <button
              className="bg-black/40 p-1.5 text-2xl rounded-full hover:bg-white/5 transition-all cursor-pointer"
              onClick={() => downloadFile(image.url, image.name)}
            >
              <IoMdArrowRoundDown />
            </button>

            <button
              className="bg-black/40 p-1.5 text-2xl rounded-full hover:bg-white/5 transition-all cursor-pointer"
              onClick={() => {
                setShowImage(false);
                setImage(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
