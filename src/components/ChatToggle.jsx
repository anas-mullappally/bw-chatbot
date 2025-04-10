import Image from "next/image";

export default function ChatToggle({ isOpen, toggleChat }) {
  if (isOpen) return null;

  return (
    <div
      className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex justify-center items-center cursor-pointer shadow-md hover:scale-110 transition-all duration-300 z-50"
      onClick={toggleChat}
    >
      <Image src={"/BW-bot.png"} alt="bot-image" width={100} height={100} />
    </div>
  );
}
