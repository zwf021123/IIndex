import translate from "@/requests/translate";
import { enBase64 } from "@/utils/base64";

export const getNamedVariables = async (searchText: string) => {
  const s = enBase64(searchText);
  const params = {
    s,
  };
  const res = await translate("", { params });
  return res;
};
