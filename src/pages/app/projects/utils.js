import { v4 as uuidv4 } from "uuid";

/**
 * Генерирует уникальный filename с расширением
 */
export const generateFilename = (file) => {
  const extension = file.name.split(".").pop() || "bin";
  const uniqueId = uuidv4().replace(/-/g, "");
  return `${uniqueId}.${extension}`;
};

/**
 * Извлекает все файлы из виджетов и создает массив items для получения presigned URLs
 * 
 * Логика:
 * 1. Собирает весь новый контент (File объекты) который пользователь загрузил
 * 2. Генерирует уникальный filename с расширением для каждого файла
 * 3. Берет content_type из file.type (например, "image/png")
 * 
 * Возвращает объект с:
 * - items: массив { filename, content_type } для отправки на сервер
 * - fileMap: Map для быстрого поиска File объекта по filename
 */
export const extractFilesFromWidgets = (projectBlocks, projectSettings) => {
  const items = [];
  const fileMap = new Map(); // filename -> { file, path, blockId, widgetType, fieldPath }

  // Функция для добавления файла
  const addFile = (file, path, blockId, widgetType, fieldPath) => {
    // Проверяем, что это действительно File объект (не URL строка или content_path)
    if (file instanceof File) {
      // Генерируем уникальный filename с расширением (например, "d9951579806743b180c7a50fdfadb0f5.jpeg")
      const filename = generateFilename(file);
      
      // Берем content_type из файла (например, "image/png", "image/jpeg")
      const content_type = file.type || "application/octet-stream";
      
      // Добавляем в items для отправки на сервер
      items.push({
        filename, // уникальный указатель на контент
        content_type, // тип контента из файла
      });
      
      // Сохраняем File объект и метаданные в fileMap для последующего использования
      fileMap.set(filename, {
        file, // File объект для загрузки
        path, // путь в схеме где нужно заменить filename на content_path
        blockId,
        widgetType,
        fieldPath, // путь к полю в структуре данных (например, "data.links[0].image")
      });
    }
  };

  // Обрабатываем блоки проекта
  projectBlocks.forEach((block) => {
    const { id: blockId, type, data } = block;

    switch (type) {
      case "link":
        if (data.links && Array.isArray(data.links)) {
          data.links.forEach((link, index) => {
            if (link.image instanceof File) {
              addFile(
                link.image,
                `projectBlocks[${blockId}].data.links[${index}].image`,
                blockId,
                type,
                `data.links[${index}].image`
              );
            }
          });
        }
        break;

      case "carousel":
        if (data.slides && Array.isArray(data.slides)) {
          data.slides.forEach((slide, index) => {
            if (slide.image instanceof File) {
              addFile(
                slide.image,
                `projectBlocks[${blockId}].data.slides[${index}].image`,
                blockId,
                type,
                `data.slides[${index}].image`
              );
            }
          });
        }
        break;

      case "background":
        // Проверяем data.background.image (новый формат)
        if (data.background?.image instanceof File) {
          addFile(
            data.background.image,
            `projectBlocks[${blockId}].data.background.image`,
            blockId,
            type,
            "data.background.image"
          );
        }
        // Также проверяем старый формат data.backgroundImage для обратной совместимости
        else if (data.backgroundImage instanceof File) {
          addFile(
            data.backgroundImage,
            `projectBlocks[${blockId}].data.backgroundImage`,
            blockId,
            type,
            "data.backgroundImage"
          );
        }
        break;

      case "promoVideo":
        // Обрабатываем videoUrl
        if (data.videoUrl instanceof File) {
          addFile(
            data.videoUrl,
            `projectBlocks[${blockId}].data.videoUrl`,
            blockId,
            type,
            "data.videoUrl"
          );
        }
        // Обрабатываем thumbnail
        if (data.thumbnail instanceof File) {
          addFile(
            data.thumbnail,
            `projectBlocks[${blockId}].data.thumbnail`,
            blockId,
            type,
            "data.thumbnail"
          );
        }
        break;

      // Добавьте другие типы виджетов по необходимости
    }
  });

  // Обрабатываем настройки проекта (leftCol виджеты)
  if (projectSettings) {
    // Profile photo
    if (projectSettings.profileData?.photoUrl instanceof File) {
      addFile(
        projectSettings.profileData.photoUrl,
        "projectSettings.profileData.photoUrl",
        null,
        "leftColProfile",
        "photoUrl"
      );
    }

    // Video videoUrl
    if (projectSettings.videoData?.videoUrl instanceof File) {
      addFile(
        projectSettings.videoData.videoUrl,
        "projectSettings.videoData.videoUrl",
        null,
        "leftColVideo",
        "videoUrl"
      );
    }
    // Video thumbnail
    if (projectSettings.videoData?.thumbnail instanceof File) {
      addFile(
        projectSettings.videoData.thumbnail,
        "projectSettings.videoData.thumbnail",
        null,
        "leftColVideo",
        "thumbnail"
      );
    }

    // Social links icons
    if (projectSettings.socialLinkData?.socialLinks && Array.isArray(projectSettings.socialLinkData.socialLinks)) {
      projectSettings.socialLinkData.socialLinks.forEach((link, index) => {
        if (link.icon instanceof File) {
          addFile(
            link.icon,
            `projectSettings.socialLinkData.socialLinks[${index}].icon`,
            null,
            "leftColSocialLink",
            `socialLinks[${index}].icon`
          );
        }
      });
    }

    // Button icons
    if (projectSettings.buttonData?.buttons && Array.isArray(projectSettings.buttonData.buttons)) {
      projectSettings.buttonData.buttons.forEach((button, index) => {
        if (button.icon instanceof File) {
          addFile(
            button.icon,
            `projectSettings.buttonData.buttons[${index}].icon`,
            null,
            "leftColButtonWidget",
            `buttons[${index}].icon`
          );
        }
      });
    }
  }

  return { items, fileMap };
};

