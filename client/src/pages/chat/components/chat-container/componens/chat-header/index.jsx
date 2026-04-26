import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { IoClose } from "react-icons/io5";
import { getColor, resolveUrl } from "@/lib/utils";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, onlineUsers } = useAppStore();
  const isOnline = selectedChatType === "contact" && onlineUsers.includes(selectedChatData._id);
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-8">
      <div className="flex gap-5 items-center justify-between w-full">
        <div className="flex gap-3 items-center justify-center">
          <div className="h-10 w-10 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={resolveUrl(selectedChatData.image)}
                    alt="profile"
                    className="object-cover rounded-full w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-10 w-10 text-lg border-1px flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color,
                    )}`}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName.split("").shift()
                      : selectedChatData.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span>
              {selectedChatType === "channel" && selectedChatData.name}
              {selectedChatType === "contact" && selectedChatData.firstName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData.email}
            </span>
            {selectedChatType === "contact" && (
              <span className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-5 items-center justify-center">
          <button
            className="text-neutral-500 focus:border-none cursor-pointer focus:outline-none focus:text-white duration-300 transition-all"
            onClick={closeChat}
          >
            <IoClose className="text-3xl hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
