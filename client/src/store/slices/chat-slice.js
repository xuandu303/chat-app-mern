export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  channels: [],
  onlineUsers: [],
  unreadContacts: [],

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  markAsUnread: (id) => {
    const { unreadContacts } = get();
    if (!unreadContacts.includes(id)) {
      set({ unreadContacts: [...unreadContacts, id] });
    }
  },

  markAsRead: (id) => {
    const { unreadContacts } = get();
    set({ unreadContacts: unreadContacts.filter((cid) => cid !== id) });
  },

  setChannels: (channels) => set({ channels }),

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),

  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),

  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),

  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),

  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [...channels, channel] });
  },

  closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
    }),

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },

  updateContactLastMessage: (message) => {
    const { directMessagesContacts, userInfo } = get();

    const contactId =
      message.sender._id === userInfo.id
        ? message.recipient._id
        : message.sender._id;

    let updatedContacts;
    const existingContact = directMessagesContacts.find(
      (c) => c._id === contactId,
    );
    if (existingContact) {
      updatedContacts = directMessagesContacts.map((c) =>
        c._id === contactId
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              lastMessageType: message.messageType,
              lastMessageSenderId: message.sender._id,
            }
          : c,
      );
    } else {
      const newContact =
        message.sender._id === userInfo.id ? message.recipient : message.sender;

      updatedContacts = [
        {
          ...newContact,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          lastMessageType: message.messageType,
          lastMessageSenderId: message.sender._id,
        },
        ...directMessagesContacts,
      ];
    }
    updatedContacts.sort(
      (a, b) =>
        new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0),
    );

    set({ directMessagesContacts: updatedContacts });
  },

  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel) => channel._id === message.channelId);
    const index = channels.findIndex(
      (channel) => channel._id === message.channelId,
    );
    if (index !== -1 && index !== undefined) {
      channels.splice(index, 1);
      channels.unshift(data);
    }
  },
});
