import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { post } from '../../utils/api';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import { renderIcon } from '../../utils/icons';

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6 || !email) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await post('/auth/verify-otp', { email, otp: otpValue });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address is missing');
      return;
    }
    setResending(true);
    try {
      await post('/auth/resend-otp', { email });
      setError('Verification OTP has been resent. Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification OTP');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Verification Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              The verification link is invalid. Please request a new verification OTP.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-2">
            {renderIcon(FaEnvelope, 'h-8 w-8 text-orange-500')}
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Verify Your Email Address
          </h2>
          <p className="text-center text-sm text-gray-500 mb-4">
            Please enter the OTP sent to your email address.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-center">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className={`w-12 h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all ${digit ? 'border-orange-500' : 'border-gray-300'} ${idx === otp.findIndex(d => d === '') ? 'ring-2 ring-orange-400' : ''}`}
                autoFocus={idx === 0}
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600 mb-2">
            
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-all shadow-md flex items-center justify-center"
          >
            {loading ? (
              <>
                {renderIcon(FaSpinner, 'animate-spin -ml-1 mr-2 h-5 w-5')}
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="text-sm items-center  text-gray-500 hover:text-blue-500 font-medium bg-transparent border-none outline-none"
            >
              <div className="flex items-center justify-center">
                {resending ? (
                  <>
                    {renderIcon(FaSpinner, 'animate-spin -ml-1 mr-2 h-4 w-4')}
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail; 