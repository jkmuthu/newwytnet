import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook } from "react-icons/si";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleLogin = async () => {
    if (!mobileNumber.trim() || !password.trim()) {
      console.error("Please fill in all fields");
      return;
    }

    try {
      const fullMobileNumber = `${selectedCountryData.dialCode}${mobileNumber}`;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: fullMobileNumber,
          password: password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Login successful!", result);
        
        // Redirect based on user role
        if (result.user.redirectUrl) {
          window.location.href = result.user.redirectUrl;
        } else {
          // Fallback redirect logic
          if (result.user.role === 'super_admin') {
            window.location.href = '/super-admin';
          } else if (result.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }
      } else {
        console.error("❌ Login failed:", result.message);
        // TODO: Show user-friendly error message
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      // TODO: Show user-friendly error message
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/login';
  };

  const handleFacebookLogin = () => {
    // Redirect to Facebook OAuth  
    window.location.href = '/api/login';
  };

  const countryOptions = [
    { code: "IN", flag: "🇮🇳", name: "India", dialCode: "+91" },
    { code: "US", flag: "🇺🇸", name: "United States", dialCode: "+1" },
    { code: "GB", flag: "🇬🇧", name: "United Kingdom", dialCode: "+44" },
    { code: "AU", flag: "🇦🇺", name: "Australia", dialCode: "+61" },
    { code: "CA", flag: "🇨🇦", name: "Canada", dialCode: "+1" },
  ];

  const selectedCountryData = countryOptions.find(c => c.code === selectedCountry) || countryOptions[0];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to WytNet</CardTitle>
          <CardDescription>
            Sign in to access your personal dashboard and create projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mobile Number with Country Selection - This IS the username */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number (Username)</Label>
            <div className="flex space-x-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-24" data-testid="select-country">
                  <SelectValue>
                    <div className="flex items-center space-x-1">
                      <span>{selectedCountryData.flag}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center space-x-2">
                        <span>{country.flag}</span>
                        <span className="text-sm">{country.dialCode}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="pl-12"
                  data-testid="input-mobile"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {selectedCountryData.dialCode}
                </span>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-login-submit"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              Login / Join with:
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full"
                data-testid="button-google-login"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={handleFacebookLogin}
                className="w-full"
                data-testid="button-facebook-login"
              >
                <SiFacebook className="h-5 w-5 mr-2 text-blue-600" />
                Facebook
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="w-full"
              data-testid="button-back-home"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}