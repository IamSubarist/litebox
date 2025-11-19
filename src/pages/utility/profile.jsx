import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import PhoneInput from "./PhoneInput";
import BasicArea from "../chart/appex-chart/BasicArea";
import SocialProfile from "@/pages/app/Account/SocialProfile";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { AsYouType } from "libphonenumber-js";

// Placeholder avatar will be shown as icon when no photo is available

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
    // Используем регулярное выражение для замены только начала строки
    return photoPath.replace(/^\/api/, API_BASE_URL);
  }
  // Если путь относительный, добавляем базовый URL
  return `${API_BASE_URL}${photoPath.startsWith("/") ? "" : "/"}${photoPath}`;
};

const profile = () => {
  const navigate = useNavigate();
  const socialData = useSelector((state) => state.layout.socialsData);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [userAuths, setUserAuths] = useState(null);
  const [authProviders, setAuthProviders] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  let stepSchema = yup.object().shape({
    username: yup.string().required(" User name is required"),
    fullname: yup.string().required("Full name is required"),
    email: yup
      .string()
      .email("Email is not valid")
      .required("Email is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^[0-9]{12}$/, "Phone number is not valid"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmpass: yup
      .string()
      .required("Confirm Password is required")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });

  let currentStepSchema;
  switch (stepNumber) {
    case 0:
      currentStepSchema = stepSchema;
      break;
    case 1:
      currentStepSchema = personalSchema;
      break;
    case 2:
      currentStepSchema = addressSchema;
      break;
    case 3:
      currentStepSchema = socialSchema;
      break;
    default:
      currentStepSchema = stepSchema;
  }
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: yupResolver(currentStepSchema),
    // keep watch on all fields
    mode: "all",
  });

  // Удалено сохранение аватара в localStorage, так как фото теперь загружается с сервера

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.warn("Токен авторизации не найден");
        return;
      }

      try {
        const response = await axios.get(
          "https://socialdash.leverageindo.group/api/user/profile",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        console.log("Данные профиля:", response.data);

        if (response.data?.profile) {
          setProfileData(response.data.profile);
          const { first_name, last_name, phone, email, photo } =
            response.data.profile;
          const fullName = [first_name, last_name].filter(Boolean).join(" ");
          setNameValue(fullName);
          setPhoneValue(phone || "");
          setEmailValue(email || "");

          // Устанавливаем фото из профиля (всегда, даже если null)
          if (photo) {
            const photoUrl = getPhotoUrl(photo);
            // Устанавливаем фото с сервера как основной источник
            setAvatar(photoUrl);
            setPreview(null); // Очищаем preview, чтобы использовать фото с сервера
            setImageError(false); // Сбрасываем ошибку при новой загрузке
          } else {
            // Если фото нет, очищаем оба состояния
            setAvatar(null);
            setPreview(null);
            setImageError(false);
          }
        }

        if (response.data?.user_auths) {
          setUserAuths(response.data.user_auths);
        }

        if (response.data?.auth_providers) {
          setAuthProviders(response.data.auth_providers);
        }

        // Проверяем пароль: поддерживаем как старую структуру (boolean), так и новую (объект с status)
        const passwordAuthData = response.data?.user_auths?.password;
        let passwordAuth = false;
        if (passwordAuthData !== undefined) {
          if (
            typeof passwordAuthData === "object" &&
            passwordAuthData !== null
          ) {
            passwordAuth = passwordAuthData.status === true;
          } else {
            passwordAuth = Boolean(passwordAuthData);
          }
        } else {
          passwordAuth = Boolean(
            response.data?.auth_providers?.password ??
              response.data?.profile?.has_password
          );
        }
        setHasPassword(passwordAuth);
      } catch (error) {
        console.error("Не удалось получить данные профиля:", error);
      }
    };

    fetchProfile();
  }, []);

  const fullName =
    [profileData?.first_name, profileData?.last_name]
      .filter(Boolean)
      .join(" ") || "—";

  // Функция для форматирования телефона с маской страны
  const formatPhoneNumber = (phone) => {
    if (!phone || phone === "—") return "—";

    try {
      // Используем AsYouType для форматирования номера
      // Начинаем с TH (Таиланд) как defaultCountry, но библиотека определит страну автоматически
      const formatter = new AsYouType("TH");
      const formatted = formatter.input(phone);

      // Если форматирование удалось и есть результат, возвращаем его
      if (formatted && formatted.trim() !== "") {
        return formatted;
      }

      // Если форматирование не удалось, возвращаем исходный номер
      return phone;
    } catch (e) {
      // В случае ошибки возвращаем исходный номер
      return phone;
    }
  };

  const rawPhone = profileData?.phone || phoneValue || "—";
  const phoneDisplay = useMemo(() => formatPhoneNumber(rawPhone), [rawPhone]);

  const emailDisplay = profileData?.email || emailValue || "—";
  const passwordDisplay = hasPassword ? "*************" : "—";

  const handleEditName = () => {
    setIsEditingName(true);
    setNameValue(fullName !== "—" ? fullName : "");
  };

  const handleSaveName = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("Токен авторизации не найден");
      return;
    }

    const trimmedValue = nameValue.trim();

    if (!trimmedValue) {
      toast.error("Name cannot be empty");
      return;
    }

    // Проверка на наличие цифр
    if (/\d/.test(trimmedValue)) {
      toast.error("Name should not contain numbers");
      return;
    }

    // Проверка максимальной длины
    if (trimmedValue.length > 60) {
      toast.error("Name should not exceed 60 characters");
      return;
    }

    // Разбиваем на first_name и last_name
    // Если одно слово - это first_name, если два и более - первое это first_name, остальное это last_name
    const words = trimmedValue.split(/\s+/).filter((word) => word.length > 0);
    const [firstName, ...rest] = words;
    const lastName = rest.join(" ");

    const payload = {
      first_name: firstName,
      last_name: lastName || "",
    };

    try {
      setIsSavingName(true);
      const response = await axios.patch(
        "https://socialdash.leverageindo.group/api/user/profile",
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const updatedProfile = response.data?.profile ?? {
        ...profileData,
        ...payload,
      };

      setProfileData(updatedProfile);

      const updatedFullName = [
        updatedProfile?.first_name,
        updatedProfile?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      setNameValue(updatedFullName);
      setIsEditingName(false);

      // Обновляем userInfo в localStorage
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userInfo.full_name = updatedFullName;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          // Отправляем событие для обновления компонентов в том же окне
          window.dispatchEvent(new Event("userInfoUpdated"));
        } catch (error) {
          console.error("Error updating userInfo in localStorage:", error);
        }
      }
    } catch (error) {
      console.error("Не удалось обновить имя:", error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEditPhone = () => {
    setIsEditingPhone(true);
    setPhoneValue(profileData?.phone || "");
  };

  const handleSavePhone = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("Токен авторизации не найден");
      return;
    }

    const trimmedPhone = phoneValue.trim();

    if (!trimmedPhone) {
      console.warn("Номер не может быть пустым");
      return;
    }

    const payload = {
      phone: trimmedPhone,
    };

    try {
      setIsSavingPhone(true);
      const response = await axios.patch(
        "https://socialdash.leverageindo.group/api/user/profile",
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const updatedProfile = response.data?.profile ?? {
        ...profileData,
        ...payload,
      };

      setProfileData(updatedProfile);
      setPhoneValue(updatedProfile?.phone || "");
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Не удалось обновить номер телефона:", error);
    } finally {
      setIsSavingPhone(false);
    }
  };

  const uploadPhoto = async (file) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("Токен авторизации не найден");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.patch(
        "https://socialdash.leverageindo.group/api/user/profile/photo",
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.photo) {
        // Преобразуем относительный путь в полный URL
        const photoUrl = getPhotoUrl(response.data.photo);

        // Обновляем фото из ответа сервера (avatar - основной источник)
        setAvatar(photoUrl);
        setPreview(null); // Очищаем preview после успешной загрузки
        setImageError(false); // Сбрасываем ошибку при успешной загрузке

        // Обновляем данные профиля (сохраняем оригинальный путь от сервера)
        if (profileData) {
          setProfileData({
            ...profileData,
            photo: response.data.photo,
          });
        }

        // Отправляем событие для обновления фото в хедере и мобильной версии
        window.dispatchEvent(new Event("profilePhotoUpdated"));

        toast.success("Profile photo updated successfully");
      }
    } catch (error) {
      console.error("Не удалось загрузить фото:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile photo"
      );
      // Откатываем к предыдущему фото при ошибке
      if (profileData?.photo) {
        const photoUrl = getPhotoUrl(profileData.photo);
        setAvatar(photoUrl);
        setPreview(null);
      } else {
        setAvatar(null);
        setPreview(null);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Selected file is not an image");
        return;
      }

      // Сразу показываем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Загружаем фото на сервер
      uploadPhoto(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveAvatar = () => {
    // При удалении аватара можно отправить запрос на сервер для удаления фото
    // Пока просто очищаем локальное состояние
    setAvatar(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = profileData === null;

  return (
    <div>
      <div className="space-y-5 profile-page">
        {isLoading ? (
          <div
            className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-[6px] bg-white dark:bg-slate-800 relative z-[1]"
            style={{ height: "250px" }}
          />
        ) : (
          <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-[6px] bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]">
            <div className="bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg">
              <div className="w-auto absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                <SocialProfile
                  authProviders={authProviders}
                  userAuths={userAuths}
                />
              </div>
            </div>
            <div className="profile-box flex-none md:text-start text-center">
              <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
                <div className="flex-none">
                  <div className="md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 ring-slate-100 relative">
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                        <Icon
                          icon="line-md:loading-twotone-loop"
                          className="text-white text-3xl"
                        />
                      </div>
                    )}
                    {(avatar || (isUploadingPhoto && preview)) &&
                    !imageError ? (
                      <img
                        src={avatar || preview}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                        onError={() => {
                          // При ошибке загрузки показываем иконку
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full">
                        <Icon
                          icon="heroicons:user-circle"
                          className="text-slate-400 dark:text-slate-500 text-6xl md:text-7xl"
                        />
                      </div>
                    )}
                    <Link
                      to="#"
                      className={`absolute right-2 h-8 w-8 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center md:top-[140px] top-[100px] ${
                        isUploadingPhoto
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isUploadingPhoto) {
                          handleButtonClick();
                        }
                      }}
                    >
                      <Icon icon="heroicons:pencil-square" />
                    </Link>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-medium text-slate-900 dark:text-slate-200 min-[768px]:mb-[50px]">
                    {fullName}
                  </div>
                  <div className="text-sm font-light text-slate-600 dark:text-slate-400"></div>
                </div>
              </div>
              {/* SocialProfile для мобильных устройств */}
              <div className="md:hidden flex justify-center mt-3">
                <SocialProfile
                  authProviders={authProviders}
                  userAuths={userAuths}
                />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            {/* <div className="profile-info-500 md:flex md:text-start text-center flex-1 max-w-[516px] md:space-y-0 space-y-4">
            <div className="flex-1">
              <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">
                $32,400
              </div>
              <div className="text-sm text-slate-600 font-light dark:text-slate-300">
                Total Balance
              </div>
            </div>

            <div className="flex-1">
              <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">
                200
              </div>
              <div className="text-sm text-slate-600 font-light dark:text-slate-300">
                Board Card
              </div>
            </div>

            <div className="flex-1">
              <div className="text-base text-slate-900 dark:text-slate-300 font-medium mb-1">
                3200
              </div>
              <div className="text-sm text-slate-600 font-light dark:text-slate-300">
                Calender Events
              </div>
            </div>
          </div> */}
          </div>
        )}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 col-span-12">
            {isLoading ? (
              <div
                className="rounded-[6px] bg-white dark:bg-slate-800 h-full"
                style={{ minHeight: "400px" }}
              />
            ) : (
              <Card title="Info" className="h-full">
                <ul className="list space-y-6">
                  <li className="flex space-x-2 rtl:space-x-reverse">
                    <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="3.5"
                          stroke="#ffffff"
                          stroke-linecap="round"
                        />
                        <path
                          d="M4.84913 16.9479C5.48883 14.6034 7.91473 13.5 10.345 13.5H13.655C16.0853 13.5 18.5112 14.6034 19.1509 16.9479C19.282 17.4287 19.3868 17.9489 19.4462 18.5015C19.5052 19.0507 19.0523 19.5 18.5 19.5H5.5C4.94772 19.5 4.49482 19.0507 4.55382 18.5015C4.6132 17.9489 4.71796 17.4287 4.84913 16.9479Z"
                          stroke="#ffffff"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="h-fit flex justify-between items-center gap-5">
                        <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                          NAME
                        </div>

                        <button
                          type="button"
                          className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1"
                          onClick={(e) => {
                            e.preventDefault();
                            if (isEditingName) {
                              handleSaveName();
                            } else {
                              handleEditName();
                            }
                          }}
                          disabled={isSavingName}
                        >
                          {isSavingName ? (
                            <Icon
                              icon="line-md:loading-twotone-loop"
                              className="text-sm text-slate-400"
                            />
                          ) : isEditingName ? (
                            <Icon icon="heroicons:check" />
                          ) : (
                            <Icon icon="heroicons:pencil-square" />
                          )}
                        </button>
                      </div>

                      {isEditingName ? (
                        <div className="mr-8">
                          <Textinput
                            label=""
                            type="text"
                            placeholder="Name or name and lastname"
                            value={nameValue}
                            onKeyPress={(e) => {
                              // Блокируем ввод цифр на уровне клавиатуры
                              if (/\d/.test(e.key)) {
                                e.preventDefault();
                                return false;
                              }
                              // Сохранение по Enter
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveName();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Блокируем ввод цифр - удаляем все цифры
                              const valueWithoutDigits = value.replace(
                                /[0-9]/g,
                                ""
                              );
                              // Ограничиваем длину до 60 символов
                              const limitedValue = valueWithoutDigits.slice(
                                0,
                                60
                              );
                              setNameValue(limitedValue);
                            }}
                            onPaste={(e) => {
                              // Блокируем вставку цифр
                              e.preventDefault();
                              const pastedText =
                                e.clipboardData.getData("text");
                              const valueWithoutDigits = pastedText.replace(
                                /[0-9]/g,
                                ""
                              );
                              const currentValue = nameValue || "";
                              const newValue = (
                                currentValue + valueWithoutDigits
                              ).slice(0, 60);
                              setNameValue(newValue);
                            }}
                            className="pr-5"
                            autoFocus
                            maxLength={60}
                          />
                        </div>
                      ) : (
                        <div className="text-base text-slate-600 dark:text-slate-50">
                          {fullName}
                        </div>
                      )}
                    </div>
                  </li>

                  <li className="flex space-x-2 rtl:space-x-reverse">
                    <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="4"
                          y="6"
                          width="16"
                          height="12"
                          rx="2"
                          stroke="#ffffff"
                        />
                        <path
                          d="M4 9L11.1056 12.5528C11.6686 12.8343 12.3314 12.8343 12.8944 12.5528L20 9"
                          stroke="#ffffff"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-fit flex justify-between items-center gap-5">
                        <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                          EMAIL
                        </div>
                        <Link
                          to="#"
                          className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1 flex-shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate("/bind-account");
                          }}
                        >
                          <Icon icon="heroicons:pencil-square" />
                        </Link>
                      </div>
                      {emailDisplay !== "—" ? (
                        <a
                          href={`mailto:${emailDisplay}`}
                          className="text-base text-slate-600 dark:text-slate-50 truncate block"
                          title={emailDisplay}
                        >
                          {emailDisplay}
                        </a>
                      ) : (
                        <div className="text-base text-slate-600 dark:text-slate-50">
                          {emailDisplay}
                        </div>
                      )}
                    </div>
                  </li>

                  <li className="flex space-x-2 rtl:space-x-reverse">
                    <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.7071 13.7071L20.3552 16.3552C20.7113 16.7113 20.7113 17.2887 20.3552 17.6448C18.43 19.57 15.3821 19.7866 13.204 18.153L11.6286 16.9714C9.88504 15.6638 8.33622 14.115 7.02857 12.3714L5.84701 10.796C4.21341 8.61788 4.43001 5.56999 6.35523 3.64477C6.71133 3.28867 7.28867 3.28867 7.64477 3.64477L10.2929 6.29289C10.6834 6.68342 10.6834 7.31658 10.2929 7.70711L9.27175 8.72825C9.10946 8.89054 9.06923 9.13846 9.17187 9.34373C10.3585 11.7171 12.2829 13.6415 14.6563 14.8281C14.8615 14.9308 15.1095 14.8905 15.2717 14.7283L16.2929 13.7071C16.6834 13.3166 17.3166 13.3166 17.7071 13.7071Z"
                          stroke="#ffffff"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-fit flex justify-between items-center gap-2 sm:gap-5">
                        <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px] flex-shrink-0">
                          PHONE
                        </div>
                        <button
                          type="button"
                          className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1 flex-shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                            if (isEditingPhone) {
                              handleSavePhone();
                            } else {
                              handleEditPhone();
                            }
                          }}
                          disabled={isSavingPhone}
                        >
                          {isSavingPhone ? (
                            <Icon
                              icon="line-md:loading-twotone-loop"
                              className="text-sm text-slate-400"
                            />
                          ) : isEditingPhone ? (
                            <Icon icon="heroicons:check" />
                          ) : (
                            <Icon icon="heroicons:pencil-square" />
                          )}
                        </button>
                      </div>
                      {isEditingPhone ? (
                        <div className="mr-0 sm:mr-8 w-full sm:w-auto">
                          <PhoneInput
                            value={phoneValue}
                            onChange={(value) => setPhoneValue(value)}
                            placeholder="Phone number"
                            defaultCountry="TH"
                          />
                        </div>
                      ) : (
                        <div className="text-base text-slate-600 dark:text-slate-50 break-words overflow-hidden text-ellipsis">
                          {phoneDisplay}
                        </div>
                      )}
                    </div>
                  </li>

                  {profileData?.email !== null &&
                    profileData?.email !== undefined && (
                      <li className="flex space-x-2 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.5 13.5C4.5 11.6144 4.5 10.6716 5.08579 10.0858C5.67157 9.5 6.61438 9.5 8.5 9.5H15.5C17.3856 9.5 18.3284 9.5 18.9142 10.0858C19.5 10.6716 19.5 11.6144 19.5 13.5V14.5C19.5 17.3284 19.5 18.7426 18.6213 19.6213C17.7426 20.5 16.3284 20.5 13.5 20.5H10.5C7.67157 20.5 6.25736 20.5 5.37868 19.6213C4.5 18.7426 4.5 17.3284 4.5 14.5V13.5Z"
                              stroke="#ffffff"
                            />
                            <path
                              d="M16.5 9.5V8C16.5 5.51472 14.4853 3.5 12 3.5C9.51472 3.5 7.5 5.51472 7.5 8V9.5"
                              stroke="#ffffff"
                              stroke-linecap="round"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="h-fit flex justify-between items-center gap-5">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              Update Password
                            </div>
                            <Link to="/forgot-password">
                              <span className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1">
                                <Icon icon="heroicons:pencil-square" />
                              </span>
                            </Link>
                          </div>
                        </div>
                      </li>
                    )}

                  {socialData
                    .filter((item) => {
                      if (item.subscribe === false) {
                        return false;
                      }
                      if (!userAuths) {
                        return false;
                      }
                      const normalize = (value) =>
                        value
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "");
                      const key = item.providerKey || normalize(item.title);
                      if (!key) return false;

                      // Проверяем новую структуру: user_auths[key] может быть объектом {status, username} или boolean
                      const authData = userAuths[key];
                      if (typeof authData === "object" && authData !== null) {
                        return authData.status === true;
                      }
                      return Boolean(authData);
                    })
                    .map((item, index) => {
                      const normalize = (value) =>
                        value
                          ?.toString()
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "");
                      const key = item.providerKey || normalize(item.title);
                      const authData = userAuths?.[key];
                      // Получаем username из новой структуры
                      const rawUsername =
                        typeof authData === "object" && authData !== null
                          ? authData.username
                          : null;

                      // Форматируем username: если есть буквы - добавляем @, если только цифры - показываем как id
                      const formatUsername = (value) => {
                        if (!value) return "userName";
                        const str = String(value).trim();
                        // Проверяем, содержит ли значение буквы
                        const hasLetters = /[a-zA-Zа-яА-Я]/.test(str);
                        if (hasLetters) {
                          // Если есть буквы - это username, добавляем @
                          return str.startsWith("@") ? str : `@${str}`;
                        } else {
                          // Если только цифры - это id
                          return `id${str}`;
                        }
                      };

                      const formattedUsername = formatUsername(rawUsername);

                      return (
                        <li
                          key={item.id || item.title || index}
                          className="flex  space-x-2 rtl:space-x-reverse"
                        >
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <img src={item.icon2} alt="" />
                          </div>

                          <div className="flex-1">
                            <div className="h-fit flex justify-between items-center gap-5">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                {item.title}
                              </div>
                              <Link
                                to="#"
                                className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1"
                              >
                                <Icon icon="heroicons:check" />
                              </Link>
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {formattedUsername}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </Card>
            )}
          </div>
          <div className="lg:col-span-8 col-span-12">
            {isLoading ? (
              <div
                className="rounded-[6px] bg-white dark:bg-slate-800 h-full"
                style={{ minHeight: "400px" }}
              />
            ) : (
              <Card title="User Overview" bodyClass="h-[88%] pr-3">
                <BasicArea height={265} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default profile;
