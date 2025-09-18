import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/apiService';
import { Button, Input, Card, CardContent, LoadingOverlay } from '../../components/ui';
import type { LoginRequest, LoginResponse, PasswordCreationResponse } from '../../types/api';

interface LoginFormData {
  email: string;
  password: string;
  userType: 'admin' | 'technician';
}

interface CreatePasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsPasswordCreation, setNeedsPasswordCreation] = useState<PasswordCreationResponse | null>(null);
  
  const { setAuth, setLoading, setError, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || (needsPasswordCreation?.user_type === 'admin' ? '/admin' : '/technician');

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      userType: 'admin'
    }
  });

  const passwordForm = useForm<CreatePasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoading(true);
    clearError();

    try {
      const credentials: LoginRequest = {
        email: data.email,
        password: data.password,
        user_type: data.userType
      };

      const response = await apiService.login(credentials);

      // Check if password creation is required
      if ('requires_password_creation' in response) {
        setNeedsPasswordCreation(response as PasswordCreationResponse);
      } else {
        // Normal login success
        setAuth(response as LoginResponse);
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleCreatePassword = async (data: CreatePasswordFormData) => {
    if (!needsPasswordCreation) return;

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    clearError();

    try {
      const response = await apiService.createPassword({
        user_id: needsPasswordCreation.user_id,
        user_type: needsPasswordCreation.user_type,
        password: data.password,
        confirm_password: data.confirmPassword
      });

      setAuth(response);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password creation failed';
      setError(message);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  if (needsPasswordCreation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingOverlay isVisible={isLoading} message="Creating password..." />
        
        <Card className="w-full max-w-md animate-fade-in-up" variant="elevated">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#cc0000] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Create Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome, {needsPasswordCreation.name}! Please create a password to continue.
              </p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(handleCreatePassword)} className="space-y-6">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                {...passwordForm.register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={passwordForm.formState.errors.password?.message}
                placeholder="Enter your new password"
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                {...passwordForm.register('confirmPassword', { 
                  required: 'Please confirm your password'
                })}
                leftIcon={<Lock className="w-4 h-4" />}
                error={passwordForm.formState.errors.confirmPassword?.message}
                placeholder="Confirm your password"
              />

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoadingOverlay isVisible={isLoading} message="Signing you in..." />
      
      <Card className="w-full max-w-md animate-fade-in-up" variant="elevated">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#cc0000] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Ctecg Score
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => loginForm.setValue('userType', 'admin')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-gray-100 ${
                    loginForm.watch('userType') === 'admin'
                      ? 'border-[#cc0000] bg-red-50 dark:bg-red-900/20 text-[#cc0000]'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => loginForm.setValue('userType', 'technician')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-gray-100 ${
                    loginForm.watch('userType') === 'technician'
                      ? 'border-[#cc0000] bg-red-50 dark:bg-red-900/20 text-[#cc0000]'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">Technician</div>
                </button>
              </div>
            </div>

            <Input
              label="Email Address"
              type="email"
              {...loginForm.register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              leftIcon={<Mail className="w-4 h-4" />}
              error={loginForm.formState.errors.email?.message}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...loginForm.register('password', { required: 'Password is required' })}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={loginForm.formState.errors.password?.message}
              placeholder="Enter your password"
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-[#cc0000] hover:text-red-700 dark:hover:text-red-300 font-medium"
                onClick={() => {
                  // TODO: Implement forgot password modal
                }}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}