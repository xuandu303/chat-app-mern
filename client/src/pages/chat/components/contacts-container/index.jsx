import React, { useEffect } from "react";
import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";

const ContactsContainer = () => {
  const { setDirectMessagesContacts, directMessagesContacts, channels, setChannels } =
    useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {
        withCredentials: true,
      });

      if (response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      }
    };

    const getChannels = async () => {
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {
        withCredentials: true,
      });

      if (response.data.channels) {
        setChannels(response.data.channels);
      }
    };

    getContacts();
    getChannels();
  }, [setDirectMessagesContacts, setChannels]);

  return (
    <div className="relative sm:w-[35vw] lg:w-[26vw] xl:w-[22vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-5 pb-8 flex justify-center">
        <Logo />
      </div>
      <div className="flex flex-col gap-y-2 px-2">
        <div className="flex py-2 items-center px-3 justify-between">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
        {directMessagesContacts && directMessagesContacts.length > 0 && (
          <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={directMessagesContacts} />
          </div>
        )}

        <div className="flex py-2 items-center px-3 justify-between">
          <Title text="Channels" />
          <CreateChannel />
        </div>

        {channels && channels.length > 0 && (
          <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={channels} isChannel />
          </div>
        )}
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex justify-start items-center">
      <svg
        id="logo-38"
        width="70"
        height="24"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" className="ccustom" fill="#8338ec"></path>{" "}
        <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" className="ccompli1" fill="#975aed"></path>{" "}
        <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" className="ccompli2" fill="#a16ee8"></path>{" "}
      </svg>
      <span className="text-2xl font-bold ">ChatApp</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h2 className="uppercase tracking-widest text-neutral-400 font-light text-opacity-90 text-sm">
      {text}
    </h2>
  );
};
