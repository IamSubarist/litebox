import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import BasicArea from "../chart/appex-chart/BasicArea";
import SocialProfile from "@/pages/app/Account/SocialProfile";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

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

        const passwordAuth =
          response.data?.user_auths?.password ??
          response.data?.auth_providers?.password ??
          response.data?.profile?.has_password;
        setHasPassword(Boolean(passwordAuth));
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
  const phoneDisplay = profileData?.phone || phoneValue || "—";
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
      console.warn("Имя не может быть пустым");
      return;
    }

    const [firstName, ...rest] = trimmedValue.split(/\s+/);
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

  return (
    <div>
      <div className="space-y-5 profile-page">
        <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-[6px] bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]">
          <div className="bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg">
            <div className="w-auto absolute right-4 top-1/2 -translate-y-1/2 ">
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
                  {(avatar || (isUploadingPhoto && preview)) && !imageError ? (
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
                <div className="text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[50px]">
                  {fullName}
                </div>
                <div className="text-sm font-light text-slate-600 dark:text-slate-400"></div>
              </div>
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
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 col-span-12">
            <Card title="Info" className="h-full">
              <ul className="list space-y-6">
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:user-circle" />
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
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveName();
                            }
                          }}
                          className="pr-5"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="text-base text-slate-600 dark:text-slate-50">
                        {fullName}
                      </div>
                    )}
                  </div>
                </li>

                {profileData?.email !== null &&
                  profileData?.email !== undefined && (
                    <li className="flex space-x-2 rtl:space-x-reverse">
                      <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                        <Icon icon="heroicons:envelope" />
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
                  )}

                <li className="flex space-x-2 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:phone-arrow-up-right" />
                  </div>
                  <div className="flex-1">
                    <div className="h-fit flex justify-between items-center gap-5">
                      <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                        PHONE
                      </div>
                      <button
                        type="button"
                        className="w-6 h-6 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center mb-1"
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
                      <div className="mr-8">
                        <Textinput
                          label=""
                          type="text"
                          placeholder="Phone number"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSavePhone();
                            }
                          }}
                          className="pr-5"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="text-base text-slate-600 dark:text-slate-50">
                        {phoneDisplay}
                      </div>
                    )}
                  </div>
                </li>

                {profileData?.email !== null &&
                  profileData?.email !== undefined && (
                    <li className="flex space-x-2 rtl:space-x-reverse">
                      <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                        <img src="/icons/reset_password.svg" alt="" />
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
                    return key ? Boolean(userAuths[key]) : false;
                  })
                  .map((item, index) => (
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
                            <Icon icon="heroicons:pencil-square" />
                          </Link>
                        </div>
                        <div className="uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px]">
                          userName
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-8 col-span-12">
            <Card title="User Overview" bodyClass="h-[88%]">
              <BasicArea height={265} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default profile;
