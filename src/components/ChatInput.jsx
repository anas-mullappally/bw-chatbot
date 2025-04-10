export default function ChatInput({
  inputValue,
  setInputValue,
  handleSendMessage,
  handleKeyPress,
}) {
  return (
    <div className="p-2 bg-white border-t border-gray-200 flex text-black">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 p-2 border border-gray-300 rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleSendMessage}
        className="bg-[#009ee5e6] text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}
