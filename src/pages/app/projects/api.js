import axios from "axios";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

/**
 * Преобразует относительный путь (content_path) в полный URL
 * Используется для изображений, загруженных на сервер
 */
export const getContentUrl = (contentPath) => {
  if (!contentPath) return null;
  // Если путь уже полный URL, возвращаем как есть
  if (contentPath.startsWith("http://") || contentPath.startsWith("https://")) {
    return contentPath;
  }
  // Если путь начинается с /api, заменяем на полный базовый URL
  if (contentPath.startsWith("/api")) {
    return contentPath.replace(/^\/api/, API_BASE_URL);
  }
  // Если путь относительный, добавляем базовый URL
  return `${API_BASE_URL}${
    contentPath.startsWith("/") ? "" : "/"
  }${contentPath}`;
};

/**
 * Получить токен авторизации из localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Получить схему проекта с сервера
 */
export const getProjectSchema = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.get(`${API_BASE_URL}/project/schema`, {
      headers: {
        Authorization: token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching project schema:", error);
    throw error;
  }
};

/**
 * Обновить схему проекта на сервере
 */
export const updateProjectSchema = async (data, delContent = []) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.patch(
      `${API_BASE_URL}/project/schema`,
      {
        data,
        del_content: delContent,
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating project schema:", error);
    throw error;
  }
};

/**
 * Получить presigned URLs для загрузки файлов
 */
export const getUploadUrls = async (items) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/project/upload_urls`,
      {
        items: items.map((item) => ({
          filename: item.filename,
          content_type: item.content_type,
        })),
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.items || [];
  } catch (error) {
    console.error("Error getting upload URLs:", error);
    throw error;
  }
};

/**
 * Загрузить файл на сервер используя presigned URL
 *
 * Важно: presignedUrl должен быть для метода PUT!
 *
 * Если бэкенд возвращает относительный путь (начинается с /), добавляем базовый URL
 * Если presignedUrl уже абсолютный (начинается с http:// или https://), используем как есть
 */
export const uploadFileWithPresignedUrl = async (file, presignedUrl) => {
  // Если presignedUrl относительный (начинается с /), добавляем базовый URL
  let fullUrl = presignedUrl;
  if (presignedUrl.startsWith("/")) {
    // Убираем /api из API_BASE_URL, так как оно уже есть в presignedUrl
    const baseUrl = API_BASE_URL.replace(/\/api$/, "");
    fullUrl = `${baseUrl}${presignedUrl}`;
    console.log(`🔗 Преобразован относительный URL в абсолютный: ${fullUrl}`);
  } else if (
    !presignedUrl.startsWith("http://") &&
    !presignedUrl.startsWith("https://")
  ) {
    throw new Error(
      `Invalid presigned URL: ${presignedUrl}. Expected absolute URL (starting with http:// or https://) or relative path (starting with /).`
    );
  }

  try {
    // Создаем отдельный экземпляр axios без базового URL для presigned URL
    const axiosInstance = axios.create({
      // Не устанавливаем baseURL, чтобы использовать полный URL как есть
    });

    const res = await axiosInstance.put(fullUrl, file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      // Отключаем преобразование данных, так как отправляем файл напрямую
      transformRequest: [],
    });

    if (res.status === 200) {
      console.log("✅ Файл успешно загружен!");
      return true;
    } else {
      console.error("❌ Ошибка при загрузке:", res.status, res.statusText);
      throw new Error(
        `Upload failed with status: ${res.status} ${res.statusText}`
      );
    }
  } catch (err) {
    console.error(
      "Ошибка при загрузке:",
      err.response?.status,
      err.response?.data || err
    );
    console.error("Presigned URL (original):", presignedUrl);
    console.error("Full URL:", fullUrl);
    throw err;
  }
};
