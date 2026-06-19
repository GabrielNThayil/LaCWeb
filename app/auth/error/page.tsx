export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-crown-cream px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-crown-ink">
          Authentication Error
        </h1>
        <p className="mt-4 text-crown-espresso/90">
          There was an error with your authentication attempt. Please try again.
        </p>
        <a href="/auth/signin" className="mt-6 inline-flex items-center gap-2 rounded-md bg-crown-espresso px-4 py-2 text-sm font-medium text-crown-paper hover:bg-crown-caramel transition-colors">
          Try Again
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}