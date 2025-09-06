export default function FirebaseConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 text-center shadow-md">
        <div className="mb-4 text-6xl text-red-500">🔧</div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Configuration Required</h1>
        <p className="mb-4 text-gray-600">
          The application needs to be configured with Firebase credentials to function properly.
        </p>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-left">
          <h3 className="mb-2 font-medium text-gray-900">Required Environment Variables:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
            <li>• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>• NEXT_PUBLIC_FIREBASE_APP_ID</li>
          </ul>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-left">
          <h3 className="mb-2 font-medium text-blue-900">For Developers:</h3>
          <p className="text-sm text-blue-700">
            Check the browser console for more detailed configuration information. Make sure all Firebase environment
            variables are properly set in your deployment environment.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
