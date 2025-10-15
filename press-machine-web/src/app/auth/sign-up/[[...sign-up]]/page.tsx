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
              // 既存のエラーを削除
              const existingError = document.getElementById('custom-domain-error');
              if (existingError) {
                existingError.remove();
              }

              // カスタムエラーメッセージを表示（Clerkスタイル）
              const errorDiv = document.createElement('div');
              errorDiv.id = 'custom-domain-error';
              errorDiv.className = 'mt-2 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5';

              errorDiv.innerHTML = `
                <svg class="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span class="text-sm text-red-800 font-medium">
                  ${allowedDomain} ドメインのメールアドレスのみ登録可能です
                </span>
              `;

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* ドメイン制限のお知らせ - Clerkスタイルに合わせる */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                登録可能なメールアドレス
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    @iidzka.co.jp
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-500">
                  組織のメールアドレスでのみ新規登録が可能です
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clerk SignUp Component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-sm border border-gray-200',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm font-medium',
              footerActionLink: 'text-primary hover:text-primary/90 font-medium',
              formFieldLabel: 'text-sm font-medium text-gray-700',
              formFieldInput: 'rounded-lg border-gray-300 focus:border-primary focus:ring-primary',
              identityPreviewText: 'text-sm font-medium',
              identityPreviewEditButton: 'text-sm text-primary hover:text-primary/90'
            }
          }}
        />
      </div>
    </div>
  );
}