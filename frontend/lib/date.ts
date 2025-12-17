export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
