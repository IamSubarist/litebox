import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import telegram from "@/assets/images/icon/telegram.svg";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

const TgBindButton = ({ userAuths = {}, onSuccess }) => {
  const navigate = useNavigate();

  // Проверяем, привязан ли Telegram
  // Поддерживаем как старую структуру (boolean), так и новую (объект с status и username)
  const telegramAuthData = userAuths?.telegram;
  const isTelegramBound =
    typeof telegramAuthData === "object" && telegramAuthData !== null
      ? telegramAuthData.status === true
      : telegramAuthData === true;

  // Получаем классы для иконки (логика из SocialProfile)
  const getIconClassName = () => {
    return isTelegramBound
      ? "w-9 h-9 rounded-full"
      : "w-9 h-9 grayscale-[100%] opacity-75 hover:grayscale-0 hover:opacity-100 duration-300 rounded-full";
  };

  // Получаем классы для ссылки (логика из SocialProfile)
  const getLinkClassName = () => {
    const baseClasses =
      "inline-flex h-9 w-9 text-white text-2xl flex-col items-center justify-center rounded-full max-[640px]:w-8 max-[640px]:h-8";
    return isTelegramBound ? `${baseClasses} bg-[#0A63BC]` : `${baseClasses}`;
  };

  const sendAuthData = async () => {
    try {
      // Получаем данные Telegram из localStorage
      const telegramData = localStorage.getItem("telegram_auth_data");
      if (!telegramData) {
        return false;
      }

      const userData = JSON.parse(telegramData);
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Please login first");
        return false;
      }

      await axios.post(`${API_BASE_URL}/user/bind_login`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      return true;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to bind Telegram account";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleTelegramAuth = () => {
    if (!window.Telegram?.Login) {
      toast.error("Telegram Login not available");
      return;
    }

    window.Telegram.Login.auth(
      { bot_id: 8550346062, request_access: true },
      async function (user) {
        if (!user) {
          return;
        }

        // Сначала сохраняем данные Telegram в localStorage
        localStorage.setItem("telegram_auth_data", JSON.stringify(user));

        // Затем отправляем данные на API (беря их из localStorage)
        const authSuccess = await sendAuthData();

        if (authSuccess) {
          toast.success("Telegram успешно привязан");
          if (typeof onSuccess === "function") {
            try {
              await onSuccess();
            } catch (error) {
              console.error("Error in onSuccess callback:", error);
            }
          }
          // Редирект в профиль после успешной привязки
          setTimeout(() => {
            navigate("/profile");
          }, 1500);
        }
      }
    );
  };

  return (
    <li
      onClick={handleTelegramAuth}
      className="flex-1 hover:scale-110 duration-300 cursor-pointer"
    >
      <a href="#" className={getLinkClassName()}>
        <img src={telegram} alt="Telegram" className={getIconClassName()} />
      </a>
    </li>
  );
};

export default TgBindButton;
