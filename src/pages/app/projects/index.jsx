import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useWidth from "@/hooks/useWidth";
import Button from "@/components/ui/Button";
import {
  toggleAddModal,
  reorderProjectBlocks,
  closeWidgetEditor,
  setProjectBlocks,
  setProducts,
  setShouldSaveProject,
  resetShouldSaveProject,
} from "./store";
import { handleCustomizer } from "@/store/layout";
import { ToastContainer, toast } from "react-toastify";
import profil from "@/assets/images/logo/profil.webp";
import { openWidgetEditor } from "./store";
import {
  getProjectSchema,
  updateProjectSchema,
  getUploadUrls,
  uploadFileWithPresignedUrl,
} from "./api";
import axios from "axios";
import {
  extractFilesFromWidgets,
  replaceFilenameWithContentPath,
} from "./utils";
import { setSaveProjectCallback } from "./saveProjectCallback";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableBlock from "@/components/widgets/SortableBlock";
import {
  setLeftColVideoSaveCallback,
  setLeftColVideoDeleteCallback,
} from "@/components/partials/settings/Tools/VideoWidgetEditor";
import {
  setLeftColSocialLinkSaveCallback,
  setLeftColSocialLinkDeleteCallback,
} from "@/components/partials/settings/Tools/SocialLinkWidgetEditor";
import {
  setLeftColButtonWidgetSaveCallback,
  setLeftColButtonWidgetDeleteCallback,
} from "@/components/partials/settings/Tools/ButtonWidgetEditor";
import { setLeftColProfileSaveCallback } from "@/components/partials/settings/Tools/ProfileWidgetEditor";
import Profile from "../../../components/widgets/profileWidget";
const LeftCol = React.lazy(() =>
  import("../../../components/widgets/leftColWidget")
);

const cardData = [
  {
    icon: "/widgetIcons/promoVideo.svg",
    title: "Promo Video",
    type: "promoVideo",
    description: "Add a video to the top of your page",
  },
];

// Функции для работы с localStorage
const loadProjectSettingsFromStorage = () => {
  try {
    const item = window.localStorage.getItem("projectSettings");
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error("Error loading projectSettings from localStorage:", error);
  }
  return null;
};

const saveProjectSettingsToStorage = (settings) => {
  try {
    window.localStorage.setItem("projectSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving projectSettings to localStorage:", error);
  }
};

