interface SubmissionConfirmationProps {
  submittedText: string;
  backgroundColor?: string;
  waitMessage?: string;
}

export default function SubmissionConfirmation({ 
  submittedText, 
  backgroundColor = 'from-purple-50 to-pink-50',
  waitMessage = '⏳ Wait for all players to submit their answers...'
}: SubmissionConfirmationProps) {
  return (
    <div className="text-center">
      <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2">
        <span className="text-2xl">✓</span>
        <span className="font-bold">Answer submitted!</span>
      </div>
      <div className={`bg-gradient-to-br ${backgroundColor} p-4 rounded-lg shadow-inner`}>
        <p className="text-sm text-gray-500 mb-2">Your answer:</p>
        <p className="text-lg font-medium text-gray-800">{submittedText}</p>
      </div>
      <p className="text-gray-600 mt-4">
        {waitMessage}
      </p>
    </div>
  );
}