/**
 * Заменяет filename на content_path в схеме
 * Использует fileMap для поиска нужного места в структуре
 */
export const replaceFilenameWithContentPath = (
  schema,
  filename,
  contentPath,
  fileMap
) => {
  const fileInfo = fileMap.get(filename);
  if (!fileInfo) {
    console.warn(`File info not found for filename: ${filename}`);
    return schema;
  }

  const { blockId, widgetType, fieldPath } = fileInfo;

  // Создаем глубокую копию схемы
  const updatedSchema = JSON.parse(JSON.stringify(schema));

  // Функция для установки значения по пути
  const setValueByPath = (obj, path, value) => {
    const parts = path.split(".");
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      // Обработка массивов вида "links[0]"
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayName, index] = arrayMatch;
        if (!current[arrayName]) return false;
        current = current[arrayName][parseInt(index)];
      } else {
        if (!current[part]) return false;
        current = current[part];
      }
      if (!current) return false;
    }

    const lastPart = parts[parts.length - 1];
    const lastArrayMatch = lastPart.match(/^(\w+)\[(\d+)\]$/);
    if (lastArrayMatch) {
      const [, arrayName, index] = lastArrayMatch;
      if (current[arrayName] && current[arrayName][parseInt(index)] !== undefined) {
        current[arrayName][parseInt(index)] = value;
        return true;
      }
    } else if (current && lastPart in current) {
      current[lastPart] = value;
      return true;
    }
    return false;
  };

  if (blockId && !["leftColProfile", "leftColVideo", "leftColSocialLink", "leftColButtonWidget"].includes(widgetType)) {
    // Это блок проекта
    const blockIndex = updatedSchema.projectBlocks?.findIndex(
      (b) => b.id === blockId
    );
    if (blockIndex !== -1 && updatedSchema.projectBlocks) {
      const block = updatedSchema.projectBlocks[blockIndex];
      setValueByPath(block, fieldPath, contentPath);
    }
  } else {
    // Это настройки проекта (leftCol виджеты)
    if (!updatedSchema.projectSettings) {
      updatedSchema.projectSettings = {};
    }

    if (widgetType === "leftColProfile") {
      if (!updatedSchema.projectSettings.profileData) {
        updatedSchema.projectSettings.profileData = {};
      }
      updatedSchema.projectSettings.profileData.photoUrl = contentPath;
    } else if (widgetType === "leftColVideo") {
      if (!updatedSchema.projectSettings.videoData) {
        updatedSchema.projectSettings.videoData = {};
      }
      // Обновляем соответствующее поле (videoUrl или thumbnail)
      if (fieldPath === "videoUrl") {
        updatedSchema.projectSettings.videoData.videoUrl = contentPath;
      } else if (fieldPath === "thumbnail") {
        updatedSchema.projectSettings.videoData.thumbnail = contentPath;
      }
    } else if (widgetType === "leftColSocialLink") {
      if (!updatedSchema.projectSettings.socialLinkData) {
        updatedSchema.projectSettings.socialLinkData = {};
      }
      setValueByPath(updatedSchema.projectSettings.socialLinkData, fieldPath, contentPath);
    } else if (widgetType === "leftColButtonWidget") {
      if (!updatedSchema.projectSettings.buttonData) {
        updatedSchema.projectSettings.buttonData = {};
      }
      setValueByPath(updatedSchema.projectSettings.buttonData, fieldPath, contentPath);
    }
  }

  return updatedSchema;
};

/**
 * Находит все filename'ы в схеме для удаления
 */
export const findFilenamesInSchema = (schema) => {
  const filenames = new Set();

  const searchForFilenames = (obj, path = "") => {
    if (!obj || typeof obj !== "object") return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value instanceof File) {
        // Это File объект - не добавляем в список для удаления
        // так как он еще не был загружен
        continue;
      }

      if (typeof value === "string") {
        // Проверяем, является ли это filename (можно добавить более сложную логику)
        // Пока просто проверяем, что это не URL
        if (
          value &&
          !value.startsWith("http://") &&
          !value.startsWith("https://") &&
          !value.startsWith("/") &&
          value.includes(".")
        ) {
          // Это может быть filename, но нужно быть осторожным
          // Лучше отслеживать удаленные файлы отдельно
        }
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          searchForFilenames(item, `${currentPath}[${index}]`);
        });
      } else if (typeof value === "object") {
        searchForFilenames(value, currentPath);
      }
    }
  };

  searchForFilenames(schema);
  return Array.from(filenames);
};