const ProjectPostPage = () => {
  const [filler, setfiller] = useState("grid");
  const { width, breakpoints } = useWidth();
  const [isLoaded, setIsLoaded] = useState(false);

  // Загружаем настройки из localStorage при инициализации
  const savedSettings = loadProjectSettingsFromStorage();
  const [circle, setCircle] = useState(savedSettings?.circle || false);
  const [adult, setAdult] = useState(savedSettings?.adult || false);
  const [hasVideoWidget, setHasVideoWidget] = useState(
    savedSettings?.hasVideoWidget || false
  );
  const [videoData, setVideoData] = useState(
    savedSettings?.videoData || {
      videoUrl: null,
      thumbnail: null,
    }
  );
  const [hasSocialLinkWidget, setHasSocialLinkWidget] = useState(
    savedSettings?.hasSocialLinkWidget || false
  );
  const [socialLinkData, setSocialLinkData] = useState(
    savedSettings?.socialLinkData || {
      socialLinks: [],
    }
  );
  const [hasButtonWidget, setHasButtonWidget] = useState(
    savedSettings?.hasButtonWidget || false
  );
  const [buttonData, setButtonData] = useState(
    savedSettings?.buttonData || {
      buttons: [],
    }
  );
  const [profileData, setProfileData] = useState(
    savedSettings?.profileData || {
      photoUrl: profil,
      name: "Name",
      text: "Text under name",
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [deletedFilenames, setDeletedFilenames] = useState(new Set()); // Отслеживаем удаленные файлы
  const isSmallScreen = width < breakpoints.xl;
  const isMobileMenu = width < 976; // Адаптивность для меню начиная с 976px
  const setCustomizer = (val) => dispatch(handleCustomizer(val));

  const { projects, projectBlocks, widgetEditor, shouldSaveProject } =
    useSelector((state) => state.project);
  const dispatch = useDispatch();

  // Отслеживаем флаг сохранения проекта и вызываем handleSave
  React.useEffect(() => {
    if (shouldSaveProject) {
      handleSave();
      dispatch(resetShouldSaveProject());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSaveProject]);

  // Функция для сохранения всех настроек проекта в localStorage
  const saveAllSettings = React.useCallback(() => {
    const settings = {
      circle,
      adult,
      hasVideoWidget,
      videoData,
      hasSocialLinkWidget,
      socialLinkData,
      hasButtonWidget,
      buttonData,
      profileData,
    };
    saveProjectSettingsToStorage(settings);
  }, [
    circle,
    adult,
    hasVideoWidget,
    videoData,
    hasSocialLinkWidget,
    socialLinkData,
    hasButtonWidget,
    buttonData,
    profileData,
  ]);

  // Флаг для отслеживания первой загрузки
  const isFirstLoad = React.useRef(true);

  // Сохраняем настройки при изменении любого из состояний (но не при первой загрузке или загрузке схемы)
  useEffect(() => {
    if (isFirstLoad.current || isLoadingSchema) {
      if (isFirstLoad.current && !isLoadingSchema) {
        isFirstLoad.current = false;
      }
      return;
    }
    saveAllSettings();
  }, [saveAllSettings, isLoadingSchema]);

  // Обработчики для переключателей Circle и Adult с явным сохранением
  const handleCircleToggle = () => {
    setCircle((prev) => !prev);
    // Сохраняем только если не идет загрузка схемы
    if (!isLoadingSchema && !isFirstLoad.current) {
      dispatch(setShouldSaveProject());
    }
  };

  const handleAdultToggle = () => {
    setAdult((prev) => !prev);
    // Сохраняем только если не идет загрузка схемы
    if (!isLoadingSchema && !isFirstLoad.current) {
      dispatch(setShouldSaveProject());
    }
  };

  // Устанавливаем callbacks для сохранения и удаления leftColVideo
  useEffect(() => {
    setLeftColVideoSaveCallback((data) => {
      setVideoData(data);
      setHasVideoWidget(true);
    });
    setLeftColVideoDeleteCallback(() => {
      setVideoData({ videoUrl: null, thumbnail: null });
      setHasVideoWidget(false);
    });
    return () => {
      setLeftColVideoSaveCallback(null);
      setLeftColVideoDeleteCallback(null);
    };
  }, []);

  // Устанавливаем callbacks для сохранения и удаления leftColSocialLink
  useEffect(() => {
    setLeftColSocialLinkSaveCallback((data) => {
      setSocialLinkData(data);
      setHasSocialLinkWidget(true);
    });
    setLeftColSocialLinkDeleteCallback(() => {
      setSocialLinkData({ socialLinks: [] });
      setHasSocialLinkWidget(false);
    });
    return () => {
      setLeftColSocialLinkSaveCallback(null);
      setLeftColSocialLinkDeleteCallback(null);
    };
  }, []);

  // Устанавливаем callbacks для сохранения и удаления leftColButtonWidget
  useEffect(() => {
    setLeftColButtonWidgetSaveCallback((data) => {
      setButtonData(data);
      setHasButtonWidget(true);
    });
    setLeftColButtonWidgetDeleteCallback(() => {
      setButtonData({ buttons: [] });
      setHasButtonWidget(false);
    });
    return () => {
      setLeftColButtonWidgetSaveCallback(null);
      setLeftColButtonWidgetDeleteCallback(null);
    };
  }, []);

  // Устанавливаем callback для сохранения leftColProfile
  useEffect(() => {
    setLeftColProfileSaveCallback((data) => {
      setProfileData(data);
    });
    return () => {
      setLeftColProfileSaveCallback(null);
    };
  }, []);

  // Отслеживаем закрытие редактора - если редактор закрыт и данных нет, убираем виджеты
  const prevWidgetEditorOpen = React.useRef(widgetEditor.isOpen);
  const prevWidgetType = React.useRef(widgetEditor.widgetType);
  useEffect(() => {
    // Сохраняем текущий widgetType пока редактор открыт
    if (widgetEditor.isOpen) {
      prevWidgetType.current = widgetEditor.widgetType;
    }

    // Если редактор только что закрылся (был открыт, стал закрыт)
    if (prevWidgetEditorOpen.current && !widgetEditor.isOpen) {
      const closedWidgetType = prevWidgetType.current;

      // Проверяем SocialLink виджет
      if (closedWidgetType === "leftColSocialLink" && hasSocialLinkWidget) {
        const hasData =
          socialLinkData?.socialLinks && socialLinkData.socialLinks.length > 0;
        if (!hasData) {
          setSocialLinkData({ socialLinks: [] });
          setHasSocialLinkWidget(false);
        }
      }
      // Проверяем Button виджет
      if (closedWidgetType === "leftColButtonWidget" && hasButtonWidget) {
        const hasData = buttonData?.buttons && buttonData.buttons.length > 0;
        if (!hasData) {
          setButtonData({ buttons: [] });
          setHasButtonWidget(false);
        }
      }
    }
    prevWidgetEditorOpen.current = widgetEditor.isOpen;
  }, [
    widgetEditor.isOpen,
    widgetEditor.widgetType,
    hasSocialLinkWidget,
    hasButtonWidget,
    socialLinkData,
    buttonData,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      dispatch(
        reorderProjectBlocks({
          activeId: active.id,
          overId: over.id,
        })
      );
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    setTimeout(() => {
      setIsLoaded(false);
    }, 1500);
  }, [filler]);

  // Загрузка схемы с сервера при инициализации
  useEffect(() => {
    const loadSchema = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        // Если нет токена, просто пропускаем загрузку схемы
        console.log("No auth token, skipping schema load");
        setIsLoadingSchema(false);
        isFirstLoad.current = false;
        return;
      }

      setIsLoadingSchema(true);
      try {
        const schema = await getProjectSchema();

        let loadedBlocks = [];
        // Если схема содержит projectBlocks, загружаем их
        if (schema?.data?.projectBlocks) {
          loadedBlocks = schema.data.projectBlocks;
          dispatch(setProjectBlocks(loadedBlocks));
        } else if (Array.isArray(schema?.data)) {
          // Если схема - это массив блоков
          loadedBlocks = schema.data;
          dispatch(setProjectBlocks(loadedBlocks));
        } else if (Array.isArray(schema)) {
          // Если схема сама является массивом
          loadedBlocks = schema;
          dispatch(setProjectBlocks(loadedBlocks));
        }

        // Проверяем, есть ли блоки типа "products"
        const hasProductsWidget = loadedBlocks.some(
          (block) => block.type === "products"
        );

        // Если есть виджеты продуктов, загружаем продукты с сервера
        if (hasProductsWidget) {
          try {
            console.log("🛍️ Загрузка продуктов для виджетов...");
            const productsResponse = await axios.get(
              "https://socialdash.leverageindo.group/api/products",
              {
                headers: {
                  Authorization: token,
                },
              }
            );

            console.log(
              "📦 Получены продукты с сервера:",
              productsResponse.data
            );

            // Преобразуем данные из API формата в формат компонента
            const transformedProducts = productsResponse.data.items.map(
              (item) => ({
                id: item.id,
                title: item.title,
                shopName: item.shop_name,
                url: item.url,
                currency: item.currency_key,
                price: item.price,
                rating: item.rating,
                images: item.photos.map((photo) => photo.url),
                photos: item.photos, // Сохраняем полную информацию о фото с id
                thumbnail: item.photos.length > 0 ? item.photos[0].url : null,
              })
            );

            console.log("✅ Преобразованные продукты:", transformedProducts);
            dispatch(setProducts(transformedProducts));

            // Логируем информацию о блоках продуктов
            const productBlocks = loadedBlocks.filter(
              (block) => block.type === "products"
            );
            console.log("📋 Блоки продуктов в схеме:", productBlocks);
            productBlocks.forEach((block) => {
              console.log(
                `  - Блок ${block.id}: selectedProducts =`,
                block.data?.selectedProducts
              );
            });
          } catch (productsError) {
            console.error("❌ Ошибка при загрузке продуктов:", productsError);
            // Не показываем ошибку пользователю, так как это не критично
          }
        }

        // Если схема содержит projectSettings, загружаем их
        if (schema?.data?.projectSettings) {
          const settings = schema.data.projectSettings;
          if (settings.circle !== undefined) setCircle(settings.circle);
          if (settings.adult !== undefined) setAdult(settings.adult);
          if (settings.hasVideoWidget !== undefined)
            setHasVideoWidget(settings.hasVideoWidget);
          if (settings.videoData) setVideoData(settings.videoData);
          if (settings.hasSocialLinkWidget !== undefined)
            setHasSocialLinkWidget(settings.hasSocialLinkWidget);
          if (settings.socialLinkData)
            setSocialLinkData(settings.socialLinkData);
          if (settings.hasButtonWidget !== undefined)
            setHasButtonWidget(settings.hasButtonWidget);
          if (settings.buttonData) setButtonData(settings.buttonData);
          if (settings.profileData) setProfileData(settings.profileData);
        }

        // После успешной загрузки схемы сбрасываем флаг первой загрузки
        isFirstLoad.current = false;
      } catch (error) {
        console.error("Error loading schema:", error);
        // Не показываем ошибку пользователю, если это просто отсутствие схемы
        if (error.response?.status !== 404) {
          toast.error("Failed to load project schema");
        }
        // Даже при ошибке сбрасываем флаг первой загрузки
        isFirstLoad.current = false;
      } finally {
        setIsLoadingSchema(false);
      }
    };

    loadSchema();
  }, [dispatch]);

  // Функция сохранения схемы на сервер
  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    try {
      // Собираем текущие настройки проекта
      const projectSettings = {
        circle,
        adult,
        hasVideoWidget,
        videoData,
        hasSocialLinkWidget,
        socialLinkData,
        hasButtonWidget,
        buttonData,
        profileData,
      };

      // ШАГ 1: Собираем весь новый контент (File объекты) который пользователь загрузил
      // Генерируем уникальные filename с расширением и берем content_type из файла
      const { items, fileMap } = extractFilesFromWidgets(
        projectBlocks,
        projectSettings
      );

      console.log(
        `📋 Найдено ${items.length} файлов для загрузки:`,
        items.map((i) => ({
          filename: i.filename,
          content_type: i.content_type,
        }))
      );

      // ШАГ 2: Если есть новые файлы, получаем presigned URLs от сервера
      // Отправляем items с filename и content_type
      // Получаем обратно для каждого item: filename, content_path, upload_url
      let uploadResults = [];
      if (items.length > 0) {
        console.log(
          `📡 Отправляем запрос на получение presigned URLs для ${items.length} файлов...`
        );
        // Создаем тело запроса с items (filename, content_type)
        const uploadUrlsResponse = await getUploadUrls(items);
        uploadResults = uploadUrlsResponse; // [{ filename, content_path, upload_url }, ...]
        console.log(
          `📥 Получено ${uploadResults.length} presigned URLs:`,
          uploadResults
        );
      }

      // ШАГ 3: Создаем схему для отправки (глубокая копия)
      let schemaToSend = {
        projectBlocks: JSON.parse(JSON.stringify(projectBlocks)),
        projectSettings: JSON.parse(JSON.stringify(projectSettings)),
      };

      // ШАГ 4: Заменяем File объекты на content_path в схеме перед отправкой
      // Используем filename как ключ для поиска места в схеме
      uploadResults.forEach((result) => {
        // result.filename - уникальный указатель на контент
        // result.content_path - ссылка по которой будет доступен контент в следующий раз
        schemaToSend = replaceFilenameWithContentPath(
          schemaToSend,
          result.filename,
          result.content_path,
          fileMap
        );
      });

      // Подготавливаем данные для отправки
      // Отправляем всю схему целиком (может быть массивом или объектом)
      // Если есть projectBlocks и projectSettings, отправляем объект
      // Иначе отправляем projectBlocks как массив
      const dataToSend =
        schemaToSend.projectBlocks && schemaToSend.projectSettings
          ? schemaToSend // Отправляем объект с projectBlocks и projectSettings
          : schemaToSend.projectBlocks || schemaToSend; // Или только массив блоков
      const delContentToSend = Array.from(deletedFilenames);

      // ШАГ 5: Отправляем схему на сервер сразу после получения presigned URLs
      // Файлы загружаем в фоне параллельно (не ждем завершения загрузки)
      const schemaPromise = updateProjectSchema(dataToSend, delContentToSend);

      // ШАГ 6: Загружаем файлы через PUT запрос на upload_url в фоне
      if (uploadResults.length > 0) {
        console.log(
          `📤 Начинаем загрузку ${uploadResults.length} файлов через PUT запросы...`
        );

        const uploadPromises = uploadResults.map(async (result) => {
          console.log(`🔍 Обрабатываем файл: ${result.filename}`, {
            upload_url: result.upload_url,
            content_path: result.content_path,
          });

          // Находим File объект по filename
          const fileInfo = fileMap.get(result.filename);

          if (!fileInfo) {
            console.error(
              `❌ File info не найден для filename: ${result.filename}`
            );
            return;
          }

          if (!fileInfo.file) {
            console.error(
              `❌ File объект отсутствует для filename: ${result.filename}`
            );
            return;
          }

          if (!result.upload_url) {
            console.error(
              `❌ upload_url отсутствует для filename: ${result.filename}`
            );
            return;
          }

          try {
            console.log(
              `⬆️ Отправляем PUT запрос для файла: ${result.filename}`
            );
            // result.upload_url - URL для загрузки контента на сервер (PUT запрос)
            await uploadFileWithPresignedUrl(fileInfo.file, result.upload_url);
            console.log(
              `✅ PUT запрос успешно выполнен для файла: ${result.filename}`
            );
          } catch (error) {
            console.error(
              `❌ Failed to upload file ${result.filename}:`,
              error
            );
            // Не прерываем процесс, просто логируем ошибку
          }
        });

        // Запускаем загрузку файлов в фоне параллельно, но не ждем завершения
        Promise.all(uploadPromises)
          .then(() => {
            console.log(`✅ Все файлы загружены через PUT запросы`);
          })
          .catch((error) => {
            console.error("❌ Error uploading files in background:", error);
          });
      } else {
        console.log("ℹ️ Нет файлов для загрузки (uploadResults пустой)");
      }

      // Ждем только сохранения схемы (файлы загружаются в фоне)
      await schemaPromise;

      // Обновляем projectBlocks в Redux store, заменяя File объекты на content_path
      if (uploadResults.length > 0) {
        // Используем schemaToSend, где File объекты уже заменены на content_path
        if (schemaToSend.projectBlocks) {
          dispatch(setProjectBlocks(schemaToSend.projectBlocks));

          // Также обновляем projectPreviewData в localStorage
          const stored = JSON.parse(
            localStorage.getItem("projectPreviewData") || "{}"
          );
          const updatedPreviewData = {
            ...stored,
            projectBlocks: schemaToSend.projectBlocks,
          };
          localStorage.setItem(
            "projectPreviewData",
            JSON.stringify(updatedPreviewData)
          );
        }
      }

      // Очищаем список удаленных файлов после успешного сохранения
      setDeletedFilenames(new Set());

      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving schema:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  }, [
    circle,
    adult,
    hasVideoWidget,
    videoData,
    hasSocialLinkWidget,
    socialLinkData,
    hasButtonWidget,
    buttonData,
    profileData,
    projectBlocks,
    deletedFilenames,
  ]);

  // Устанавливаем callback для сохранения проекта
  React.useEffect(() => {
    setSaveProjectCallback(() => handleSave);
    return () => {
      setSaveProjectCallback(null);
    };
  }, [handleSave]);

  const handlePreview = () => {
    // Убираем все background-блоки кроме последнего
    const backgroundBlocks = projectBlocks.filter(
      (b) => b.type === "background"
    );
    const otherBlocks = projectBlocks.filter((b) => b.type !== "background");

    // Берем только последний background, если он есть
    const lastBackground =
      backgroundBlocks.length > 0
        ? backgroundBlocks[backgroundBlocks.length - 1]
        : null;

    const cleanedBlocks = lastBackground
      ? [...otherBlocks, lastBackground]
      : otherBlocks;

    const previewData = {
      projectBlocks: cleanedBlocks,
      projects,
      circle,
      adult,
      hasVideoWidget,
      videoData,
      hasSocialLinkWidget,
      socialLinkData,
      hasButtonWidget,
      buttonData,
      profileData,
    };

    localStorage.setItem("projectPreviewData", JSON.stringify(previewData));
    window.open("/preview", "_blank");
  };

  // Показываем индикатор загрузки пока схема загружается
  if (isLoadingSchema) {
    return (
      <div>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-[85vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Loading project schema...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
          AI Generation
        </h4>

        <div
          className={`flex flex-wrap gap-2 ${
            isMobileMenu ? "w-full" : "md:space-x-4 md:justify-end"
          } items-center rtl:space-x-reverse`}
        >
          <Button
            icon="mdi-light:download"
            text="Download all generations"
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-lg"}
            onClick={handlePreview}
          />

          <Button
            icon="clarity:settings-line"
            text="AI config"
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-lg"}
            onClick={() => {
              // Сбрасываем состояние редактора виджетов
              dispatch(closeWidgetEditor());
              // Открываем меню выбора виджетов
              dispatch(handleCustomizer(true));
            }}
          />

          {/* <Button
            icon="ph:video-thin"
            text="Add video"
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-xl"}
            onClick={() => {
              setHasVideoWidget(true);
              dispatch(handleCustomizer(true));
              dispatch(
                openWidgetEditor({
                  widgetType: "leftColVideo",
                  widgetData: videoData,
                })
              );
            }}
          />

          <Button
            icon="fluent:color-background-24-regular"
            text="Background"
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-xl"}
            onClick={() => {
              // Просто открываем редактор background
              dispatch(openWidgetEditor({ widgetType: "background" }));
              dispatch(handleCustomizer(true));
            }}
          />

          <Button
            icon="mdi:toggle-switch"
            text={circle ? "Circle On" : "Circle Off"}
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-lg"}
            onClick={handleCircleToggle}
          />

          <Button
            icon="mdi:toggle-switch"
            text={adult ? "Adult On" : "Adult Off"}
            className={`bg-gray-600 hover:bg-gray-700 text-white h-min text-sm font-normal ${
              isMobileMenu
                ? "text-xs px-3 py-1.5 flex-1 min-w-[calc(33.333%-0.33rem)]"
                : ""
            }`}
            iconClass={isMobileMenu ? "text-base" : "text-lg"}
            onClick={handleAdultToggle}
          /> */}
        </div>
      </div>

      <div className={`w-full flex gap-10 items-start`}>
        <div className="flex-shrink-0">
          <div className="w-[406px] h-[600px] bg-[#dddddd] rounded-[4px]" />
        </div>

        <div className="flex-1 flex-col">
          <p className="mb-5 text-[24px] leading-[24px] font-medium text-slate-900 dark:text-[#cbd5e1]">
            Your latest generations
          </p>
          <div className="flex-1 grid grid-cols-9 gap-4">
            {[...Array(24)].map((_, index) => (
              <div className="w-full h-[150px] bg-[#dddddd] rounded-[4px]"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPostPage;
