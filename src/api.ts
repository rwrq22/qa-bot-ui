import axios from "axios";
import Cookie from "js-cookie";

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api/v1/"
      : "https://backend.qabotjs.xyz/api/v1/",
  withCredentials: true,
});

export interface ISendMessageVariables {
  question: string;
}

export const createRoom = () =>
  instance
    .post(`room/`, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
      },
    })
    .then((response) => response.data);

export const getChatRoom = async () => {
  try {
    const response = await instance.get("room");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("ChatRoomNotFound");
    } else {
      // 다른 에러들 처리
      throw new Error("ChatRoomFetchError");
    }
  }
};

export const deleteChatRoom = () =>
  instance.delete("room/").then((response) => response.data);

export const getMessages = () =>
  instance.get("messages/").then((response) => response.data);

export const sendMessage = (variables: ISendMessageVariables) =>
  instance
    .post(`messages/`, variables, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
      },
    })
    .then((response) => response.data);

export const deleteMessages = () => instance.delete("messages");
