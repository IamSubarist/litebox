import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogin } from "./common/store";

const TestAuthButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleTestAuth = async () => {
    try {
      // Получаем данные Telegram из localStorage
      const telegramData = localStorage.getItem("telegram_auth_data");
      if (!telegramData) {
        return;
      }

      const userData = JSON.parse(telegramData);

      // Отправляем данные на API
      const response = await axios.post(
        "https://socialdash.leverageindo.group/api/auth",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Получаем токен из заголовков
      const authToken =
        response.headers["Authorization"] ||
        response.headers["authorization"] ||
        response.headers["X-Auth-Token"] ||
        response.headers["x-auth-token"];

      if (authToken) {
        // Сохраняем токен в localStorage
        localStorage.setItem("authToken", authToken);
        // Создаем объект пользователя с флагом авторизации
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userData,
            isAuthenticated: true,
          })
        );

        // Сохраняем данные пользователя и магазины из ответа API
        if (response.data) {
          if (response.data.user) {
            localStorage.setItem(
              "userInfo",
              JSON.stringify(response.data.user)
            );
          }
        }

        // Перенаправляем на главную страницу
        dispatch(handleLogin(true));
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
      }
    } catch (error) {}
  };

  return (
    <button
      onClick={handleTestAuth}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        width: "361px",
        height: "36px",
        background: "#00852c",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Тестовая авторизация
    </button>
  );
};

export default TestAuthButton;
