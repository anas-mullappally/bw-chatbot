import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import React from "react";

export default function ChatMessage({ message, handleOptionClick }) {
  if (message.type === "products") {
    return (
      <div className="flex mb-2 justify-end">
        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ml-2">
          <User className="h-5 w-5 text-gray-600" />
        </div>
        <div className="mb-2 px-3 py-2 rounded-lg max-w-[80%] ml-auto bg-blue-100">
          <h4 className="font-medium">Recommended Products</h4>
          <div className="flex flex-col gap-2 mt-2 text-black">
            {message.products.map((product, i) => (
              <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                <h5 className="font-bold">{product.name}</h5>
                <p className="text-gray-600">
                  {product.description || "No description available."}
                </p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>
                <p>
                  <strong>Score:</strong> {product.similarityScore?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "ideas") {
    return (
      <div className="flex mb-2 justify-end">
        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ml-2">
          <User className="h-5 w-5 text-gray-600" />
        </div>
        <div className="mb-2 px-3 py-2 rounded-lg max-w-[80%] ml-auto bg-blue-100">
          <h4 className="font-medium">Design Ideas</h4>
          <div className="flex flex-col gap-2 mt-2 text-black">
            {message.ideas.map((idea, i) => (
              <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                <h5 className="font-bold">{idea.title}</h5>
                <p>{idea.summary || "No summary available."}</p>
                <p>
                  <strong>Category:</strong> {idea.category}
                </p>
                <p>
                  <strong>Score:</strong> {idea.similarityScore?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-2 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
          message.sender === "user" ? "order-1 ml-2" : "order-0"
        }`}
      >
        {message.sender === "user" ? (
          <CircleUserRound className="h-17 w-17 text-gray-600" />
        ) : (
          <Image
            src={"/BW-bot.png"}
            alt="bot"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
      </div>
      <div
        className={`px-3 py-2 rounded-lg max-w-[80%] ${
          message.sender === "user" ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        {message.text.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
