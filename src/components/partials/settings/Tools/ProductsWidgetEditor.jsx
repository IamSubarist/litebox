import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  updateWidgetData,
  saveWidget,
  saveWidgetAndProject,
  cancelWidgetEdit,
  removeProjectBlock,
  setProducts,
} from "@/pages/app/projects/store";
import axios from "axios";
import { toast } from "react-toastify";

// Компонент для сортируемого элемента продукта
const SortableProductItem = ({ product, isSelected, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 py-2 ${isDragging ? "z-50" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        style={{ touchAction: "none" }}
      >
        <Icon
          icon="heroicons-outline:bars-3"
          className="text-slate-400 dark:text-slate-500 text-xl"
        />
      </div>
      {product.thumbnail && (
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-10 h-10 object-cover rounded-[6px] border border-slate-200 dark:border-slate-700 flex-shrink-0"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/40?text=No+Image";
          }}
        />
      )}
      <span className="text-sm font-medium text-slate-900 dark:text-[#eee] flex-1">
        {product.title}
      </span>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 flex-shrink-0"
      />
    </div>
  );
};

const ProductsWidgetEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { widgetData, editingBlockId } = useSelector(
    (state) => state.project.widgetEditor
  );
  const products = useSelector((state) => state.project.products || []);
  const [selectedProducts, setSelectedProducts] = useState(
    widgetData.selectedProducts || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Настройка сенсоров для drag & drop
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

  // Загружаем выбранные продукты из widgetData при монтировании
  useEffect(() => {
    if (widgetData.selectedProducts) {
      setSelectedProducts(widgetData.selectedProducts);
    }
  }, []); // Только при монтировании

  // Загрузка продуктов с сервера при открытии редактора
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("Токен авторизации не найден");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://socialdash.leverageindo.group/api/products",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Преобразуем данные из API формата в формат компонента
        const transformedProducts = response.data.items.map((item) => ({
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
        }));

        dispatch(setProducts(transformedProducts));

        // Очищаем selectedProducts от продуктов, которых больше нет в списке
        // Нормализуем ID для сравнения (приводим к строкам)
        const productIds = transformedProducts.map((p) => String(p.id));
        setSelectedProducts((prev) =>
          prev.filter((id) => productIds.includes(String(id)))
        );
      } catch (error) {
        console.error("Ошибка при загрузке продуктов:", error);
        toast.error("Не удалось загрузить список продуктов");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [dispatch]);

  // Синхронизируем выбранные продукты с widgetData
  useEffect(() => {
    dispatch(updateWidgetData({ data: { selectedProducts } }));
  }, [selectedProducts, dispatch]);

  const handleSave = () => {
    dispatch(saveWidgetAndProject());
  };

  const handleCancel = () => {
    dispatch(cancelWidgetEdit());
  };

  const handleDelete = () => {
    if (editingBlockId) {
      dispatch(removeProjectBlock(editingBlockId));
    }
    dispatch(cancelWidgetEdit());
  };

  const handleEditList = () => {
    navigate("/products");
  };

  const handleToggleProduct = (productId) => {
    setSelectedProducts((prev) => {
      // Сравниваем ID с приведением типов
      const isSelected = prev.some(
        (id) => String(id) === String(productId) || id === productId
      );
      if (isSelected) {
        return prev.filter(
          (id) => String(id) !== String(productId) && id !== productId
        );
      } else {
        return [...prev, productId];
      }
    });
  };

  // Обработка завершения drag & drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedProducts((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }

        const newOrder = [...prev];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);

        return newOrder;
      });
    }
  };

  // Получаем только выбранные продукты в правильном порядке
  // Важно: сравниваем ID с приведением типов, так как с сервера могут приходить числа, а в store - строки
  const getSelectedProductsInOrder = () => {
    return selectedProducts
      .map((id) =>
        products.find(
          (p) => String(p.id) === String(id) || p.id === id
        )
      )
      .filter(Boolean);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 -mx-6 px-6 py-[15px] mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400"
          >
            <Icon icon="heroicons-outline:arrow-left" className="text-xl" />
          </button>
          <span className="font-bold text-xl text-slate-900 dark:text-[#eee]">
            Products
          </span>
        </div>
        <Button
          text="Save"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6"
          onClick={handleSave}
        />
      </div>

      {/* Products List or Empty State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Icon
            icon="line-md:loading-twotone-loop"
            className="text-6xl text-slate-400 dark:text-slate-500 mb-4"
          />
          <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 mb-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedProducts}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {/* Сначала показываем выбранные продукты в порядке selectedProducts */}
                  {getSelectedProductsInOrder().map((product) => (
                    <SortableProductItem
                      key={product.id}
                      product={product}
                      isSelected={true}
                      onToggle={() => handleToggleProduct(product.id)}
                    />
                  ))}
                  {/* Затем показываем невыбранные продукты */}
                  {products
                    .filter(
                      (product) =>
                        !selectedProducts.some(
                          (id) =>
                            String(id) === String(product.id) ||
                            id === product.id
                        )
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="w-5 flex-shrink-0" />{" "}
                        {/* Отступ для иконки drag */}
                        {product.thumbnail && (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded-[6px] border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/40?text=No+Image";
                            }}
                          />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-[#eee] flex-1">
                          {product.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleProduct(product.id)}
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 flex-shrink-0"
                        />
                      </div>
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          <div className="px-4 mb-4">
            <button
              onClick={handleEditList}
              className="text-slate-900 dark:text-[#eee] hover:text-primary-500 transition-colors text-sm"
            >
              Edit List in <span className="underline">Products</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="font-bold text-xl text-slate-900 dark:text-[#eee] mb-4">
            Ready to Add Products?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md">
            Go to the Products page to begin adding items to your list.
          </p>
          <button
            onClick={handleEditList}
            className="text-slate-900 dark:text-[#eee] hover:text-primary-500 transition-colors"
          >
            Edit List in <span className="underline">Products</span>
          </button>
        </div>
      )}

      <div className="mt-auto pt-6">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[6px] border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-[#eee] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Icon icon="heroicons-outline:trash" className="text-xl" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ProductsWidgetEditor;
