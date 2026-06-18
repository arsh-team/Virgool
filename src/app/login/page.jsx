"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isInstitutionAccount, setIsInstitutionAccount] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace(localStorage.getItem("type") === "creator" ? "/panel" : "/mypanel"); 
    }
  }, [router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && step === 1) {
      if (!email || !password) {
        setError("لطفا ایمیل و رمز عبور را وارد کنید");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("فرمت ایمیل صحیح نیست");
        return;
      }
      if (password.length < 6) {
        setError("رمز عبور باید حداقل 6 کاراکتر باشد");
        return;
      }
      setStep(2)
      return;
    }
    if (mode === "login") {
      if (!email || !password) {
        setError("لطفا ایمیل و رمز عبور را وارد کنید");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("فرمت ایمیل صحیح نیست");
        return;
      }
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          email,
          password,
          firstname: mode === "register" ? firstname : undefined,
          lastname: mode === "register" ? lastname : undefined,
          isInstitutionAccount: mode === "register" ? isInstitutionAccount : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "مشکلی پیش آمد");
      localStorage.setItem("token", data.token);
      localStorage.setItem("type", data.type);
      router.replace(data.type === "creator" ?"/panel" : "/mypanel");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
        <Header></Header>
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/10"></div>
        <form
            onSubmit={handleSubmit}
            className="relative z-10 flex flex-col gap-4 bg-white/20 border border-white/30 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-[90%] max-w-md"
        >
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {mode === "login" ? "ورود به حساب" : "ثبت‌نام"}
            </h2>
            <input
            type="email"
            placeholder="ایمیل"
            className="p-3 rounded-xl bg-white/30 backdrop-blur-md text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="رمز عبور"
            className="p-3 rounded-xl bg-white/30 backdrop-blur-md text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            {}
            {mode === "register" && step === 2 && (
            <>
                <input
                type="text"
                placeholder="نام"
                className="p-3 rounded-xl bg-white/30 backdrop-blur-md text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                />
                <input
                type="text"
                placeholder="نام خانوادگی"
                className="p-3 rounded-xl bg-white/30 backdrop-blur-md text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                />
            </>
            )}
            {mode === "register" && step === 1 && (
              <div className="flex items-center mt-4">
                <label htmlFor="institutionAccount" className="flex items-center cursor-pointer">
                  <span className="relative w-6 h-6 mr-2 rounded-full border-2 border-purple-500 transition-all duration-300">
                    <span className={`absolute inset-0 rounded-full transition-all duration-300 ${isInstitutionAccount ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-white'}`}></span>
                    {isInstitutionAccount && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="text-gray-700 font-medium mr-2">حساب کاربری آموزشگاه</span>
                </label>
                <input
                  type="checkbox"
                  id="institutionAccount"
                  checked={isInstitutionAccount}
                  onChange={(e) => setIsInstitutionAccount(e.target.checked)}
                  className="hidden"
                />
              </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {mode === "register" && step === 1 ? (
            <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl hover:scale-105 transition-all"
            >
                ادامه ثبت‌نام
            </button>
            ) : (
            <button
                type="submit"
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl hover:scale-105 transition-all"
            >
                {mode === "login" ? "ورود" : "ثبت‌نام"}
            </button>
            )}
            <p className="text-center text-gray-700">
            {mode === "login" ? (
                <>
                    کاربر جدید هستید؟{" "}
                <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => {
                    setMode("register");
                    setStep(1);
                    }}
                >
                    ثبت‌نام
                </span>
                </>
            ) : (
                <>
                حساب دارید؟{" "}
                <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => setMode("login")}
                >
                    ورود
                </span>
                </>
            )}
            </p>
        </form>
        </div>
    </>
  );
}
