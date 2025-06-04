import { useRef, useState } from "react";
    
const ResetPassword = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) {
      inputs[idx + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (code[idx]) {
        // Just clear current
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      } else if (idx > 0) {
        // Move back and clear previous
        inputs[idx - 1].current?.focus();
        const newCode = [...code];
        newCode[idx - 1] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = pasted.split("");
    while (newCode.length < 6) newCode.push("");
    setCode(newCode);
    // Focus the last filled input
    const lastIdx = Math.min(pasted.length, 6) - 1;
    if (inputs[lastIdx] && inputs[lastIdx].current) {
      inputs[lastIdx].current!.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 py-4">
      <div className="bg-white mx-auto rounded-2xl shadow-lg max-w-md w-full p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-4">Verify Code</h1>
        <p className="text-center text-gray-600 mb-6 text-base">Enter the 6-digit code sent to your email.</p>
        <form className="space-y-6" action="#" method="POST" noValidate>
          <div className="flex justify-center gap-2 mb-4">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={inputs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition"
          >
            Verify
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-8">
          Didn't receive a code?{' '}
          <a href="#" className="text-blue-600 hover:underline font-medium">Resend</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword; 