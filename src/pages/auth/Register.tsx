import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../utils/api';
import type { RegisterForm, UserRole } from '../../types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['tenant', 'owner', 'agent', 'investor'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login, setError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(data);
      login(response.user, response.token);
      toast.success('Registration successful! Welcome to ZAMSTATE');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'tenant' as UserRole,
      label: 'Tenant',
      description: 'Looking for a place to rent',
      icon: 'fas fa-home',
    },
    {
      value: 'owner' as UserRole,
      label: 'Property Owner',
      description: 'Own properties and want to rent them out',
      icon: 'fas fa-building',
    },
    {
      value: 'agent' as UserRole,
      label: 'Real Estate Agent',
      description: 'Help others find properties',
      icon: 'fas fa-user-tie',
    },
    {
      value: 'investor' as UserRole,
      label: 'Investor',
      description: 'Invest in Zambian real estate',
      icon: 'fas fa-chart-line',
    },
  ];

  return (
    <div className="register-page min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <motion.div
            className="col-lg-8 col-md-10"
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
                  <h2 className="h4 mb-2">Create Your Account</h2>
                  <p className="text-muted">Join Zambia's premier real estate platform</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-3">I am a:</label>
                    <div className="row g-3">
                      {roleOptions.map((option) => (
                        <div key={option.value} className="col-md-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id={option.value}
                              value={option.value}
                              {...register('role')}
                            />
                            <label className="form-check-label w-100" htmlFor={option.value}>
                              <div className={`role-card p-3 border rounded ${selectedRole === option.value ? 'border-zambia-green bg-zambia-green bg-opacity-10' : 'border-light'}`}>
                                <div className="d-flex align-items-center">
                                  <i className={`${option.icon} me-3 text-zambia-green fs-4`}></i>
                                  <div>
                                    <h6 className="mb-1">{option.label}</h6>
                                    <small className="text-muted">{option.description}</small>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.role && (
                      <div className="text-danger mt-2">
                        <small>{errors.role.message}</small>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label fw-semibold">
                        First Name
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                        id="firstName"
                        placeholder="Enter your first name"
                        {...register('firstName')}
                      />
                      {errors.firstName && (
                        <div className="invalid-feedback d-block">
                          {errors.firstName.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label fw-semibold">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
                        id="lastName"
                        placeholder="Enter your last name"
                        {...register('lastName')}
                      />
                      {errors.lastName && (
                        <div className="invalid-feedback d-block">
                          {errors.lastName.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        placeholder="+260 XXX XXX XXX"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback d-block">
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label fw-semibold">
                        Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="Create a password"
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        Confirm Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          placeholder="Confirm your password"
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback d-block">
                            {errors.confirmPassword.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        required
                      />
                      <label className="form-check-label" htmlFor="terms">
                        I agree to the{' '}
                        <Link to="/terms" className="text-zambia-green text-decoration-none">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-zambia-green text-decoration-none">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-zambia-green btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                {/* Social Registration */}
                <div className="text-center mb-4">
                  <div className="divider d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="px-3 text-muted">or</span>
                    <hr className="flex-grow-1" />
                  </div>
                  <button className="btn btn-outline-secondary btn-lg w-100 mb-2">
                    <i className="fab fa-google me-2"></i>
                    Sign up with Google
                  </button>
                  <button className="btn btn-outline-secondary btn-lg w-100">
                    <i className="fab fa-facebook me-2"></i>
                    Sign up with Facebook
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-zambia-green fw-semibold text-decoration-none">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
