import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "./common/store";
import telegram from "@/assets/images/icon/telegram.svg";

const TelegramLoginButton = () => {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // const handleTelegramAuth = () => {
  //   if (!window.Telegram?.Login) {
  //     console.error("Telegram Login not loaded yet");
  //     return;
  //   }

  //   window.Telegram.Login.auth(
  //     { bot_id: 8550346062, request_access: true },
  //     async function (user) {
  //       if (!user) {
  //         console.log("Авторизация не удалась");
  //         return;
  //       }
  //       console.log("Telegram user data:", user);
  //       localStorage.setItem("telegramUser", JSON.stringify(user));
  //       localStorage.setItem("telegram_auth_data", JSON.stringify(user));

  //       const isAuthorized = await sendAuthData();

  //       if (isAuthorized) {
  //         console.log("Успешная авторизация: " + user.first_name);
  //         dispatch(handleLogin(true));
  //         setTimeout(() => {
  //           navigate("/dashboard");
  //         }, 1500);
  //       } else {
  //         console.log("Не удалось выполнить авторизацию");
  //       }
  //     }
  //   );
  // };

  // const sendAuthData = async () => {
  //   try {
  //     // Получаем данные Telegram из localStorage
  //     const telegramData = localStorage.getItem("telegram_auth_data");
  //     if (!telegramData) {
  //       return false;
  //     }

  //     const userData = JSON.parse(telegramData);

  //     const response = await axios.post(
  //       "https://socialdash.leverageindo.group/api/auth",
  //       userData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     // Получаем токен из заголовков
  //     const authToken =
  //       response.headers["Authorization"] ||
  //       response.headers["authorization"] ||
  //       response.headers["X-Auth-Token"] ||
  //       response.headers["x-auth-token"];

  //     if (authToken) {
  //       // Сохраняем токен в localStorage
  //       localStorage.setItem("authToken", authToken);
  //       // Создаем объект пользователя с флагом авторизации
  //       localStorage.setItem(
  //         "user",
  //         JSON.stringify({
  //           ...userData,
  //           isAuthenticated: true,
  //         })
  //       );

  //       // Сохраняем данные пользователя и магазины из ответа API
  //       if (response.data) {
  //         if (response.data.user) {
  //           localStorage.setItem(
  //             "userInfo",
  //             JSON.stringify(response.data.user)
  //           );
  //         }
  //       }

  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     return false;
  //   }
  // };

  return (
    <li
      // onClick={handleTelegramAuth}
      className="flex-1 hover:scale-110 duration-300"
    >
      <a
        // href="#"
        className="inline-flex h-10 w-10 bg-[#0A63BC] text-white text-2xl flex-col items-center justify-center rounded-full"
      >
        <img src={telegram} alt="" />
      </a>
    </li>
  );
};

export default TelegramLoginButton;
