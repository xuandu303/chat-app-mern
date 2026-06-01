import React from "react";
import ChatHeader from "./componens/chat-header";
import MessageBar from "./componens/message-bar";
import MessageContainer from "./componens/message-container";
import MediaPanel from "./componens/media-panel";
import { useAppStore } from "@/store";

const ChatContainer = () => {
  const { showMediaPanel } = useAppStore();
  return (
    <div className="fixed top-0 h-screen w-screen bg-[#1c1d25] flex md:static md:flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader />
        <MessageContainer />
        <MessageBar />
      </div>
      {showMediaPanel && <MediaPanel />}
    </div>
  );
};

export default ChatContainer;
