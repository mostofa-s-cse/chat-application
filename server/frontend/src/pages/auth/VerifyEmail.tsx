import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../../utils/api';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        await post('/auth/verify-email', { token });
        setSuccess('Email verified successfully');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified successfully. Please login.' } });
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await post('/auth/resend-verification', { email: searchParams.get('email') });
      setSuccess('Verification email sent successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <FaSpinner className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifying your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
            <FaEnvelope className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {error ? 'Verification Failed' : 'Email Verified'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error
              ? 'We were unable to verify your email address. Please try again.'
              : 'Your email has been verified successfully.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="text-center">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 