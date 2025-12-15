import { useEffect, useState } from "react";
import { authService, LoginCredentials, RegisterData } from "@/lib/api/services/auth.service";
import { User } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check for existing session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const registerData: RegisterData = {
          email,
          password,
          password_confirmation: password,
          full_name: fullName,
        };
        const response = await authService.register(registerData);
        setUser(response.user);
        toast({
          title: "تم إنشاء الحساب",
          description: "مرحباً بك في نظام إدارة العيادة",
        });
      } else {
        const credentials: LoginCredentials = { email, password };
        const response = await authService.login(credentials);
        setUser(response.user);
        toast({
          title: "تم تسجيل الدخول",
          description: "مرحباً بك في نظام إدارة العيادة",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "حدث خطأ غير متوقع";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </CardTitle>
            <CardDescription>
              <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-md mt-2">
                <Lock className="h-4 w-4" />
                بيانات المرضى محمية الآن - مطلوب تسجيل الدخول
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="أحمد محمد"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@clinic.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري المعالجة..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "لديك حساب؟ سجل الدخول" : "ليس لديك حساب؟ أنشئ حساباً"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Security indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                {user.full_name || user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="h-auto p-1 text-xs"
              >
                خروج
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}