import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogout } from "@/pages/auth/common/store";
import { useState, useEffect, useCallback } from "react";
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

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Функция для обновления имени из localStorage
  const updateFullName = () => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo.full_name) {
          setFullName(userInfo.full_name);
        }
      } catch (error) {
        console.error("Error parsing userInfo:", error);
      }
    }
  };

  // Получаем имя пользователя из localStorage при монтировании
  useEffect(() => {
    updateFullName();
  }, []);

  // Слушаем изменения в localStorage (для синхронизации между вкладками)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userInfo") {
        updateFullName();
      }
    };

    // Слушаем кастомное событие для обновления в том же окне
    const handleUserInfoUpdate = () => {
      updateFullName();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userInfoUpdated", handleUserInfoUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userInfoUpdated", handleUserInfoUpdate);
    };
  }, []);

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
      console.log("Profile photo update event received");
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

  const profileLabel = () => {
    return (
      <div className="flex items-center">
        <div className="flex-1 ltr:mr-[10px] rtl:ml-[10px]">
          <div className="lg:h-8 lg:w-8 h-7 w-7 rounded-full">
            {userPhoto && !imageError ? (
              <img
                src={userPhoto}
                alt=""
                className="block w-full h-full object-cover rounded-full"
                onError={() => {
                  // При ошибке загрузки показываем иконку
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full">
                <Icon
                  icon="heroicons:user-circle"
                  className="text-slate-400 dark:text-slate-500 text-xl"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px] block">
            {fullName || "User"}
          </span>
          <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
            <Icon icon="heroicons-outline:chevron-down"></Icon>
          </span>
        </div>
      </div>
    );
  };

  const ProfileMenu = [
    {
      label: "Profile",
      icon: "heroicons-outline:user",

      action: () => {
        navigate("/profile");
      },
    },
    // {
    //   label: "Chat",
    //   icon: "heroicons-outline:chat",
    //   action: () => {
    //     navigate("/chat");
    //   },
    // },
    // {
    //   label: "Email",
    //   icon: "heroicons-outline:mail",
    //   action: () => {
    //     navigate("/email");
    //   },
    // },
    // {
    //   label: "Todo",
    //   icon: "heroicons-outline:clipboard-check",
    //   action: () => {
    //     navigate("/todo");
    //   },
    // },
    // {
    //   label: "Settings",
    //   icon: "heroicons-outline:cog",
    //   action: () => {
    //     navigate("/settings");
    //   },
    // },
    {
      label: "Price",
      icon: "heroicons-outline:credit-card",
      action: () => {
        navigate("/pricing");
      },
    },
    {
      label: "Faq",
      icon: "heroicons-outline:information-circle",
      action: () => {
        navigate("/faq");
      },
    },
    {
      label: "Logout",
      icon: "heroicons-outline:login",
      action: () => {
        dispatch(handleLogout(false));
      },
    },
  ];

  return (
    <Dropdown label={profileLabel()} classMenuItems="w-[180px] top-[58px]">
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={() => item.action()}
              className={`${
                item.label === "Profile" ||
                item.label === "Faq" ||
                item.label === "Price"
                  ? "cursor-pointer pointer-events-none"
                  : ""
              } ${
                active
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                  : "text-slate-600 dark:text-slate-300"
              } block     ${
                item.hasDivider
                  ? "border-t border-slate-100 dark:border-slate-700"
                  : ""
              }`}
            >
              <div className={`block cursor-pointer px-4 py-2`}>
                <div className="flex items-center">
                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="block text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};

export default Profile;
