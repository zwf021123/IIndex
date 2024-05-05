import myAxios from "@/requests/myAxios";

export const getCurrentSpace = () => {
  return myAxios.post("/space/current");
};
