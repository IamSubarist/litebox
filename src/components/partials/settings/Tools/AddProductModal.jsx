import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { addProduct, updateProduct } from "@/pages/app/projects/store";
import { toast } from "react-toastify";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Схема валидации
const productSchema = yup
  .object({
    url: yup
      .string()
      .required("Product URL is required")
      .url("Please enter a valid URL")
      .test("protocol", "URL must start with http:// or https://", (value) => {
        if (!value) return true;
        return value.startsWith("http://") || value.startsWith("https://");
      })
      .max(2048, "URL must not exceed 2048 characters"),
    title: yup
      .string()
      .required("Product Title is required")
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters")
      .test(
        "not-only-spaces",
        "Title cannot be only spaces",
        (value) => value && value.trim().length > 0
      ),
    shopName: yup
      .string()
      .required("Shop Name is required")
      .trim()
      .min(2, "Shop Name must be at least 2 characters")
      .max(100, "Shop Name must not exceed 100 characters")
      .test(
        "not-only-spaces",
        "Shop Name cannot be only spaces",
        (value) => value && value.trim().length > 0
      ),
    price: yup
      .string()
      .required("Product Price is required")
      .test("is-positive", "Price must be greater than 0", (value) => {
        if (!value) return false;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue > 0;
      })
      .test("max-value", "Price must not exceed 999999999.99", (value) => {
        if (!value) return false;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue <= 999999999.99;
      }),
    rating: yup
      .string()
      .nullable()
      .test("range", "Rating must be between 0 and 5", (value) => {
        if (!value || value.trim() === "") return true;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 && numValue <= 5;
      })
      .test("decimal", "Rating can have maximum 1 decimal place", (value) => {
        if (!value || value.trim() === "") return true;
        const parts = value.split(".");
        return parts.length <= 2 && (!parts[1] || parts[1].length <= 1);
      }),
  })
  .required();

