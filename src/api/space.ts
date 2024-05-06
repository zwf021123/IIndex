import myAxios from "@/requests/myAxios";
import { SpaceStateType } from "@/types/space";

export const getCurrentSpace = () => {
  return myAxios.post("/space/current");
};

export const updateSpace = (spaceData: SpaceStateType) => {
  return myAxios.post("/space/update", spaceData);
};
