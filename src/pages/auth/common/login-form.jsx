import React, { useEffect, useState, useRef } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogin } from "./store";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "https://litebox.leverageindo.group/api";
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup
      .string()
      .required("Password is Required")
      .max(30, "Password shouldn't be more than 30 characters"),
  })
  .required();

// Функция для проверки формата email
const isValidEmailFormat = (email) => {
  if (!email || email.trim() === "") return true; // Пустое значение пропускаем (валидация yup обработает)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailValue = watch("email");
  const prevEmailValueRef = useRef("");

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 1500);
    }
  }, [error]);

  // Валидация email в реальном времени
  useEffect(() => {
    if (
      emailValue &&
      emailValue.trim() !== "" &&
      emailValue !== prevEmailValueRef.current &&
      !isValidEmailFormat(emailValue)
    ) {
      toast.error("This doesn't look like an email");
    }
    prevEmailValueRef.current = emailValue || "";
  }, [emailValue]);

  const onSubmit = async (data) => {
    if (!checked) {
      toast.error("Please accept terms and conditions");
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth`,
        {
          login: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Получаем токен из заголовков
      const authToken =
        response.headers["Authorization"] ||
        response.headers["authorization"] ||
        response.headers["X-Auth-Token"] ||
        response.headers["x-auth-token"];

      if (authToken) {
        // Сохраняем токен
        localStorage.setItem("authToken", authToken);

        // Сохраняем данные пользователя
        if (response.data?.user) {
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        }

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: data.email,
            isAuthenticated: true,
          })
        );

        // Авторизуем пользователя
        dispatch(handleLogin(true));

        // toast.success("Logged in successfully");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("Token not received from server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    toast.info("Данная функция недоступна в демо-режиме", {
      position: "top-right",
      autoClose: 2000,
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <Textinput
        name="email"
        label="email"
        type="email"
        placeholder="Enter your email"
        register={register}
        error={errors.email}
        className="h-[48px] rounded-[4px]"
        maxLength={255}
      />
      <Textinput
        name="password"
        label="password"
        type="password"
        placeholder="Enter your password"
        register={register}
        error={errors.password}
        className="h-[48px] rounded-[4px]"
        hasicon
        maxLength={30}
      />

      <div
        className={`flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0`}
      >
        <div className="flex-1 min-w-0 sm:pr-2">
          <Checkbox
            value={checked}
            onChange={() => setChecked(!checked)}
            label="I accept the terms and privacy policy"
            error={error}
          />
        </div>

        <Link
          // to="/forgot-password"
          onClick={(e) => handleClick(e)}
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium whitespace-nowrap sm:ml-2"
        >
          Forgot Password?{" "}
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-[48px] btn btn-dark block w-full text-center rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
