import axios from "axios";

import { ROOT_URL } from "@/constants/translate";

const translate = axios.create({
  baseURL: `${ROOT_URL}/translate`,
});

translate.interceptors.response.use((response) => {
  if (response.status === 200) {
    const { data } = response;
    return Promise.resolve(data);
  }
  return Promise.reject(response);
});

export default translate;
