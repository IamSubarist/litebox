import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import axios from "axios";
import { toast } from "react-toastify";

import Usa from "@/assets/images/flags/en.svg";
import Gn from "@/assets/images/flags/gn.png";
import Fr from "@/assets/images/flags/fr.svg";
import Th from "@/assets/images/flags/th.svg";
import Id from "@/assets/images/flags/id.svg";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

// Маппинг ключей языков на изображения флагов
const getFlagImage = (key) => {
  const flagMap = {
    en: Usa,
    de: Gn,
    fr: Fr,
    th: Th,
    id: Id,
  };
  return flagMap[key] || Usa; // По умолчанию английский флаг
};

const Language = () => {
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка языков с сервера
  useEffect(() => {
    const fetchLanguages = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/general/languages`, {
          headers: {
            Authorization: token,
          },
        });

        if (response.data?.items && response.data.items.length > 0) {
          const languagesWithImages = response.data.items.map((lang) => ({
            ...lang,
            image: getFlagImage(lang.key),
          }));
          setLanguages(languagesWithImages);

          // Получаем текущий язык из localStorage
          const userInfoStr = localStorage.getItem("userInfo");
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            const currentLang = languagesWithImages.find(
              (lang) => lang.key === userInfo.lang
            );
            if (currentLang) {
              setSelected(currentLang);
            } else {
              setSelected(languagesWithImages[0]);
            }
          } else {
            setSelected(languagesWithImages[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        toast.error("Failed to load languages");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Обработка изменения языка
  const handleLanguageChange = async (newLanguage) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authorization required");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/user/language`,
        null,
        {
          params: {
            lang_key: newLanguage.key,
          },
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data?.state === "success") {
        setSelected(newLanguage);

        // Обновляем userInfo в localStorage
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          userInfo.lang = newLanguage.key;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          // Отправляем событие для обновления компонентов в том же окне
          window.dispatchEvent(new Event("userInfoUpdated"));
        }

        toast.success("Language changed successfully");
      }
    } catch (error) {
      console.error("Error changing language:", error);
      toast.error("Failed to change language");
    }
  };

  if (loading || !selected) {
    return (
      <div className="flex items-center space-x-[6px] rtl:space-x-reverse">
        <span className="inline-block md:h-6 md:w-6 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></span>
        <span className="text-sm md:block hidden font-medium text-slate-600 dark:text-slate-300 w-8 h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></span>
      </div>
    );
  }

  return (
    <div>
      <Listbox value={selected} onChange={handleLanguageChange}>
        <div className="relative z-[22]">
          <Listbox.Button className="relative w-full flex items-center cursor-pointer space-x-[6px] rtl:space-x-reverse">
            <span className="inline-block md:h-6 md:w-6 w-4 h-4 rounded-full object-contain">
              <img
                src={selected.image}
                alt=""
                className="h-full w-full object-cover rounded-full"
              />
            </span>
            <span className="text-sm md:block hidden font-medium text-slate-600 dark:text-slate-300">
              {selected.slug}
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute min-w-[100px] ltr:right-0 rtl:left-0 md:top-[50px] top-[38px] w-auto max-h-60 overflow-auto border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 mt-1 ">
              {languages.map((item, i) => (
                <Listbox.Option key={i} value={item} as={Fragment}>
                  {({ active }) => (
                    <li
                      className={`
                      w-full border-b border-b-gray-500 border-opacity-10 px-2 py-2 last:border-none last:mb-0 cursor-pointer first:rounded-t last:rounded-b
                        ${
                          active
                            ? "bg-slate-100 dark:bg-slate-700 dark:bg-opacity-70 bg-opacity-50 dark:text-white "
                            : "text-slate-600 dark:text-slate-300"
                        }
                        `}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="flex-none">
                          <span className="lg:w-6 lg:h-6 w-4 h-4 rounded-full inline-block">
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover relative top-1 rounded-full"
                            />
                          </span>
                        </span>
                        <span className="flex-1 lg:text-base text-sm capitalize">
                          {item.slug}
                        </span>
                      </div>
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Language;
