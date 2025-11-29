import { Link } from "react-router-dom";
import { useState } from "react";
import ReconnectMasterModal from "../components/ReconnectMasterModal";
import { useI18n } from "../i18n/useI18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function StartPage() {
  const { t } = useI18n();
  // VARIABLES: Preserving existing state variable
  const [showReconnectModal, setShowReconnectModal] = useState(false);

  return (
    // VISUAL: Background gradient matched to the image (subtle blue-to-purple)
    <div
      className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-br from-blue-200 to-purple-100 p-4"
    >
      {/* Language Switcher */}

      {/* Quiz App Header (Centered Title - Moved from absolute left) */}
      <div className="flex flex-col items-center text-center mb-16 mt-10">
        <div className="flex items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800">
            {t.startPage.title}
          </h1>
          <span className="ml-2 text-5xl">💡</span>
        </div>

        {/* Top right buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          {/* Question Management Button */}
          <Link
            to="/questions"
            title="Manage Questions"
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full 
               bg-white/60 backdrop-blur-md shadow-md hover:bg-white/80 hover:shadow-lg 
               text-gray-600 hover:text-gray-800 transition-all duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </Link>
          
          {/* Reconnect Button (Preserved functionality, moved below title or to the side) */}
          <button
            onClick={() => setShowReconnectModal(true)}
            title="Help / Reconnect"
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full 
               bg-white/60 backdrop-blur-md shadow-md hover:bg-white/80 hover:shadow-lg 
               text-gray-600 hover:text-gray-800 transition-all duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Centered Titles */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {t.startPage.subtitle}
        </h2>
        <p className="text-lg text-gray-600">{t.startPage.chooseRole}</p>
      </div>

      {/* Role Selection Cards Container */}
      <div className="flex flex-col gap-8 w-[300px] max-w-sm">
        {/* Game Master Card - VISUAL: Very rounded corners, slight shadow */}
        <Link
          to="/game-master"
          className="bg-white rounded-[20px] shadow-xl p-8 flex flex-col items-center 
                    transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
        >
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            {t.startPage.gameMaster}
          </h3>

          {/* BUTTON: Blue Gradient Style from the image */}
          <div
            className="w-full px-6 py-3 text-white font-bold text-lg 
                       rounded-lg shadow-md transition-all duration-200
                       bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700"
          >
            {t.startPage.hostNewGame}
          </div>
        </Link>

        {/* Player Card - VISUAL: Very rounded corners, slight shadow */}
        <Link
          to="/player"
          className="bg-white rounded-[20px] shadow-xl p-8 flex flex-col items-center 
                    transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
        >
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            {t.startPage.player}
          </h3>

          {/* BUTTON: Green Gradient Style from the image */}
          <div
            className="w-full px-6 py-3 text-white font-bold text-lg 
                       rounded-lg shadow-md transition-all duration-200
                       bg-gradient-to-r from-green-500 to-green-600 
                       hover:from-green-600 hover:to-green-700"
          >
            {t.startPage.joinGame}
          </div>
        </Link>
      </div>

      <div className="p-4 flex justify-center">
        <LanguageSwitcher absolute={false} />
      </div>

      {/* MODAL: Preserving existing modal functionality */}
      <ReconnectMasterModal
        isOpen={showReconnectModal}
        onClose={() => setShowReconnectModal(false)}
      />
    </div>
  );
}
