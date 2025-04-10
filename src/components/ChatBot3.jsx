"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BotMessageSquare } from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi,\nWelcome to BuildingWorld.\n\nHow can I help you?\nWhat are you looking for?",
      sender: "bot",
      options: ["Products", "Professionals", "Ideas"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState("welcome");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const productData = {
    Products: {
      "Bathroom & Sanitaryware": {
        "Washbasin & Vanity Unit": [
          "Countertop Washbasin",
          "Wall-hung Vanity",
          "Floor-standing Vanity",
        ],
        "Shower Enclosures": ["Sliding Door", "Pivot Door", "Walk-in"],
      },
      Kitchen: {
        "Kitchen Sinks": ["Single Bowl", "Double Bowl"],
        "Kitchen Faucets": ["Pull-down", "Pull-out"],
      },
    },
    Professionals: {
      "Interior Designer": ["Residential", "Commercial", "Office"],
      Architect: ["Home", "Building", "Landscape"],
    },
    Ideas: {
      Residential: ["Living Room", "Bedroom", "Kitchen"],
      Commercial: ["Office", "Restaurant", "Retail"],
    },
  };

  const handleOptionClick = (option) => {
    // Add the selected option as a user message
    const userMessage = { text: option, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    let botMessage = { text: "", sender: "bot", options: [] };

    switch (currentStep) {
      case "welcome":
        setSelectedCategory(option);
        const subOptions = Object.keys(productData[option]);
        botMessage.text = `Great! I can help you with ${option}.\nWhat category are you looking for?`;
        botMessage.options = subOptions;
        setCurrentStep("mainCategory");
        break;

      case "mainCategory": {
        setSelectedSubCategory(option);
        let subCategories = ["Professionals", "Ideas"].includes(
          selectedCategory
        )
          ? productData[selectedCategory][option]
          : Object.keys(productData[selectedCategory][option]);

        if (subCategories.length > 0) {
          botMessage.text = `We have options for ${option}. Which one interests you?`;
          botMessage.options = subCategories;
          setCurrentStep("subCategory");
        } else {
          botMessage.text = `Please describe what you're looking for in ${option}.`;
          setCurrentStep("description");
        }
        break;
      }

      case "subCategory": {
        if (["Professionals", "Ideas"].includes(selectedCategory)) {
          botMessage.text =
            "Excellent choice! Could you describe your requirements?";
          setCurrentStep("description");
        } else {
          const products =
            productData[selectedCategory][selectedSubCategory][option];
          botMessage.text = `Here are ${option} options:`;
          botMessage.options = products;
          setCurrentStep("productSelection");
        }
        break;
      }

      case "productSelection":
        botMessage.text =
          "Excellent choice! Could you describe your requirements?\n(e.g., size, material, style, budget)";
        setCurrentStep("description");
        break;

      default:
        if (currentStep === "description") {
          botMessage.text = " Could you please describe your requirements ";
        } else {
          botMessage.text = "Please select an option to continue.";
        }
    }

    if (botMessage.text) setMessages((prev) => [...prev, botMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    if (currentStep === "description") {
      if (selectedCategory === "Products") {
        await productRecommendations(inputValue);
      } else if (selectedCategory === "Ideas") {
        await ideaRecommendations(inputValue);
      }
      setCurrentStep("welcome");
      setSelectedCategory("");
      setSelectedSubCategory("");
    }

    setInputValue("");
  };

  const productRecommendations = async (description) => {
    try {
      const res = await fetch("/api/search/products", {
        method: "POST",
        body: JSON.stringify({ query: description, topK: 5 }),
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        const message = { text: "No products found", sender: "bot" };
        setMessages((prev) => [...prev, message]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          type: "products",
          products: data,
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const ideaRecommendations = async (description) => {
    try {
      const res = await fetch("/api/search/ideas", {
        method: "POST",
        body: JSON.stringify({ query: description, topK: 5 }),
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        const message = { text: "No ideas found", sender: "bot" };
        setMessages((prev) => [...prev, message]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          type: "ideas",
          ideas: data,
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        text: "Hi,\nWelcome to BuildingWorld.\n\nHow can I help you?\nWhat are you looking for?",
        sender: "bot",
        options: ["Products", "Professionals", "Ideas"],
      },
    ]);
    setCurrentStep("welcome");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setInputValue("");
  };

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div>
        <Image src={"/home.png"} alt="home page" width={5000} height={5000} />
      </div>
      {/* Chatbot Icon */}
     {!isOpen && <div
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex justify-center items-center cursor-pointer shadow-md hover:scale-110 transition-all duration-300 z-50"
        onClick={toggleChat}
      >
        <Image
          src={"/BW-bot.png"}
          alt="bot-image"
          className=""
          width={100}
          height={100}
        />
      </div>}

      {/* Chatbot Container - only visible when isOpen is true */}
      {isOpen && (
        <div className="fixed bottom-1 right-5 w-96 h-150  bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden ">
          <div className="bg-[#009ee5e6] text-black p-4 flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-default">
              <Image
                src={"/BW-bot.png"}
                alt="bot-image"
                className=""
                width={40}
                height={40}
              />
              <h3 className="text-sm font-bold m-0">
                BW Bot
              </h3>
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

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 text-black">
            {messages.map((message, index) => {
              if (message.type === "products") {
                return (
                  <div
                    key={index}
                    className={`mb-2 px-3 py-2 rounded-lg max-w-[80%] ${
                      message.sender === "user"
                        ? "ml-auto bg-blue-100"
                        : "mr-auto bg-gray-100"
                    }`}
                  >
                    <h4 className="font-medium">Recommended Products</h4>
                    <div className="flex flex-col gap-2 mt-2 text-black">
                      {message.products.map((product, i) => (
                        <div
                          key={i}
                          className="bg-white p-2 rounded-lg shadow-sm"
                        >
                          <h5 className="font-bold">{product.name}</h5>
                          <p className="text-gray-600">
                            {product.description || "No description available."}
                          </p>
                          <p>
                            <strong>Category:</strong> {product.category}
                          </p>
                          <p>
                            <strong>Score:</strong>{" "}
                            {product.similarityScore?.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (message.type === "ideas") {
                return (
                  <div
                    key={index}
                    className={`mb-2 px-3 py-2 rounded-lg max-w-[80%] ${
                      message.sender === "user"
                        ? "ml-auto bg-blue-100"
                        : "mr-auto bg-gray-100"
                    }`}
                  >
                    <h4 className="font-medium">Design Ideas</h4>
                    <div className="flex flex-col gap-2 mt-2 text-black">
                      {message.ideas.map((idea, i) => (
                        <div
                          key={i}
                          className="bg-white p-2 rounded-lg shadow-sm"
                        >
                          <h5 className="font-bold">{idea.title}</h5>
                          <p>{idea.summary || "No summary available."}</p>
                          <p>
                            <strong>Category:</strong> {idea.category}
                          </p>
                          <p>
                            <strong>Score:</strong>{" "}
                            {idea.similarityScore?.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={index}>
                  <div
                    className={`mb-2 px-3 py-2 rounded-lg max-w-[80%] ${
                      message.sender === "user"
                        ? "ml-auto bg-blue-100"
                        : "mr-auto bg-gray-100"
                    }`}
                  >
                    {message.text.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                  {message.options && message.options.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors w-fit"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

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
        </div>
      )}
    </>
  );
};

export default Chatbot;
