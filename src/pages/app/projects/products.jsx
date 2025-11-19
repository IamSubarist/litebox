import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import AddProductModal from "@/components/partials/settings/Tools/AddProductModal";
import { removeProduct, setProducts } from "@/pages/app/projects/store";
import axios from "axios";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [productUrl, setProductUrl] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const products = useSelector((state) => state.project.products || []);

  // Загрузка продуктов с сервера
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
      } catch (error) {
        console.error("Ошибка при загрузке продуктов:", error);
        toast.error("Не удалось загрузить список продуктов");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleGetData = () => {
    // Логика получения данных по URL
    console.log("Get data from URL:", productUrl);
  };

  const handleEnterManually = () => {
    setEditingProduct(null);
    setShowManualEntry(true);
  };

  const handleCloseModal = () => {
    setShowManualEntry(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authorization token not found");
      return;
    }

    // Находим продукт по id
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found");
      return;
    }

    try {
      // Преобразуем продукт из формата компонента в формат API
      const productData = {
        id: product.id,
        title: product.title,
        shop_name: product.shopName,
        url: product.url,
        currency_key: product.currency,
        price: product.price,
        rating: product.rating || 0,
        photos:
          product.photos ||
          product.images.map((url) => ({
            id: 0,
            url: url,
          })),
      };

      const response = await axios.post(
        "https://socialdash.leverageindo.group/api/products/action",
        {
          action: "delete",
          data: productData,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Удаляем из локального хранилища через Redux
      dispatch(removeProduct(productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowManualEntry(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {/* <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <Icon icon="heroicons-outline:arrow-left" className="text-xl" />
          <span>Back</span>
        </button> */}
        <h1 className="font-bold text-2xl text-slate-900 dark:text-[#eee] mb-2">
          Products
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Easily manage your products — add, edit, or remove them.
        </p>
      </div>
      <button
        onClick={handleEnterManually}
        className="text-slate-600 dark:text-slate-300 hover:text-primary-500 border border-slate-300 rounded-[6px] px-4 py-2 transition-colors"
      >
        + Add Product
      </button>
      {/* Products List or No Data */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-[6px] p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
          <Icon
            icon="line-md:loading-twotone-loop"
            className="text-6xl text-slate-400 dark:text-slate-500 mb-4"
          />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[6px] border border-slate-200 dark:border-slate-700 overflow-x-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 max-sm:px-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="col-span-5 max-sm:col-span-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Name
              </span>
            </div>
            <div className="col-span-3 text-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Price
              </span>
            </div>
            <div className="col-span-3 max-sm:col-span-2 text-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Ratings
              </span>
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* Products List */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 max-sm:px-3 transition-colors"
              >
                <div className="col-span-5 max-sm:col-span-4 flex items-center gap-3 overflow-x-auto">
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-[6px] border border-slate-200 dark:border-slate-700"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/48?text=No+Image";
                      }}
                    />
                  )}
                  <span className="text-sm font-medium text-slate-900 dark:text-[#eee]">
                    {product.title}
                  </span>
                </div>
                <div className="col-span-3 text-center flex items-center justify-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {product.price} {product.currency}
                  </span>
                </div>
                <div className="col-span-3 max-sm:col-span-2 text-center flex items-center justify-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {product.rating || "-"}
                  </span>
                </div>
                <div className="col-span-1 max-sm:col-span-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-2 max-sm:p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-[6px] transition-colors"
                    title="Edit product"
                  >
                    <Icon
                      icon="heroicons-outline:pencil"
                      className="text-xl text-slate-600 dark:text-slate-300"
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 max-sm:p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-[6px] transition-colors"
                    title="Delete product"
                  >
                    <Icon
                      icon="heroicons-outline:trash"
                      className="text-xl text-red-600 dark:text-red-400"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[6px] p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
          <Icon
            icon="heroicons-outline:chart-bar"
            className="text-6xl text-slate-400 dark:text-slate-500 mb-4"
          />
          <h3 className="font-bold text-xl text-slate-900 dark:text-[#eee] mb-2">
            No data yet.
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            No products have been added yet. Start by adding your first product!
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AddProductModal
        activeModal={showManualEntry}
        onClose={handleCloseModal}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductsPage;
