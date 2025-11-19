import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import axios from "axios";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

// Функция для преобразования относительного пути фото в полный URL
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  // Если путь уже полный URL, возвращаем как есть
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  // Если путь начинается с /api, заменяем на полный базовый URL
  if (photoPath.startsWith("/api")) {
    return photoPath.replace(/^\/api/, API_BASE_URL);
  }
  // Если путь относительный, добавляем базовый URL
  return `${API_BASE_URL}${photoPath.startsWith("/") ? "" : "/"}${photoPath}`;
};

const MobileFooter = () => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Функция для загрузки фото пользователя из API
  const fetchProfilePhoto = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.data?.profile?.photo) {
        const photoUrl = getPhotoUrl(response.data.profile.photo);
        // Добавляем timestamp для обхода кэша браузера
        const photoUrlWithCacheBuster = `${photoUrl}?t=${Date.now()}`;
        setUserPhoto(photoUrlWithCacheBuster);
        setImageError(false); // Сбрасываем ошибку при успешной загрузке
      } else {
        // Если фото нет, сбрасываем состояние
        setUserPhoto(null);
        setImageError(false);
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
    }
  }, []);

  // Загружаем фото пользователя из API при монтировании
  useEffect(() => {
    fetchProfilePhoto();
  }, [fetchProfilePhoto]);

  // Слушаем событие обновления фото профиля
  useEffect(() => {
    const handleProfilePhotoUpdate = () => {
      console.log("Profile photo update event received in MobileFooter");
      fetchProfilePhoto();
    };

    window.addEventListener("profilePhotoUpdated", handleProfilePhotoUpdate);

    return () => {
      window.removeEventListener(
        "profilePhotoUpdated",
        handleProfilePhotoUpdate
      );
    };
  }, [fetchProfilePhoto]);
  return (
    <div className="bg-white bg-no-repeat custom-dropshadow footer-bg dark:bg-slate-700 flex justify-around items-center backdrop-filter backdrop-blur-[40px] fixed left-0 w-full z-[9999] bottom-0 py-[12px] px-4">
      {/* <NavLink to="chat">
        {({ isActive }) => (
          <div>
            <span
              className={` relative cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center mb-1
         ${isActive ? "text-primary-500" : "dark:text-white text-slate-900"}
          `}
            >
              <Icon icon="heroicons-outline:mail" />
              <span className="absolute right-[5px] lg:top-0 -top-2 h-4 w-4 bg-red-500 text-[8px] font-semibold flex flex-col items-center justify-center rounded-full text-white z-[99]">
                10
              </span>
            </span>
            <span
              className={` block text-[11px]
          ${
            isActive ? "text-primary-500" : "text-slate-600 dark:text-slate-300"
          }
          `}
            >
              Messages
            </span>
          </div>
        )}
      </NavLink> */}
      <NavLink
        to="profile"
        className="relative bg-white bg-no-repeat backdrop-filter backdrop-blur-[40px] rounded-full footer-bg dark:bg-slate-700 h-[65px] w-[65px] z-[-1] -mt-[40px] flex justify-center items-center"
      >
        {({ isActive }) => (
          <div
            className={`h-[50px] w-[50px] rounded-full relative left-[0px] top-[0px] custom-dropshadow ${
              isActive
                ? "border-2 border-primary-500"
                : "border-2 border-slate-100"
            }`}
          >
            {userPhoto && !imageError ? (
              <img
                src={userPhoto}
                alt=""
                className="w-full h-full rounded-full object-cover"
                onError={() => {
                  // При ошибке загрузки показываем иконку
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full">
                <Icon
                  icon="heroicons:user-circle"
                  className="text-slate-400 dark:text-slate-500 text-2xl"
                />
              </div>
            )}
          </div>
        )}
      </NavLink>
      <NavLink to="notifications">
        {({ isActive }) => (
          <div>
            <span
              className={` relative cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center mb-1
      ${isActive ? "text-primary-500" : "dark:text-white text-slate-900"}
          `}
            >
              <Icon icon="heroicons-outline:bell" />
              <span className="absolute right-[17px] lg:top-0 -top-2 h-4 w-4 bg-red-500 text-[8px] font-semibold flex flex-col items-center justify-center rounded-full text-white z-[99]">
                2
              </span>
            </span>
            <span
              className={` block text-[11px]
         ${isActive ? "text-primary-500" : "text-slate-600 dark:text-slate-300"}
        `}
            >
              Notifications
            </span>
          </div>
        )}
      </NavLink>
    </div>
  );
};

export default MobileFooter;
