import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Plane } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"passenger" | "admin">("passenger");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back!");
        navigate("/");
      } else {
        if (!fullName || !phone) {
          toast.error("Please fill in all fields");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              role,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast.success("Account created! Please log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-sky/5 to-ocean/10 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTQ2aDEydjEySDE2em0yNCAwaDEydjEySDQwem0yNCAwaDEydjEySDY0em0xMiAwaDEydjEySDg4em0xMiAwaDEydjEySDExMnptMjQgMGgxMnYxMmgxNnptMjQgMGgxMnYxMmgtMTZ6TTAgMTU4aDEydjEySDB6bTI0IDBoMTJ2MTJIMjR6bTI0IDBoMTJ2MTJINDh6bTI0IDBoMTJ2MTJINzJ6bTI0IDBoMTJ2MTJIOTZ6bTI0IDBoMTJ2MTJoLTEyem0yNCAwaDEydjEyaC0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-gradient-to-br from-sky to-ocean">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-ocean to-sky bg-clip-text text-transparent">
            SkyWings Airlines
          </CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Sign in to continue" : "Create your account to start booking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="passenger" id="passenger" />
                      <Label htmlFor="passenger" className="cursor-pointer flex-1">
                        Passenger - Book and manage flights
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="cursor-pointer flex-1">
                        Admin - Manage airline operations
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
