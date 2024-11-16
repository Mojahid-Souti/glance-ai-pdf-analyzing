import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-[800px] flex justify-center">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-xl border border-gray-100",
              formButtonPrimary: "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:opacity-90 transition-opacity",
            },
          }}
        />
      </div>
    </div>
  );
}