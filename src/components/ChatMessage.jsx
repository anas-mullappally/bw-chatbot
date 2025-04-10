import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import React from "react";
import Link from "next/link";

export default function ChatMessage({ message, handleOptionClick }) {
  if (message.type === "products") {
    return (
      <div className="flex mb-2 justify-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2">
          <Image
            src={"/BW-bot.png"}
            alt="bot"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        <div className="mb-2 px-3 py-2 rounded-lg max-w-[80%] bg-gray-100">
          <h4 className="font-medium">Recommended Products</h4>
          <div className="flex flex-col gap-2 mt-2 text-black">
            {message.products.map((product, i) => (
              <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                <h5 className="font-bold">{product.name}</h5>
                <p className="text-gray-600">
                  {product.description || "No description available."}
                </p>
                <p>
                  <strong>Price:</strong> {product.price}
                </p>
                <div className="mt-2">
                  <Link
                    href={`https://feddev.buildingworld.com/products/${product.product_slug}`}
                    target="_blank"
                    className="text-blue-600 text-sm"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "ideas") {
    return (
      <div className="flex mb-2 justify-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2">
          <Image
            src={"/BW-bot.png"}
            alt="bot"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        <div className="mb-2 px-3 py-2 rounded-lg max-w-[80%] bg-gray-100">
          <h4 className="font-medium">Design Ideas</h4>
          <div className="flex flex-col gap-2 mt-2 text-black">
            {message.ideas.map((idea, i) => (
              <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                <h5 className="font-bold">{idea.title}</h5>
                <p>
                  <strong>Location:</strong> {idea.location}
                </p>
                <div className="mt-2">
                  <Link
                    href={`https://feddev.buildingworld.com/ideas/${idea.idea_slug}`}
                    target="_blank"
                    className="text-blue-600 text-sm"
                  >
                    View Idea
                  </Link>
                </div>
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
