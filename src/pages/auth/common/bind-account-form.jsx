import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

// Схема валидации для шага 1 (Email + Password)
const emailPasswordSchema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password shouldn't be more than 20 characters")
      .required("Please enter password"),
  })
  .required();

// Компонент для ввода OTP кода
const OTPInput = ({ value, onChange, error }) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, 6);
      const newOtp = [...otp];
      otpArray.forEach((char, index) => {
        newOtp[index] = char;
      });
      setOtp(newOtp);
    }
  }, [value]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Переход к следующему полю
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-3">
      <label className="form-label block capitalize text-center">
        Enter your OTP Code
      </label>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`form-control form-label w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              error
                ? "border-danger-500"
                : "border-slate-300 dark:border-slate-600"
            }  dark:text-white`}
          />
        ))}
      </div>
      {error && (
        <div className="text-danger-500 block text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

const BindAccountForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Получаем токен из localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Форма для шага 1 (Email + Password)
  const {
    register: registerEmailPassword,
    formState: { errors: errorsEmailPassword },
    handleSubmit: handleSubmitEmailPassword,
  } = useForm({
    resolver: yupResolver(emailPasswordSchema),
    mode: "all",
  });

  // Шаг 1: Отправка email и пароля для получения OTP
  const onEmailPasswordSubmit = async (data) => {
    if (loading) return; // Защита от повторной отправки

    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/bind_login`,
        {
          login: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      setEmail(data.email);
      setPassword(data.password);
      setStep(2);
      toast.success("OTP code sent to your email");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send OTP code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Привязка аккаунта с OTP кодом
  const handleOTPContinue = async () => {
    if (loading) return; // Защита от повторной отправки

    if (otp.length !== 6) {
      setOtpError("Please enter complete OTP code");
      toast.error("Please enter complete OTP code");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!email || !password) {
      toast.error("Session expired. Please start again.");
      setStep(1);
      return;
    }

    setLoading(true);
    setOtpError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/bind_login?code=${otp}`,
        {
          login: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      toast.success(response.data?.message || "Account bound successfully");
      // Редирект в профиль после успешной привязки
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid OTP code or failed to bind account";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Индикатор шагов */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= stepNumber
                  ? "bg-primary-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 2 && (
              <div
                className={`h-1 w-12 ${
                  step > stepNumber
                    ? "bg-primary-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Шаг 1: Email + Password */}
      {step === 1 && (
        <form
          onSubmit={handleSubmitEmailPassword(onEmailPasswordSubmit)}
          className="space-y-5"
        >
          <Textinput
            name="email"
            label="email"
            type="email"
            placeholder=" Enter your email"
            register={registerEmailPassword}
            error={errorsEmailPassword.email}
            className="h-[48px]"
          />
          <Textinput
            name="password"
            label="password"
            type="password"
            placeholder=" Enter your password"
            register={registerEmailPassword}
            error={errorsEmailPassword.password}
            className="h-[48px]"
            hasicon
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark block w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>
      )}

      {/* Шаг 2: OTP */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="w-full text-center flex items-center justify-center">
            <OTPInput value={otp} onChange={setOtp} error={otpError} />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setOtpError("");
              }}
              className="btn btn-outline-dark flex-1"
              disabled={loading}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleOTPContinue}
              disabled={otp.length !== 6 || loading}
              className="btn btn-dark flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Binding..." : "Bind account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BindAccountForm;
