import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://socialdash.leverageindo.group/api";

// Функция для проверки формата email
const isValidEmailFormat = (email) => {
  if (!email || email.trim() === "") return true; // Пустое значение пропускаем (валидация yup обработает)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Схема валидации для шага 1 (Email)
const emailSchema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
  })
  .required();

// Схема валидации для шага 3 (Password)
const passwordSchema = yup
  .object({
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password shouldn't be more than 30 characters")
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

const ForgotPass = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Форма для шага 1 (Email)
  const {
    register: registerEmail,
    formState: { errors: errorsEmail },
    handleSubmit: handleSubmitEmail,
    watch: watchEmail,
  } = useForm({
    resolver: yupResolver(emailSchema),
    mode: "all",
  });
  const emailInputValue = watchEmail("email");
  const prevEmailInputValueRef = useRef("");

  // Валидация email в реальном времени
  useEffect(() => {
    if (
      emailInputValue &&
      emailInputValue.trim() !== "" &&
      emailInputValue !== prevEmailInputValueRef.current &&
      !isValidEmailFormat(emailInputValue)
    ) {
      toast.error("This doesn't look like an email");
    }
    prevEmailInputValueRef.current = emailInputValue || "";
  }, [emailInputValue]);

  // Форма для шага 3 (Password)
  const {
    register: registerPassword,
    formState: { errors: errorsPassword },
    handleSubmit: handleSubmitPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "all",
  });

  // Шаг 1: Отправка email для получения OTP
  const onEmailSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/confirm_email?recovery=true`,
        {
          login: data.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setEmail(data.email);
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

  // Шаг 2: Проверка OTP кода
  const handleOTPContinue = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter complete OTP code");
      toast.error("Please enter complete OTP code");
      return;
    }

    setLoading(true);
    setOtpError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/confirm_email?recovery=true&code=${otp}`,
        {
          login: email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.data?.hash) {
        setHash(response.data.data.hash);
        setStep(3);
        toast.success(response.data.message || "Email confirmed successfully");
      } else {
        throw new Error("Hash not received from server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid OTP code";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 3: Восстановление пароля
  const onPasswordSubmit = async (data) => {
    if (!hash) {
      toast.error("Session expired. Please start again.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/password_recovery?guard_hash=${hash}`,
        {
          login: email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        response.data?.message || "Password recovered successfully"
      );
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to recover password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Индикатор шагов */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((stepNumber) => (
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
            {stepNumber < 3 && (
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

      {/* Шаг 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-5">
          <Textinput
            name="email"
            label="email"
            type="email"
            placeholder=" Enter your email"
            register={registerEmail}
            error={errorsEmail.email}
            className="h-[48px]"
            maxLength={255}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark block w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send recovery email"}
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
              {loading ? "Verifying..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Password */}
      {step === 3 && (
        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="space-y-5"
        >
          <Textinput
            name="password"
            label="New password"
            type="password"
            placeholder=" Enter your new password"
            register={registerPassword}
            error={errorsPassword.password}
            className="h-[48px]"
            hasicon
            maxLength={30}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-outline-dark flex-1"
              disabled={loading}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Recovering..." : "Recover password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPass;
