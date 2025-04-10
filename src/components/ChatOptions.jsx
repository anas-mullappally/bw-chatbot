export default function ChatOptions({
  options,
  handleOptionClick,
  clickedOptions,
}) {
  return (
    <div className="flex flex-col gap-2 mb-4 ml-10">
      {options.map((option, i) => (
        <button
          key={i}
          onClick={() => handleOptionClick(option)}
          disabled={clickedOptions.has(option)}
          className={`
              px-3 py-2 rounded-lg w-fit transition-colors duration-200
              ${
                clickedOptions.has(option)
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              }
            `}
          aria-disabled={clickedOptions.has(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
