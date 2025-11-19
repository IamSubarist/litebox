import React, { useState, useEffect } from "react";
import wbg5 from "@/assets/images/all-img/widget-bg-4.png";
import wbg3 from "@/assets/images/all-img/widget-bg-3.png";
import wbg4 from "@/assets/images/all-img/widget-bg-3.png";
import vectorImage from "@/assets/images/svg/widgetvector.svg";
import Icon from "@/components/ui/Icon";
import { getContentUrl } from "@/pages/app/projects/api";

const linkWidget = ({ count, data, onEdit, redactor }) => {
  const [imageUrls, setImageUrls] = useState({});

  // Функция для получения URL изображения (обрабатывает File объекты и строки)
  const getImageUrl = (image, linkId) => {
    if (!image) return null;
    if (image instanceof File) {
      // Если это File объект, используем object URL
      if (!imageUrls[linkId]) {
        const url = URL.createObjectURL(image);
        setImageUrls((prev) => ({ ...prev, [linkId]: url }));
        return url;
      }
      return imageUrls[linkId];
    }
    // Если это строка (URL или content_path), преобразуем в полный URL если нужно
    if (typeof image === "string") {
      return getContentUrl(image);
    }
    return null;
  };

  // Очистка object URLs при размонтировании
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Очистка старых object URLs при изменении данных
  useEffect(() => {
    if (!data?.links) return;

    const currentLinkIds = new Set(data.links.map(link => link.id));
    
    // Удаляем URLs для ссылок, которых больше нет
    Object.keys(imageUrls).forEach((linkId) => {
      if (!currentLinkIds.has(linkId)) {
        const url = imageUrls[linkId];
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
        setImageUrls((prev) => {
          const newUrls = { ...prev };
          delete newUrls[linkId];
          return newUrls;
        });
      }
    });
  }, [data?.links]);

  // Моковые данные для отображения при создании нового виджета
  const mockData = [
    {
      title: "Card Title 1",
      subtitle: "Lorem ipsum dolor sit amet.",
      badge: "Learn more",
      background: wbg3,
      href: "#",
    },
    {
      title: "Card Title 2",
      subtitle: "Sed ut perspiciatis unde.",
      badge: "Learn more",
      background: wbg5,
      href: "#",
    },
  ];

  // Функция для проверки, все ли поля (кроме linkUrl) пустые
  const isLinkEmpty = (link) => {
    const hasImage = link.image && (
      (link.image instanceof File) || 
      (typeof link.image === "string" && link.image.trim() !== "")
    );
    
    return (
      (!link.title || link.title.trim() === "") &&
      (!link.subtitle || link.subtitle.trim() === "") &&
      (!link.linkText || link.linkText.trim() === "") &&
      !hasImage
    );
  };

  // Используем массив links из данных, если они есть
  let cardData = [];

  if (data && data.links && data.links.length > 0) {
    // Используем данные из массива links
    cardData = data.links.map((link, index) => {
      // Проверяем, все ли поля пустые (кроме linkUrl и image)
      const isEmpty = isLinkEmpty(link);
      const hasImage = link.image && (
        (link.image instanceof File) || 
        (typeof link.image === "string" && link.image.trim() !== "")
      );
      const hasLinkUrl =
        link.linkUrl &&
        typeof link.linkUrl === "string" &&
        link.linkUrl.trim() !== "" &&
        link.linkUrl.trim() !== "#";
      const mockCard = mockData[index] || mockData[0];

      // Получаем URL изображения (для File объектов создаем object URL)
      const imageUrl = hasImage ? getImageUrl(link.image, link.id) : null;

      // Если все поля пустые - показываем моковые данные
      // Поля в store остаются пустыми, но для отображения используем моки
      // Если linkUrl заполнен, используем его, иначе используем моковый href
      if (isEmpty) {
        return {
          title: mockCard.title,
          subtitle: mockCard.subtitle,
          badge: mockCard.badge,
          background: imageUrl || mockCard.background,
          href: hasLinkUrl ? link.linkUrl : mockCard.href,
        };
      }

      // Если нет изображения, но есть другие данные - показываем моковое изображение
      // Но используем реальные данные для остальных полей
      if (!hasImage) {
        return {
          title: link.title || "",
          subtitle: link.subtitle || "",
          badge: link.linkText || "",
          background: mockCard.background,
          href: link.linkUrl || "#",
        };
      }

      // Если изображение загружено, показываем реальные данные с пользовательским фото
      return {
        title: link.title || "",
        subtitle: link.subtitle || "",
        badge: link.linkText || "",
        background: imageUrl,
        href: link.linkUrl || "#",
      };
    });
  } else {
    // Если данных нет, показываем моки
    cardData = mockData;
  }

  // count - это номер варианта стиля, не количество карточек
  // 1 = featured (1 карточка)
  // 2 = cardImage (2 карточки)
  // 3 = cardSolid (максимум 2 карточки)
  const cardsToShow =
    count === 1
      ? cardData.slice(0, 1)
      : count === 2
      ? cardData.slice(0, 2)
      : count === 3
      ? cardData.slice(0, 2) // cardSolid - максимум 2 карточки
      : cardData.slice(0, 2); // по умолчанию максимум 2

  const handleContainerClick = (e) => {
    if (redactor) {
      e.preventDefault();
      e.stopPropagation();
      onEdit?.();
      return;
    } else {
      return;
    }
    // Если клик по ссылке, не открываем редактор
    // if (e.target.closest("a")) {
    //   return;
    // }
    // // Иначе открываем редактор
    // if (onEdit) {
    //   e.stopPropagation();
    //   onEdit();
    // }
  };

  return (
    <div className="space-y-5 relative group" onClick={handleContainerClick}>
      <div
        className={`grid grid-cols-1 gap-5 ${
          count === 1
            ? "md:grid-cols-1"
            : count === 2
            ? "md:grid-cols-2"
            : "md:grid-cols-2"
        }`}
      >
        {cardsToShow.map((card, index) => (
          <a key={index} href={card.href}>
            <div
              className={`${
                card.background
                  ? "bg-no-repeat bg-cover bg-center"
                  : "bg-slate-700"
              } p-5 rounded-[6px] relative flex items-center ${
                count === 1
                  ? "min-h-[200px]"
                  : count === 2
                  ? "h-[250px]"
                  : "min-h-[100px]"
              }`}
              style={
                card.background
                  ? { backgroundImage: `url(${card.background})` }
                  : {}
              }
            >
              {count === 3 && card.background && (
                <div className="absolute inset-0 bg-black/40" />
              )}
              <div
                className={`flex flex-col justify-between h-full w-full ${
                  count === 3 && card.background ? "relative z-10" : ""
                }`}
              >
                {card.badge && (
                  <p className="inline-block text-sm text-white font-normal border border-white px-2 py-1 rounded self-start">
                    <a href={card.href}>{card.badge}</a>
                  </p>
                )}

                {(card.title || card.subtitle) && (
                  <div className="text-xl font-medium text-white mt-2">
                    {card.title && (
                      <span className="block font-normal">{card.title}</span>
                    )}
                    {card.subtitle && (
                      <span className="block text-[14px]">{card.subtitle}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default linkWidget;
