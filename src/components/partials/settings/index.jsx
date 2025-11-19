import React, { Fragment, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useSelector, useDispatch } from "react-redux";
import { Transition } from "@headlessui/react";
import { handleCustomizer } from "@/store/layout";
import SimpleBar from "simplebar-react";
import MediaFeedConnect from "./Tools/MediaFeedConnect";
import ContentSharing from "./Tools/ContentSharing";
import LinkWidgetEditor from "./Tools/LinkWidgetEditor";
import CarouselWidgetEditor from "./Tools/CarouselWidgetEditor";
import SectionTextEditor from "./Tools/SectionTextEditor";
import EmbetWidgetEditor from "./Tools/EmbetWidgetEditor";
import DisplayWidgetsEditor from "./Tools/DisplayWidgetsEditor";
import ProductsWidgetEditor from "./Tools/ProductsWidgetEditor";
import EmbedServiceSelector from "./Tools/EmbedServiceSelector";
import VideoWidgetEditor from "./Tools/VideoWidgetEditor";
import SocialLinkWidgetEditor from "./Tools/SocialLinkWidgetEditor";
import ButtonWidgetEditor from "./Tools/ButtonWidgetEditor";
import ProfileWidgetEditor from "./Tools/ProfileWidgetEditor";
import useWidth from "@/hooks/useWidth";
import {
  addProjectBlock,
  openWidgetEditor,
  closeWidgetEditor,
} from "@/pages/app/projects/store";
import BackgroundEditor from "./Tools/BackgroundEditor";
import ChooseProductCard from "./Tools/ChooseProductCard";
import ChoosePoseCard from "./Tools/ChoosePoseCard";

