import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import LinkWidget from "./linkWidget";
import CaruselWidget from "./caruselWidget";
import ProductWidget from "./productWidget";
import TextWidget from "./textWidget";
import EmbetWidget from "./embetWidget";
import DisplayWidgets from "./dispalyWidgets";
import Icon from "@/components/ui/Icon";
import CarouselWidget from "./CarouselWidget";
import Products from "../partials/widget/products";
import PriceTableWidget from "./priceTableWidget";
import BackgroundEditor from "../partials/settings/Tools/BackgroundEditor";

import {
  removeProjectBlock,
  openWidgetEditor,
} from "@/pages/app/projects/store";
import { handleCustomizer } from "@/store/layout";
import VideoWidget from "./videoWidget";

const BlockRenderer = ({ block, onEdit, redactor }) => {
  const { type } = block;
  if (type === "background" || type === "leftColVideo") return null;

  switch (type) {
    case "Connect":
      // Определяем layout из данных
      const displayLayout = block.data?.layout || "single-row";
      return (
        <DisplayWidgets
          layout={displayLayout}
          onEdit={onEdit}
          redactor={redactor}
        />
      );
    case "link":
      // count - это номер варианта стиля, не количество карточек
      const linkStyle = block.data?.style || "featured";
      const styleToCount = {
        featured: 1,
        cardImage: 2,
        cardSolid: 3,
      };
      const linkCount = styleToCount[linkStyle] || 1;
      return (
        <LinkWidget
          count={linkCount}
          data={block.data}
          onEdit={onEdit}
          redactor={redactor}
        />
      );
    case "carousel":
      // Определяем card на основе стиля
      const carouselStyle = block.data?.style || "featured";
      const cardValue = carouselStyle === "showcase"; // featured = false, showcase = true
      return (
        <CaruselWidget
          card={cardValue}
          data={block.data}
          onEdit={onEdit}
          redactor={redactor}
        />
      );
    case "products":
      return (
        <ProductWidget data={block.data} onEdit={onEdit} redactor={redactor} />
      );
    case "embet":
      // Определяем small на основе стиля
      const embetStyle = block.data?.style || "large";
      const smallValue = embetStyle === "small"; // small = true, large = false
      return (
        <EmbetWidget
          small={smallValue}
          data={block.data}
          onEdit={onEdit}
          redactor={redactor}
        />
      );
    case "tablePrice":
      return <PriceTableWidget />;
    case "promoVideo":
      return <VideoWidget redactor={true} onEdit={onEdit} />;
    case "sectionText":
      return (
        <TextWidget data={block.data} onEdit={onEdit} redactor={redactor} />
      );
    default:
      return <div>Unknown block type: {type}</div>;
  }
};

const SortableBlock = ({ block, redactor }) => {
  const dispatch = useDispatch();
  const { type } = block;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(removeProjectBlock(block.id));
  };

  const handleEdit = () => {
    // Открываем панель настроек, если она закрыта
    dispatch(handleCustomizer(true));
    // Открываем редактор виджета
    dispatch(openWidgetEditor({ widgetType: block.type, blockId: block.id }));
  };

  // Для background блоков не показываем кнопки управления
  const isBackgroundBlock = type === "background";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-5 ${isDragging ? "z-50" : ""}`}
    >
      {/* Для background блоков не показываем кнопки управления */}
      {redactor && !isBackgroundBlock && (
        <>
          {/* Контейнер для кнопок управления */}
          <div className="absolute -top-3 -right-3 z-10 flex flex-row-reverse gap-2">
            {/* Иконка для перетаскивания */}
            <div
              {...attributes}
              {...listeners}
              className="bg-slate-600 hover:bg-slate-700 active:bg-slate-500 text-white rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none shadow-lg transition-colors"
              title="Drag block"
              style={{ touchAction: "none" }}
            >
              <Icon
                icon="heroicons-outline:bars-3"
                className="text-base md:text-sm"
              />
            </div>

            {/* Кнопка удаления */}
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center shadow-lg transition-colors"
              title="Delete block"
            >
              <Icon
                icon="heroicons-outline:trash"
                className="text-base md:text-sm"
              />
            </button>
          </div>
        </>
      )}

      {/* Контент блока */}
      <div
        className={`rounded-[6px] relative overflow-hidden ${
          redactor && !isBackgroundBlock ? "border border-primary-500 mb-5" : ""
        }`}
      >
        {redactor && !isBackgroundBlock && (
          <div className="absolute z-10 bg-blue-600 p-1 rounded-[6px] flex items-center gap-2 text-[12px] top-2 left-2">
            <Icon icon="el:wrench" />
          </div>
        )}
        <BlockRenderer block={block} onEdit={handleEdit} redactor={redactor} />
      </div>
    </div>
  );
};

export default SortableBlock;
