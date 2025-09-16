import moment from "moment";

const fileFormat = (url = "") => {
  const fileExt = url.split(".").pop().toLowerCase();

  if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg")
    return "video";

  if (fileExt === "mp3" || fileExt === "wav") return "audio";

  if (
    fileExt === "png" ||
    fileExt === "jpg" ||
    fileExt === "jpeg" ||
    fileExt === "gif"
  )
    return "image";

  return "file";
};

const transformImage = (url = "", width = 100) => url;

const getLast7Days = () => {
  const currentDate = moment();
  const last7days = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = currentDate.clone().subtract(i, "days");
    const dayName = dayDate.format("dddd");
    last7days.unshift(dayName);
  }
  return last7days;
};

export { fileFormat, transformImage, getLast7Days };
