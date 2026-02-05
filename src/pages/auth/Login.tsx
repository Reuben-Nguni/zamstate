import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../utils/api';
import Loader from '../../components/common/Loader';
import type { LoginForm } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setError, isLoading: storeIsLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data.email, data.password);
      login(response.user, response.token);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <motion.div
            className="col-lg-5 col-md-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <Link to="/" className="d-inline-block mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="bg-zambia-green text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                        <strong>ZS</strong>
                      </div>
                      <span className="fw-bold text-zambia-green h4 mb-0">ZAMSTATE</span>
                    </div>
                  </Link>
                  <h2 className="h4 mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your ZAMSTATE account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback d-block">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-zambia-green btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Social Login */}
                <div className="text-center mb-4">
                  <div className="divider d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="px-3 text-muted">or</span>
                    <hr className="flex-grow-1" />
                  </div>
                  <button className="btn btn-outline-secondary btn-lg w-100 mb-2">
                    <i className="fab fa-google me-2"></i>
                    Continue with Google
                  </button>
                  <button className="btn btn-outline-secondary btn-lg w-100">
                    <i className="fab fa-facebook me-2"></i>
                    Continue with Facebook
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-zambia-green fw-semibold text-decoration-none">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
              <h6 className="text-warning mb-2">
                <i className="fas fa-info-circle me-1"></i>
                -- ---
              </h6>
              <small className="text-muted">
                ----<br />
                ----
              </small>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