const AddProductModal = ({ activeModal, onClose, editingProduct = null }) => {
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onBlur",
    defaultValues: {
      url: "",
      title: "",
      shopName: "",
      price: "",
      currency: "USD",
      rating: "",
    },
  });

  // Загрузка списка валют с сервера
  useEffect(() => {
    const fetchCurrencies = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("Токен авторизации не найден");
        return;
      }

      try {
        const response = await axios.get(
          "https://socialdash.leverageindo.group/api/general/currencies",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data?.currencies && response.data.currencies.length > 0) {
          setCurrencies(response.data.currencies);
        }
      } catch (error) {
        console.error("Ошибка при загрузке валют:", error);
        // В случае ошибки используем дефолтные валюты
        setCurrencies(["USD", "EUR", "RUB"]);
      }
    };

    if (activeModal) {
      fetchCurrencies();
    }
  }, [activeModal]);

  // Установка первой валюты по умолчанию при загрузке списка
  useEffect(() => {
    if (currencies.length > 0 && !editingProduct && activeModal) {
      setValue("currency", currencies[0]);
    }
  }, [currencies, editingProduct, activeModal, setValue]);

  // Заполняем форму данными продукта при редактировании
  useEffect(() => {
    if (editingProduct) {
      reset({
        url: editingProduct.url || "",
        title: editingProduct.title || "",
        shopName: editingProduct.shopName || "",
        price: editingProduct.price?.toString() || "",
        currency: editingProduct.currency || "USD",
        rating: editingProduct.rating?.toString() || "",
      });
      setImages(editingProduct.images || []);
    } else {
      // Сброс формы при создании нового продукта
      reset({
        url: "",
        title: "",
        shopName: "",
        price: "",
        currency: "USD",
        rating: "",
      });
      setImages([]);
      setImageUrl("");
    }
  }, [editingProduct, activeModal, reset]);

  const handleAddImage = () => {
    if (imageUrl.trim() && images.length < 4) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    // Проверка изображений (без валидации, только проверка наличия)
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authorization token not found");
      return;
    }

    setIsSaving(true);

    try {
      // Преобразуем массив изображений в формат photos
      // Если редактируем и есть сохраненные photos с id, используем их
      let photos = [];
      if (editingProduct && editingProduct.photos) {
        // Используем сохраненные photos с id, обновляя url если изменились
        photos = images.map((url, index) => {
          const existingPhoto = editingProduct.photos[index];
          return {
            id: existingPhoto?.id || 0,
            url: url,
          };
        });
      } else {
        // Для новых продуктов или если нет сохраненных photos
        photos = images.map((url) => ({
          id: 0,
          url: url,
        }));
      }

      // Формируем данные для запроса
      const requestData = {
        action: editingProduct ? "edit" : "create",
        data: {
          title: data.title.trim(),
          shop_name: data.shopName.trim(),
          url: data.url.trim(),
          currency_key: data.currency,
          price: parseFloat(data.price) || 0,
          rating: data.rating ? parseFloat(data.rating) : 0,
          photos: photos,
        },
      };

      // Если редактируем, добавляем id и все остальные поля как при получении
      if (editingProduct) {
        requestData.data.id = editingProduct.id;
      }

      const response = await axios.post(
        "https://socialdash.leverageindo.group/api/products/action",
        requestData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Получаем данные продукта из ответа сервера
      const serverProduct = response.data?.product;

      // Обновляем локальное хранилище через Redux
      const productData = {
        id: serverProduct?.id || editingProduct?.id, // Используем id из ответа сервера или существующий при редактировании
        url: serverProduct?.url || data.url.trim(),
        title: serverProduct?.title || data.title.trim(),
        shopName: serverProduct?.shop_name || data.shopName.trim(),
        price: serverProduct?.price || parseFloat(data.price) || 0,
        currency: serverProduct?.currency_key || data.currency,
        rating:
          serverProduct?.rating !== undefined
            ? serverProduct.rating
            : data.rating
            ? parseFloat(data.rating)
            : null,
        images: serverProduct?.photos?.map((p) => p.url) || images,
        photos: serverProduct?.photos || photos, // Используем photos из ответа сервера с правильными id
        thumbnail: serverProduct?.photos?.[0]?.url || images[0],
      };

      if (editingProduct) {
        // При редактировании используем id из editingProduct (который был загружен с сервера)
        dispatch(updateProduct({ id: editingProduct.id, ...productData }));
        toast.success("Product updated successfully");
      } else {
        // При создании используем id из ответа сервера
        dispatch(addProduct(productData));
        toast.success("Product added successfully");
      }

      // Сброс формы
      reset({
        url: "",
        title: "",
        shopName: "",
        price: "",
        currency: "USD",
        rating: "",
      });
      setImages([]);
      setImageUrl("");
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingProduct ? "update" : "add"} product`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      url: "",
      title: "",
      shopName: "",
      price: "",
      currency: "USD",
      rating: "",
    });
    setImages([]);
    setImageUrl("");
    onClose();
  };

  return (
    <>
      <style>{`
        /* Скрытие стрелок у числовых инпутов */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <Modal
        activeModal={activeModal}
        onClose={handleCancel}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        className="max-w-2xl max-h-[90vh] bg-[#1A1A1F] dark:bg-[#1A1A1F]"
        themeClass="bg-[#1A1A1F] dark:bg-[#1A1A1F]"
        scrollContent
        footerContent={
          <div className="flex justify-end gap-3">
            <Button
              text="Cancel"
              className="bg-transparent border border-slate-300 dark:border-slate-600 text-white px-6 !bg-[#1A1A1F] hover:!bg-[#2a2a30]"
              onClick={handleCancel}
            />
            <Button
              text="Save"
              className="bg-white text-slate-900 hover:bg-slate-100 px-6"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
            />
          </div>
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-white"
        >
          {/* Product URL */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Product URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="Enter product URL"
              {...register("url")}
              className={`w-full px-4 py-3 bg-[#1A1A1F] border rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                errors.url
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-primary-500"
              }`}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
            )}
          </div>

          {/* Product Title */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product title"
              {...register("title")}
              className={`w-full px-4 py-3 bg-[#1A1A1F] border rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-primary-500"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Shop Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              {...register("shopName")}
              className={`w-full px-4 py-3 bg-[#1A1A1F] border rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                errors.shopName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-primary-500"
              }`}
            />
            {errors.shopName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.shopName.message}
              </p>
            )}
          </div>

          {/* Price и Rating - в одну строку */}
          <div className="flex gap-4 max-md:flex-wrap">
            {/* Product Price */}
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-white">
                Product Price <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter product price"
                  {...register("price")}
                  className={`flex-1 px-4 py-3 max-sm:w-[168px] bg-[#1A1A1F] border rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    errors.price
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-primary-500"
                  }`}
                />
                <div className="relative">
                  <select
                    {...register("currency")}
                    className="px-4 py-3 bg-[#1A1A1F] border border-slate-700 rounded-[6px] text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-[35px] cursor-pointer"
                  >
                    {currencies.length > 0 ? (
                      currencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="RUB">RUB</option>
                      </>
                    )}
                  </select>
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3`}
                  >
                    <svg
                      className="h-4 w-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-white">
                Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Enter Ratings"
                {...register("rating")}
                className={`w-full min-w-[90px] px-4 py-3 bg-[#1A1A1F] border rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                  errors.rating
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:ring-primary-500"
                }`}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.rating.message}
                </p>
              )}
            </div>
          </div>

          {/* Product Images */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              Product Images (max 4 items){" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3 max-[440px]:flex-col">
              <input
                type="url"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddImage()}
                className="flex-1 px-4 py-3 bg-[#1A1A1F] border border-slate-700 rounded-[6px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                text="Add"
                className="bg-[#1A1A1F] border border-slate-700 text-white hover:bg-[#2a2a30] px-6"
                onClick={handleAddImage}
                disabled={images.length >= 4 || !imageUrl.trim()}
              />
            </div>

            {/* Отображение добавленных изображений */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-[6px] border border-slate-700"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80?text=Error";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <Icon icon="heroicons-outline:x" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddProductModal;
