import { useAppStore } from "@/store";
import { checkIfImage, formatFileSize, resolveUrl } from "@/lib/utils";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoMdArrowRoundDown } from "react-icons/io";
import { HiDocumentText } from "react-icons/hi2";

const MediaPanel = () => {
  const { selectedChatMessages, toggleMediaPanel } = useAppStore();
  const [tab, setTab] = useState("media");
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState(null);

  const fileMsgs = selectedChatMessages.filter((m) => m.messageType === "file" && m.file?.url);
  const images = [...fileMsgs].reverse().filter((m) => checkIfImage(m.file.url));
  const files = [...fileMsgs].reverse().filter((m) => !checkIfImage(m.file.url));

  const downloadFile = async (url, name) => {
    const response = await fetch(resolveUrl(url));
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <>
      <div className="w-72 h-full bg-[#16171e] border-l border-[#2f303b] flex flex-col flex-shrink-0">
        <div className="h-[10vh] flex items-center justify-between px-4 border-b border-[#2f303b]">
          <span className="text-white font-semibold text-sm">Kho lưu trữ</span>
          <button
            className="text-neutral-400 hover:text-white transition-colors"
            onClick={toggleMediaPanel}
          >
            <IoCloseSharp className="text-xl" />
          </button>
        </div>

        <div className="flex border-b border-[#2f303b]">
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === "media"
                ? "text-white border-b-2 border-[#8417ff]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setTab("media")}
          >
            Ảnh ({images.length})
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === "files"
                ? "text-white border-b-2 border-[#8417ff]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setTab("files")}
          >
            File ({files.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tab === "media" && (
            <div className="p-2">
              {images.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                  Chưa có ảnh nào
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {images.map((msg) => (
                    <div
                      key={msg._id}
                      className="aspect-square cursor-pointer overflow-hidden rounded-md group relative"
                      onClick={() => {
                        setImage({ url: msg.file.url, name: msg.file.name });
                        setShowImage(true);
                      }}
                    >
                      <img
                        src={resolveUrl(msg.file.url)}
                        alt={msg.file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "files" && (
            <div className="flex flex-col gap-1 p-2">
              {files.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                  Chưa có file nào
                </div>
              ) : (
                files.map((msg) => (
                  <div
                    key={msg._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#2a2b33] hover:bg-[#32333d] cursor-pointer transition-colors group"
                    onClick={() => downloadFile(msg.file.url, msg.file.name)}
                  >
                    <span className="text-white text-lg bg-black/20 rounded-full p-2 flex-shrink-0">
                      <HiDocumentText />
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-white text-xs font-semibold truncate">
                        {msg.file.name}
                      </span>
                      <span className="text-gray-400 text-xs">{formatFileSize(msg.file.size)}</span>
                    </div>
                    <IoMdArrowRoundDown className="text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showImage && image && (
        <div className="fixed inset-0 z-1000 flex items-start justify-center overflow-hidden">
          <img
            src={resolveUrl(image.url)}
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl"
            alt=""
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
    </>
  );
};

export default MediaPanel;
