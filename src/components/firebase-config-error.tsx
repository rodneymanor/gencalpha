export default function FirebaseConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">🔧</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Configuration Required
        </h1>
        <p className="text-gray-600 mb-4">
          The application needs to be configured with Firebase credentials to function properly.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Required Environment Variables:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
            <li>• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>• NEXT_PUBLIC_FIREBASE_APP_ID</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-medium text-blue-900 mb-2">For Developers:</h3>
          <p className="text-sm text-blue-700">
            Check the browser console for more detailed configuration information. 
            Make sure all Firebase environment variables are properly set in your deployment environment.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
