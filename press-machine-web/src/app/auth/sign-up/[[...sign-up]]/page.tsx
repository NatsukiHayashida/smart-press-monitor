'use client'

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SignUpPage() {
  useEffect(() => {
    // メールアドレス入力フィールドを監視
    const checkEmailDomain = () => {
      const emailInput = document.querySelector('input[name="emailAddress"]') as HTMLInputElement;

      if (emailInput) {
        const handleInput = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const email = target.value;

          if (email && email.includes('@')) {
            const allowedDomain = '@iidzka.co.jp';
            const exceptionEmail = 'ibron1975@gmail.com';

            if (!email.endsWith(allowedDomain) && email !== exceptionEmail) {
              // カスタムエラーメッセージを表示
              const errorDiv = document.createElement('div');
              errorDiv.id = 'custom-domain-error';
              errorDiv.className = 'mt-2 text-sm text-red-600';
              errorDiv.textContent = `❌ ${allowedDomain} ドメインのメールアドレスのみ登録可能です`;

              // 既存のエラーを削除
              const existingError = document.getElementById('custom-domain-error');
              if (existingError) {
                existingError.remove();
              }

              // エラーをメールフィールドの下に挿入
              const parent = target.closest('div');
              if (parent) {
                parent.appendChild(errorDiv);
              }
            } else {
              // 許可されたドメインの場合、エラーを削除
              const existingError = document.getElementById('custom-domain-error');
              if (existingError) {
                existingError.remove();
              }
            }
          }
        };

        emailInput.addEventListener('input', handleInput);
        emailInput.addEventListener('blur', handleInput);

        return () => {
          emailInput.removeEventListener('input', handleInput);
          emailInput.removeEventListener('blur', handleInput);
        };
      }
    };

    // Clerkコンポーネントの読み込みを待つ
    const timer = setTimeout(checkEmailDomain, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-4">
        {/* ドメイン制限のお知らせ */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                登録可能なメールアドレス
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="font-semibold">@iidzka.co.jp ドメインのみ</p>
                <p className="mt-1 text-xs">
                  ※ それ以外のドメインでは登録できません
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clerk SignUp Component */}
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/90'
            }
          }}
        />
      </div>
    </div>
  );
}