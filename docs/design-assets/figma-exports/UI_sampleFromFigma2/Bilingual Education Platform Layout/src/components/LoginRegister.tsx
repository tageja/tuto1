import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

interface LoginRegisterProps {
  onComplete: () => void;
}

export function LoginRegister({
  onComplete,
}: LoginRegisterProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("signin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Educational illustration */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-secondary/10 to-background p-12 items-center justify-center"
      >
        <div className="max-w-xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHRlYWNoZXJzJTIwbGVhcm5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwOTM2NDAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Education"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <h2 className="mb-4 text-foreground">
              {t(
                "Connect Teachers, Parents & Schools",
                "Kết nối Giáo viên, Phụ huynh & Trường học",
              )}
            </h2>
            <p className="text-muted-foreground">
              {t(
                "Join thousands of educators and learners on the platform that makes education accessible.",
                "Tham gia cùng hàng nghìn nhà giáo dục và học viên trên nền tảng giúp giáo dục dễ tiếp cận hơn.",
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login/Register form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          {/* Header with logo and language toggle */}
          <div className="flex items-center justify-between mb-12">
            <h1
              className="text-4xl tracking-tight"
              style={{
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tuto
            </h1>
            <LanguageToggle />
          </div>

          {/* Glass card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin">
                  {t("Sign In", "Đăng nhập")}
                </TabsTrigger>
                <TabsTrigger value="register">
                  {t("Create Account", "Tạo tài khoản")}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">
                      {t("Email", "Email")}
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t(
                        "you@example.com",
                        "you@example.com",
                      )}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">
                      {t("Password", "Mật khẩu")}
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("Remember me", "Ghi nhớ đăng nhập")}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      {t("Forgot password?", "Quên mật khẩu?")}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {t("Sign In", "Đăng nhập")}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">
                        {t("or", "hoặc")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t(
                      "Continue with Google",
                      "Tiếp tục với Google",
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-name">
                      {t("Full Name", "Họ và tên")}
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder={t(
                        "Nguyen Van A",
                        "Nguyễn Văn A",
                      )}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">
                      {t("Email", "Email")}
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t(
                        "you@example.com",
                        "you@example.com",
                      )}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      {t("Password", "Mật khẩu")}
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">
                      {t("I am a...", "Tôi là...")}
                    </Label>
                    <Select required>
                      <SelectTrigger
                        id="register-role"
                        className="rounded-xl"
                      >
                        <SelectValue
                          placeholder={t(
                            "Select role",
                            "Chọn vai trò",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">
                          {t("Parent", "Phụ huynh")}
                        </SelectItem>
                        <SelectItem value="student">
                          {t("Student", "Học sinh")}
                        </SelectItem>
                        <SelectItem value="teacher">
                          {t("Teacher", "Giáo viên")}
                        </SelectItem>
                        <SelectItem value="admin">
                          {t("School Admin", "Quản trị trường")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {t("Create Account", "Tạo tài khoản")}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-muted-foreground">
                        {t("or", "hoặc")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t(
                      "Continue with Google",
                      "Tiếp tục với Google",
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t(
              "By continuing, you agree to our Terms of Service and Privacy Policy",
              "Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi",
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}