const Settings = () => {
  const isOpen = useSelector((state) => state.layout.customizer);
  const widgetEditor = useSelector((state) => state.project.widgetEditor);
  const dispatch = useDispatch();
  // ** Toggles  Customizer Open
  const setCustomizer = (val) => dispatch(handleCustomizer(val));

  const { width, breakpoints } = useWidth();
  const scrollContainerRef = useRef(null);

  // Предотвращаем скролл страницы при скролле внутри меню
  useEffect(() => {
    if (!isOpen) return;

    let touchStartY = 0;

    const handleWheel = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Проверяем, что событие происходит внутри контейнера меню
      const target = e.target;
      if (!container.contains(target)) return;

      // Находим элемент с прокруткой SimpleBar
      const scrollElement = container.querySelector(
        ".simplebar-content-wrapper"
      );
      if (!scrollElement) {
        // Если не нашли элемент прокрутки, блокируем скролл страницы
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtTop = scrollTop <= 1; // Небольшой допуск для точности
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const deltaY = e.deltaY;

      // Если скроллим вверх и уже наверху, или скроллим вниз и уже внизу
      // Блокируем скролл страницы, чтобы предотвратить "прокрутку цепочки"
      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        e.preventDefault();
        e.stopPropagation();
      }
      // В остальных случаях SimpleBar сам обработает скролл,
      // но мы блокируем распространение на страницу
      e.stopPropagation();
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Проверяем, что событие происходит внутри контейнера меню
      const target = e.target;
      if (!container.contains(target)) return;

      const scrollElement = container.querySelector(
        ".simplebar-content-wrapper"
      );
      if (!scrollElement) {
        // Если не нашли элемент прокрутки, блокируем скролл страницы
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.touches.length === 0) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtTop = scrollTop <= 1; // Небольшой допуск для точности
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Если скроллим вверх и уже наверху, или скроллим вниз и уже внизу
      if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
        // Блокируем скролл страницы
        e.preventDefault();
        e.stopPropagation();
      }
      // В остальных случаях SimpleBar сам обработает скролл,
      // но мы блокируем распространение на страницу
      e.stopPropagation();
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [isOpen]);

  const handleAddBlock = (type, widgetData) => {
    if (
      type === "link" ||
      type === "carousel" ||
      type === "sectionText" ||
      type === "embet" ||
      type === "Connect" ||
      type === "products" ||
      type === "embedServiceSelector" ||
      type === "leftColSocialLink" ||
      type === "leftColButtonWidget"
    ) {
      // Для этих типов открываем редактор
      dispatch(openWidgetEditor({ widgetType: type, widgetData }));
    } else if (type === "background") {
      // Просто открываем редактор background, НЕ создавая блок
      dispatch(openWidgetEditor({ widgetType: "background", widgetData }));
    } else {
      // Для остальных виджетов добавляем сразу
      dispatch(addProjectBlock({ type, data: widgetData }));
    }
  };

  return (
    <div>
      {!isOpen && (
        <span
          className="fixed ltr:md:right-[-32px] ltr:right-0 rtl:left-0 rtl:md:left-[-32px] top-1/2 z-[888] translate-y-1/2 bg-slate-800 text-slate-50 dark:bg-slate-700 dark:text-slate-300 cursor-pointer transform rotate-90 flex items-center text-sm font-medium px-2 py-2 shadow-deep ltr:rounded-b rtl:rounded-t"
          onClick={() => {
            // Сбрасываем состояние редактора виджетов
            dispatch(closeWidgetEditor());
            // Открываем меню выбора виджетов
            setCustomizer(true);
          }}
        >
          <Icon
            icon="clarity:settings-line"
            className="text-slate-50 text-lg animate-spin"
          />
          <span className="hidden md:inline-block ltr:ml-2 rtl:mr-2">
            AI Config
          </span>
        </span>
      )}

      <div
        className={`
        setting-wrapper fixed ltr:right-0 rtl:left-0 top-0 max-[500px]:w-full w-[400px]
         bg-white dark:bg-slate-800 h-screen z-[9999]  md:pb-6 pb-[100px] shadow-base2
          dark:shadow-base3 border border-slate-200 dark:border-slate-700 transition-all duration-150
          ${
            isOpen
              ? "translate-x-0 opacity-100 visible"
              : "ltr:translate-x-full rtl:-translate-x-full opacity-0 invisible"
          }
        `}
      >
        <div
          ref={scrollContainerRef}
          className="h-full"
          style={{ overscrollBehavior: "contain" }}
        >
          <SimpleBar className="px-6 h-full">
            {/* Если открыт редактор виджета, показываем его */}
            {widgetEditor.isOpen && widgetEditor.widgetType === "link" ? (
              <LinkWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "carousel" ? (
              <CarouselWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "sectionText" ? (
              <SectionTextEditor />
            ) : widgetEditor.isOpen && widgetEditor.widgetType === "embet" ? (
              <EmbetWidgetEditor />
            ) : widgetEditor.isOpen && widgetEditor.widgetType === "Connect" ? (
              <DisplayWidgetsEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "products" ? (
              <ProductsWidgetEditor />
            ) : widgetEditor.isOpen && widgetEditor.widgetType === "Connect" ? (
              <DisplayWidgetsEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "promoVideo" ? (
              <VideoWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "products" ? (
              <ProductsWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "embedServiceSelector" ? (
              <EmbedServiceSelector />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "background" ? (
              <BackgroundEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "leftColVideo" ? (
              <VideoWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "leftColSocialLink" ? (
              <SocialLinkWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "leftColButtonWidget" ? (
              <ButtonWidgetEditor />
            ) : widgetEditor.isOpen &&
              widgetEditor.widgetType === "leftColProfile" ? (
              <ProfileWidgetEditor />
            ) : (
              <>
                <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 -mx-6 px-6 py-[15px] mb-6">
                  <div>
                    <span className="tracking-[-0.3px] font-bold flex items-center gap-2 text-xl text-slate-900 dark:text-[#eee]">
                      <Icon
                        icon="clarity:settings-line"
                        className="text-slate-50 text-lg"
                      />
                      Configuring Image Generation
                    </span>
                    <span className="block text-sm font-light text-[#68768A] dark:text-[#eee]">
                      Customize & Preview in Real Time
                    </span>
                  </div>
                  <div
                    className="cursor-pointer text-2xl text-slate-800 dark:text-slate-200"
                    onClick={() => setCustomizer(false)}
                  >
                    <Icon icon="heroicons-outline:x" />
                  </div>
                </header>
                <div className=" space-y-4">
                  <MediaFeedConnect onAddBlock={handleAddBlock} />
                  <ChooseProductCard onAddBlock={handleAddBlock} />
                  <ChoosePoseCard onAddBlock={handleAddBlock} />
                  {/* <ContentSharing onAddBlock={handleAddBlock} /> */}
                  <button className="btn btn-primary w-full py-2 rounded-[4px]">
                    Generate
                  </button>
                </div>
              </>
            )}
          </SimpleBar>
        </div>
      </div>

      <Transition as={Fragment} show={isOpen}>
        <div
          className="overlay bg-white bg-opacity-0 fixed inset-0 z-[999]"
          onClick={() => setCustomizer(false)}
        ></div>
      </Transition>
    </div>
  );
};

export default Settings;
