import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import animationData from "@/assets/lottie-json";
import moment from "moment";
import { HOST } from "@/utils/constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]",
  "bg-[#fd60a2a] text-[#ffd60a] border-[1px] border-[#ffd60abb]",
  "bg-[#06d6a02a] text-[#06d6a0] border-[1px] border-[#06d6a0bb]",
  "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]",
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0];
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
};

/**
 * @param {string | Date} time
 * @returns {string}
 */

export const formatLastMessageTime = (time) => {
  if (!time) return "";

  const now = moment();
  const messageTime = moment(time);

  const diffMinutes = now.diff(messageTime, "minutes");
  const diffHours = now.diff(messageTime, "hours");
  const diffDays = now.diff(messageTime, "days");

  if (diffMinutes < 1) return "1m";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays <= 7) return `${diffDays}d`;

  const diffWeeks = now.diff(messageTime, "weeks");
  return `${diffWeeks}w`;
};

/**
 * @param {number} bytes
 * @returns {string}
 */

export const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${HOST}/${url}`;
};

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${sizes[i]}`;
}
