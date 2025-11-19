import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import { toast } from "react-toastify";
import avatar1 from "@/assets/images/avatar/av-1.svg";
import avatar2 from "@/assets/images/avatar/av-2.svg";
import avatar3 from "@/assets/images/avatar/av-3.svg";
import avatar4 from "@/assets/images/avatar/av-4.svg";

// Загрузка продуктов из localStorage
const loadProductsFromStorage = () => {
  try {
    const item = window.localStorage.getItem("products");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error loading products from localStorage:", error);
    return [];
  }
};

// Сохранение продуктов в localStorage
const saveProductsToStorage = (products) => {
  try {
    window.localStorage.setItem("products", JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products to localStorage:", error);
  }
};

// Загрузка блоков проекта из localStorage
const loadProjectBlocksFromStorage = () => {
  try {
    const item = window.localStorage.getItem("projectBlocks");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error loading projectBlocks from localStorage:", error);
    return [];
  }
};

// Сохранение блоков проекта в localStorage
const saveProjectBlocksToStorage = (blocks) => {
  try {
    window.localStorage.setItem("projectBlocks", JSON.stringify(blocks));
  } catch (error) {
    console.error("Error saving projectBlocks to localStorage:", error);
  }
};

export const appProjectSlice = createSlice({
  name: "approject",
  initialState: {
    openProjectModal: false,
    isLoading: null,
    editItem: {},
    editModal: false,
    projectBlocks: loadProjectBlocksFromStorage(), // Массив блоков в проекте - загружаем из localStorage
    widgetEditor: {
      isOpen: false,
      widgetType: null,
      widgetData: {},
      tempBlockId: null, // Временный ID блока до сохранения
      editingBlockId: null, // ID существующего блока для редактирования
    },
    shouldSaveProject: false, // Флаг для сохранения проекта на сервер
    products: loadProductsFromStorage(), // Массив продуктов - загружаем из localStorage
    projects: [
      {
        id: uuidv4(),
        assignee: [
          {
            image: avatar1,
            label: "Mahedi Amin",
          },
          {
            image: avatar2,
            label: "Sovo Haldar",
          },
          {
            image: avatar3,
            label: "Rakibul Islam",
          },
        ],
        name: "Management Dashboard ",
        des: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
        startDate: "2022-10-03",
        endDate: "2022-10-06",
        progress: 75,
        category: [
          {
            value: "team",
            label: "team",
          },
          {
            value: "low",
            label: "low",
          },
        ],
      },
      {
        id: uuidv4(),
        assignee: [
          {
            image: avatar1,
            label: "Mahedi Amin",
          },
          {
            image: avatar2,
            label: "Sovo Haldar",
          },
          {
            image: avatar3,
            label: "Rakibul Islam",
          },
        ],
        name: "Business Dashboard ",
        des: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
        startDate: "2022-10-03",
        endDate: "2022-10-10",
        progress: 50,

        category: [
          {
            value: "team",
            label: "team",
          },
          {
            value: "low",
            label: "low",
          },
        ],
      },
    ],
  },
  reducers: {
    toggleAddModal: (state, action) => {
      state.openProjectModal = action.payload;
    },
    toggleEditModal: (state, action) => {
      state.editModal = action.payload;
    },
    pushProject: (state, action) => {
      state.projects.unshift(action.payload);

      toast.success("Add Successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(
        (item) => item.id !== action.payload
      );
      toast.warning("Remove Successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    },
    updateProject: (state, action) => {
      // update project and  store it into editItem when click edit button

      state.editItem = action.payload;
      // toggle edit modal
      state.editModal = !state.editModal;
      // find index
      let index = state.projects.findIndex(
        (item) => item.id === action.payload.id
      );
      // update project
      state.projects.splice(index, 1, {
        id: action.payload.id,
        name: action.payload.name,
        des: action.payload.des,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        assignee: action.payload.assignee,
        progress: action.payload.progress,
        category: action.payload.category,
      });
    },
    // Добавление блока в проект
    addProjectBlock: (state, action) => {
      const { type, data } = action.payload;
      const newBlock = {
        id: uuidv4(),
        type,
        order: state.projectBlocks.length + 1,
        data: data || {},
      };
      state.projectBlocks.push(newBlock);
      saveProjectBlocksToStorage(state.projectBlocks);
    },
    // Удаление блока из проекта
    removeProjectBlock: (state, action) => {
      state.projectBlocks = state.projectBlocks.filter(
        (block) => block.id !== action.payload
      );
      // Обновляем порядковые номера
      state.projectBlocks.forEach((block, index) => {
        block.order = index + 1;
      });
      saveProjectBlocksToStorage(state.projectBlocks);
    },
    // Перестановка блоков (drag and drop)
    reorderProjectBlocks: (state, action) => {
      const { activeId, overId } = action.payload;
      const activeIndex = state.projectBlocks.findIndex(
        (block) => block.id === activeId
      );
      const overIndex = state.projectBlocks.findIndex(
        (block) => block.id === overId
      );

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const [removed] = state.projectBlocks.splice(activeIndex, 1);
        state.projectBlocks.splice(overIndex, 0, removed);
        // Обновляем порядковые номера
        state.projectBlocks.forEach((block, index) => {
          block.order = index + 1;
        });
        saveProjectBlocksToStorage(state.projectBlocks);
        // Устанавливаем флаг для сохранения проекта на сервер
        state.shouldSaveProject = true;
      }
    },
    // Открытие редактора виджета
    openWidgetEditor: (state, action) => {
      const { widgetType, widgetData, blockId } = action.payload;

      // Если передан blockId, редактируем существующий блок
      if (blockId) {
        const existingBlock = state.projectBlocks.find(
          (block) => block.id === blockId
        );
        if (existingBlock) {
          let widgetData = { ...existingBlock.data };

          // Миграция старых данных carousel виджета - добавляем style если его нет
          if (existingBlock.type === "carousel" && !widgetData.style) {
            widgetData.style = "featured"; // по умолчанию featured
            existingBlock.data = widgetData;
          }

          // Миграция старых данных Connect виджета - добавляем layout если его нет
          if (existingBlock.type === "Connect" && !widgetData.layout) {
            widgetData.layout = "single-row"; // по умолчанию single-row
            existingBlock.data = widgetData;
          }

          // Миграция старых данных products виджета - добавляем selectedProducts если его нет
          if (
            existingBlock.type === "products" &&
            !widgetData.selectedProducts
          ) {
            widgetData.selectedProducts = []; // по умолчанию пустой массив
            existingBlock.data = widgetData;
          }

          // Миграция старых данных link виджета в новый формат с массивом links
          if (existingBlock.type === "link") {
            const style = widgetData.style || "featured";
            const linksCount = {
              featured: 1,
              cardImage: 2,
              cardSolid: 2, // максимум 2 карточки
            };
            const requiredCount = linksCount[style] || 1;

            if (!widgetData.links || widgetData.links.length === 0) {
              // Создаем массив links из старых данных
              widgetData = {
                style,
                links: [
                  {
                    id: uuidv4(),
                    image: widgetData.image || null,
                    subtitle: widgetData.subtitle || "",
                    title: widgetData.title || "",
                    linkText: widgetData.linkText || "",
                    linkUrl: widgetData.linkUrl || "",
                  },
                ],
              };
              // Добавляем недостающие ссылки если нужно
              while (widgetData.links.length < requiredCount) {
                widgetData.links.push({
                  id: uuidv4(),
                  image: null,
                  subtitle: "",
                  title: "",
                  linkText: "",
                  linkUrl: "",
                });
              }
            } else if (widgetData.links.length < requiredCount) {
              // Если ссылок меньше чем нужно, добавляем недостающие
              while (widgetData.links.length < requiredCount) {
                widgetData.links.push({
                  id: uuidv4(),
                  image: null,
                  subtitle: "",
                  title: "",
                  linkText: "",
                  linkUrl: "",
                });
              }
            } else if (widgetData.links.length > requiredCount) {
              // Если ссылок больше чем нужно, обрезаем
              widgetData.links = widgetData.links.slice(0, requiredCount);
            }
            // Обновляем данные в блоке
            existingBlock.data = widgetData;
          }

          state.widgetEditor = {
            isOpen: true,
            widgetType: existingBlock.type,
            widgetData,
            tempBlockId: null,
            editingBlockId: blockId,
          };
          return;
        }
      }

      // Если это embedServiceSelector, просто открываем селектор без создания блока
      if (widgetType === "embedServiceSelector") {
        state.widgetEditor = {
          isOpen: true,
          widgetType: "embedServiceSelector",
          widgetData: widgetData || {},
          tempBlockId: null,
          editingBlockId: null,
        };
        return;
      }

      // Если это leftColVideo, просто открываем редактор без создания блока
      if (widgetType === "leftColVideo") {
        state.widgetEditor = {
          isOpen: true,
          widgetType: "leftColVideo",
          widgetData: widgetData || { videoUrl: null, thumbnail: null },
          tempBlockId: null,
          editingBlockId: null,
        };
        return;
      }

      // Если это leftColSocialLink, просто открываем редактор без создания блока
      if (widgetType === "leftColSocialLink") {
        state.widgetEditor = {
          isOpen: true,
          widgetType: "leftColSocialLink",
          widgetData: widgetData || { socialLinks: [] },
          tempBlockId: null,
          editingBlockId: null,
        };
        return;
      }

      // Если это leftColButtonWidget, просто открываем редактор без создания блока
      if (widgetType === "leftColButtonWidget") {
        state.widgetEditor = {
          isOpen: true,
          widgetType: "leftColButtonWidget",
          widgetData: widgetData || { buttons: [] },
          tempBlockId: null,
          editingBlockId: null,
        };
        return;
      }

      // Если это leftColProfile, просто открываем редактор без создания блока
      if (widgetType === "leftColProfile") {
        state.widgetEditor = {
          isOpen: true,
          widgetType: "leftColProfile",
          widgetData: widgetData || {
            photoUrl: "",
            name: "Name",
            text: "Text under name",
          },
          tempBlockId: null,
          editingBlockId: null,
        };
        return;
      }

      // Иначе создаем новый временный блок
      const tempBlockId = uuidv4();

      // Дефолтные данные в зависимости от типа виджета
      let defaultData = {};
      if (widgetType === "link") {
        defaultData = {
          style: "featured",
          links: [
            {
              id: uuidv4(),
              image: null,
              subtitle: "",
              title: "",
              linkText: "",
              linkUrl: "",
            },
          ],
        };
      } else if (widgetType === "carousel") {
        defaultData = {
          style: "featured", // featured = card false, showcase = card true
          slides: [
            {
              id: uuidv4(),
              image: null,
              subtitle: "",
              title: "",
              linkText: "",
              linkUrl: "",
            },
          ],
          scheduleContent: false,
        };
      } else if (widgetType === "sectionText") {
        defaultData = {
          title: "",
          linkText: "",
          linkUrl: "",
        };
      } else if (widgetType === "embet") {
        defaultData = {
          style: "large", // small = true, large = false
          embedUrl: "",
        };
      } else if (widgetType === "Connect") {
        defaultData = {
          layout: "single-row", // single-row, two-rows, mixed-rows, custom-grid
          platform: widgetData?.platform || "Instagram", // Instagram, TikTok, YouTube
        };
      } else if (widgetType === "products") {
        defaultData = {
          selectedProducts: [], // Массив ID выбранных продуктов
        };
      }

      const tempBlock = {
        id: tempBlockId,
        type: widgetType,
        order: state.projectBlocks.length + 1,
        data: {
          ...defaultData,
          ...widgetData,
        },
      };

      // Если карусель создается со стилем showcase, убеждаемся что есть минимум 3 слайда
      if (widgetType === "carousel" && tempBlock.data.style === "showcase") {
        if (!tempBlock.data.slides) {
          tempBlock.data.slides = [];
        }
        const currentSlides = tempBlock.data.slides;
        const minSlidesCount = 3;

        if (currentSlides.length < minSlidesCount) {
          const slidesToAdd = minSlidesCount - currentSlides.length;
          const lastSlide = currentSlides[currentSlides.length - 1] || {};

          for (let i = 0; i < slidesToAdd; i++) {
            tempBlock.data.slides.push({
              id: uuidv4(),
              image: lastSlide.image || null,
              subtitle: lastSlide.subtitle || "",
              title: lastSlide.title || "",
              linkText: lastSlide.linkText || "",
              linkUrl: lastSlide.linkUrl || "",
            });
          }
        }
      }

      state.projectBlocks.push(tempBlock);
      saveProjectBlocksToStorage(state.projectBlocks);
      state.widgetEditor = {
        isOpen: true,
        widgetType,
        widgetData: tempBlock.data,
        tempBlockId,
        editingBlockId: null,
      };
    },
    // Обновление данных виджета в редакторе
    updateWidgetData: (state, action) => {
      const { data } = action.payload;

      // Если изменяется стиль для link виджета, автоматически создаем нужное количество ссылок
      if (state.widgetEditor.widgetType === "link" && data.style) {
        const currentStyle = state.widgetEditor.widgetData.style;
        const newStyle = data.style;

        // Определяем количество ссылок для каждого стиля
        // Для cardSolid максимум 2 карточки
        const linksCount = {
          featured: 1,
          cardImage: 2,
          cardSolid: 2, // максимум 2 карточки
        };

        const requiredCount = linksCount[newStyle] || 1;
        const currentLinks = state.widgetEditor.widgetData.links || [];

        // Если стиль изменился, создаем/удаляем ссылки
        if (currentStyle !== newStyle) {
          // Создаем массив с нужным количеством ссылок
          const newLinks = [];
          for (let i = 0; i < requiredCount; i++) {
            if (currentLinks[i]) {
              // Используем существующую ссылку, если она есть
              newLinks.push(currentLinks[i]);
            } else {
              // Создаем новую ссылку
              const lastLink = currentLinks[currentLinks.length - 1] || {};
              newLinks.push({
                id: uuidv4(),
                image: lastLink.image || null,
                subtitle: lastLink.subtitle || "",
                title: lastLink.title || "",
                linkText: lastLink.linkText || "",
                linkUrl: lastLink.linkUrl || "",
              });
            }
          }

          data.links = newLinks;
        }
      }

      // Если изменяется стиль для carousel виджета на showcase, автоматически добавляем слайды до минимума 3
      if (state.widgetEditor.widgetType === "carousel" && data.style) {
        const currentStyle = state.widgetEditor.widgetData.style;
        const newStyle = data.style;

        // Если стиль изменился на showcase, убеждаемся что есть минимум 3 слайда
        if (currentStyle !== newStyle && newStyle === "showcase") {
          const currentSlides = state.widgetEditor.widgetData.slides || [];
          const minSlidesCount = 3;

          if (currentSlides.length < minSlidesCount) {
            const slidesToAdd = minSlidesCount - currentSlides.length;
            const lastSlide = currentSlides[currentSlides.length - 1] || {};

            const newSlides = [...currentSlides];
            for (let i = 0; i < slidesToAdd; i++) {
              newSlides.push({
                id: uuidv4(),
                image: lastSlide.image || null,
                subtitle: lastSlide.subtitle || "",
                title: lastSlide.title || "",
                linkText: lastSlide.linkText || "",
                linkUrl: lastSlide.linkUrl || "",
              });
            }

            data.slides = newSlides;
          }
        }
      }

      state.widgetEditor.widgetData = {
        ...state.widgetEditor.widgetData,
        ...data,
      };

      // Обновляем данные в блоке (временном или существующем)
      const blockId =
        state.widgetEditor.editingBlockId || state.widgetEditor.tempBlockId;
      if (blockId) {
        const block = state.projectBlocks.find((block) => block.id === blockId);
        if (block) {
          block.data = {
            ...block.data,
            ...state.widgetEditor.widgetData,
          };
          saveProjectBlocksToStorage(state.projectBlocks);
        }
      }
    },
    // Добавление слайда в carousel
    addCarouselSlide: (state) => {
      if (state.widgetEditor.widgetType === "carousel") {
        if (!state.widgetEditor.widgetData.slides) {
          state.widgetEditor.widgetData.slides = [];
        }

        // Копируем данные из последнего слайда, если он есть
        const lastSlide =
          state.widgetEditor.widgetData.slides.length > 0
            ? state.widgetEditor.widgetData.slides[
                state.widgetEditor.widgetData.slides.length - 1
              ]
            : null;

        const newSlide = {
          id: uuidv4(),
          image: lastSlide?.image || null,
          subtitle: lastSlide?.subtitle || "",
          title: lastSlide?.title || "",
          linkText: lastSlide?.linkText || "",
          linkUrl: lastSlide?.linkUrl || "",
        };

        state.widgetEditor.widgetData.slides.push(newSlide);

        // Обновляем в блоке
        const blockId =
          state.widgetEditor.editingBlockId || state.widgetEditor.tempBlockId;
        if (blockId) {
          const block = state.projectBlocks.find(
            (block) => block.id === blockId
          );
          if (block) {
            if (!block.data.slides) {
              block.data.slides = [];
            }
            block.data.slides.push(newSlide);
            saveProjectBlocksToStorage(state.projectBlocks);
          }
        }
      }
    },
    // Удаление слайда из carousel
    removeCarouselSlide: (state, action) => {
      if (state.widgetEditor.widgetType === "carousel") {
        const slideId = action.payload;
        const currentStyle = state.widgetEditor.widgetData.style || "featured";
        const currentSlides = state.widgetEditor.widgetData.slides || [];

        // Для стиля showcase нельзя удалять слайды, если их будет меньше 3
        if (currentStyle === "showcase" && currentSlides.length <= 3) {
          // Не удаляем слайд, если это приведет к менее чем 3 слайдам
          return;
        }

        if (state.widgetEditor.widgetData.slides) {
          state.widgetEditor.widgetData.slides =
            state.widgetEditor.widgetData.slides.filter(
              (slide) => slide.id !== slideId
            );
        }

        // Обновляем в блоке
        const blockId =
          state.widgetEditor.editingBlockId || state.widgetEditor.tempBlockId;
        if (blockId) {
          const block = state.projectBlocks.find(
            (block) => block.id === blockId
          );
          if (block && block.data.slides) {
            block.data.slides = block.data.slides.filter(
              (slide) => slide.id !== slideId
            );
            saveProjectBlocksToStorage(state.projectBlocks);
          }
        }
      }
    },
    // Обновление слайда в carousel
    updateCarouselSlide: (state, action) => {
      if (state.widgetEditor.widgetType === "carousel") {
        const { slideId, data } = action.payload;
        if (state.widgetEditor.widgetData.slides) {
          const slide = state.widgetEditor.widgetData.slides.find(
            (s) => s.id === slideId
          );
          if (slide) {
            Object.assign(slide, data);
          }
        }

        // Обновляем в блоке
        const blockId =
          state.widgetEditor.editingBlockId || state.widgetEditor.tempBlockId;
        if (blockId) {
          const block = state.projectBlocks.find(
            (block) => block.id === blockId
          );
          if (block && block.data.slides) {
            const blockSlide = block.data.slides.find((s) => s.id === slideId);
            if (blockSlide) {
              Object.assign(blockSlide, data);
              saveProjectBlocksToStorage(state.projectBlocks);
            }
          }
        }
      }
    },
    // Обновление ссылки в link виджете
    updateLink: (state, action) => {
      if (state.widgetEditor.widgetType === "link") {
        const { linkId, data } = action.payload;
        if (state.widgetEditor.widgetData.links) {
          const link = state.widgetEditor.widgetData.links.find(
            (l) => l.id === linkId
          );
          if (link) {
            Object.assign(link, data);
          }
        }

        // Обновляем в блоке
        const blockId =
          state.widgetEditor.editingBlockId || state.widgetEditor.tempBlockId;
        if (blockId) {
          const block = state.projectBlocks.find(
            (block) => block.id === blockId
          );
          if (block && block.data.links) {
            const blockLink = block.data.links.find((l) => l.id === linkId);
            if (blockLink) {
              Object.assign(blockLink, data);
              saveProjectBlocksToStorage(state.projectBlocks);
            }
          }
        }
      }
    },
    // Сохранение виджета (закрытие редактора)
    saveWidget: (state) => {
      // Сохраняем финальное состояние блоков перед закрытием редактора
      saveProjectBlocksToStorage(state.projectBlocks);
      state.widgetEditor = {
        isOpen: false,
        widgetType: null,
        widgetData: {},
        tempBlockId: null,
        editingBlockId: null,
      };
    },
    // Сохранение виджета и проекта на сервер
    saveWidgetAndProject: (state) => {
      // Сохраняем финальное состояние блоков перед закрытием редактора
      saveProjectBlocksToStorage(state.projectBlocks);
      state.widgetEditor = {
        isOpen: false,
        widgetType: null,
        widgetData: {},
        tempBlockId: null,
        editingBlockId: null,
      };
      // Флаг для индикации, что нужно сохранить проект на сервер
      state.shouldSaveProject = true;
    },
    // Установка флага сохранения проекта
    setShouldSaveProject: (state) => {
      state.shouldSaveProject = true;
    },
    // Сброс флага сохранения проекта
    resetShouldSaveProject: (state) => {
      state.shouldSaveProject = false;
    },
    // Отмена редактирования (удаление временного блока)
    cancelWidgetEdit: (state) => {
      // Удаляем только временный блок, если редактировали новый
      // Если редактировали существующий блок, просто закрываем редактор
      if (state.widgetEditor.tempBlockId) {
        state.projectBlocks = state.projectBlocks.filter(
          (block) => block.id !== state.widgetEditor.tempBlockId
        );
        // Обновляем порядковые номера
        state.projectBlocks.forEach((block, index) => {
          block.order = index + 1;
        });
        saveProjectBlocksToStorage(state.projectBlocks);
      } else if (state.widgetEditor.editingBlockId) {
        // Если редактировали существующий блок, откатываем изменения
        const existingBlock = state.projectBlocks.find(
          (block) => block.id === state.widgetEditor.editingBlockId
        );
        // Можно восстановить из какого-то сохраненного состояния,
        // но для простоты просто закрываем редактор - изменения уже применены
      }
      state.widgetEditor = {
        isOpen: false,
        widgetType: null,
        widgetData: {},
        tempBlockId: null,
        editingBlockId: null,
      };
    },
    // Закрытие редактора виджета (без удаления блока)
    closeWidgetEditor: (state) => {
      state.widgetEditor = {
        isOpen: false,
        widgetType: null,
        widgetData: {},
        tempBlockId: null,
        editingBlockId: null,
      };
    },
    // Добавление продукта
    addProduct: (state, action) => {
      // Используем id из payload (который приходит с сервера), если его нет - генерируем UUID как fallback
      const newProduct = {
        id: action.payload.id || uuidv4(),
        ...action.payload,
      };
      state.products.push(newProduct);
      saveProductsToStorage(state.products);
    },
    // Удаление продукта
    removeProduct: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
      saveProductsToStorage(state.products);
    },
    // Обновление продукта
    updateProduct: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.products.findIndex((product) => product.id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updatedData };
        saveProductsToStorage(state.products);
      }
    },
    // Установка списка продуктов (для загрузки с сервера)
    setProducts: (state, action) => {
      state.products = action.payload;
      saveProductsToStorage(state.products);
    },
    // Установка блоков проекта (для загрузки с сервера)
    setProjectBlocks: (state, action) => {
      state.projectBlocks = action.payload;
      saveProjectBlocksToStorage(state.projectBlocks);
    },
  },
});

export const {
  openModal,
  pushProject,
  toggleAddModal,
  removeProject,
  toggleEditModal,
  updateProject,
  addProjectBlock,
  removeProjectBlock,
  reorderProjectBlocks,
  openWidgetEditor,
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  setShouldSaveProject,
  resetShouldSaveProject,
  cancelWidgetEdit,
  closeWidgetEditor,
  addCarouselSlide,
  removeCarouselSlide,
  updateCarouselSlide,
  updateLink,
  addProduct,
  removeProduct,
  updateProduct,
  setProducts,
  setProjectBlocks,
} = appProjectSlice.actions;
export default appProjectSlice.reducer;
