import { useParams } from 'react-router-dom';

export default function PublicRatingForm() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Rate Our Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Token: {token}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Public rating form coming soon...
        </p>
      </div>
    </div>
  );
}