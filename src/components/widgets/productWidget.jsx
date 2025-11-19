import React from "react";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";
import cardImage2 from "@/assets/images/all-img/card-2.png";

const productWidget = ({ data = {}, onEdit, redactor }) => {
  const allProducts = useSelector((state) => state.project.products || []);
  const selectedProductIds = data?.selectedProducts || [];

  // Отладочное логирование
  if (selectedProductIds.length > 0) {
    console.log("🔍 ProductWidget - selectedProductIds:", selectedProductIds);
    console.log("🔍 ProductWidget - allProducts:", allProducts);
  }

  // Получаем выбранные продукты в правильном порядке из selectedProductIds
  // Важно: сравниваем ID с приведением типов, так как с сервера могут приходить числа, а в store - строки
  const selectedProducts = selectedProductIds
    .map((id) => {
      const product = allProducts.find(
        (product) => String(product.id) === String(id) || product.id === id
      );
      if (!product && selectedProductIds.length > 0) {
        console.warn(
          `⚠️ Продукт с ID ${id} не найден в списке продуктов. Доступные ID:`,
          allProducts.map((p) => p.id)
        );
      }
      return product;
    })
    .filter(Boolean);

  if (selectedProductIds.length > 0) {
    console.log("✅ ProductWidget - найденные продукты:", selectedProducts);
  }

  // Преобразуем выбранные продукты в формат slidesData
  const slidesData = selectedProducts.map((product) => ({
    id: product.id,
    brand: product.shopName || "Brand",
    title: product.title,
    mark: product.rating || 0,
    text: product.description || "",
    image: product.thumbnail || cardImage2,
    price: product.price || 0,
    currency: product.currency || "USD",
    link: product.url || "#",
  }));

  const handleContainerClick = (e) => {
    // Открываем редактор при клике на контейнер
    if (redactor) {
      e.preventDefault();
      e.stopPropagation();
      onEdit?.();
    } else {
      return;
    }
  };

  // Если нет выбранных продуктов, показываем пустое состояние
  if (slidesData.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center cursor-pointer"
        onClick={handleContainerClick}
      >
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          No products selected
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Click to add products to this widget
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-5 cursor-pointer 
                 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
      onClick={handleContainerClick}
    >
      {slidesData.map((slide) => (
        <a
          href={slide.link}
          key={slide.id}
          className="block w-full"
          onClick={(e) => {
            // Если в режиме редактирования, предотвращаем переход по ссылке
            if (redactor) {
              e.preventDefault();
            }
          }}
        >
          <Card
            bodyClass="p-0 flex flex-col h-full"
            className="!bg-transparent w-full"
          >
            <div className="h-[140px] w-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="block w-full h-full object-cover rounded-t-md"
                onError={(e) => {
                  e.target.src = cardImage2;
                }}
              />
            </div>
            <div className="p-6 flex flex-col flex-grow justify-between">
              <header className="mb-2">
                <p className="text-[12px] text-gray-400">{slide.brand}</p>
                <div className="flex justify-between items-center">
                  <div className="text-[14px] font-medium text-[#cbd5e1]">
                    {slide.title}
                  </div>
                  {slide.mark > 0 && (
                    <div className="text-[14px] text-[#cbd5e1]">
                      {slide.mark} ★
                    </div>
                  )}
                </div>
              </header>
              {slide.text && (
                <div className="text-[12px] text-gray-500 flex-grow">
                  {slide.text}
                </div>
              )}
              <div className="mt-4 text-[#cbd5e1]">
                {slide.currency} {slide.price}
              </div>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
};

export default productWidget;
