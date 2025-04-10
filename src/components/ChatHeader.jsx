import Image from "next/image";

export default function ChatHeader({ toggleChat, handleReset }) {
  return (
    <div className="bg-[#009ee5e6] text-black p-4 flex justify-between items-center">
      <div className="flex items-center gap-4 cursor-default">
        <Image src={"/BW-bot.png"} alt="bot-image" width={40} height={40} />
        <h3 className="text-sm font-bold m-0">BW Bot</h3>
      </div>
      <div className="flex gap-2">
        <button
          className="bg-transparent border-none cursor-pointer p-1 text-xs flex items-center"
          onClick={toggleChat}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
        <button
          className="bg-transparent border-none cursor-pointer p-1 text-xs"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}