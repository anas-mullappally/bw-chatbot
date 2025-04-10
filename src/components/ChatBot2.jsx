"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BotMessageSquare } from "lucide-react";

const Chatbot2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi,\nWelcome to BuildingWorld.\n\nHow can I help you?\nWhat are you looking for?\n1. Products\n2. Professionals\n3. Ideas",
      sender: "bot",
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

  const formatOptions = (options) => {
    return options.map((option, index) => `${index + 1}. ${option}`).join("\n");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    let botMessage = { text: "", sender: "bot" };

    switch (currentStep) {
      case "welcome":
        if (["1", "2", "3"].includes(inputValue)) {
          const options = ["Products", "Professionals", "Ideas"];
          const selection = options[parseInt(inputValue) - 1];
          setSelectedCategory(selection);
          const subOptions = Object.keys(productData[selection]);
          botMessage.text = `Great! I can help you with ${selection}.\nWhat category are you looking for?\n${formatOptions(
            subOptions
          )}`;
          setCurrentStep("mainCategory");
        } else {
          botMessage.text = "Please select a valid option (1, 2, or 3).";
        }
        break;

      case "mainCategory": {
        const mainCategories = Object.keys(productData[selectedCategory]);
        const mainCatSelection = mainCategories[parseInt(inputValue) - 1];

        if (mainCatSelection) {
          setSelectedSubCategory(mainCatSelection);
          let subCategories = ["Professionals", "Ideas"].includes(
            selectedCategory
          )
            ? productData[selectedCategory][mainCatSelection]
            : Object.keys(productData[selectedCategory][mainCatSelection]);

          if (subCategories.length > 0) {
            botMessage.text = `We have options for ${mainCatSelection}. Which one interests you?\n${formatOptions(
              subCategories
            )}`;
            setCurrentStep("subCategory");
          } else {
            botMessage.text = `Please describe what you're looking for in ${mainCatSelection}.`;
            setCurrentStep("description");
          }
        } else {
          botMessage.text = "Invalid selection. Please try again.";
        }
        break;
      }

      case "subCategory": {
        if (["Professionals", "Ideas"].includes(selectedCategory)) {
          botMessage.text =
            "Excellent choice! Could you describe your requirements?";
          setCurrentStep("description");
        } else {
          const subCategories = Object.keys(
            productData[selectedCategory][selectedSubCategory]
          );
          const subCatSelection = subCategories[parseInt(inputValue) - 1];

          if (subCatSelection) {
            const products =
              productData[selectedCategory][selectedSubCategory][
                subCatSelection
              ];
            botMessage.text = `Here are ${subCatSelection} options:\n${formatOptions(
              products
            )}\n\nWhich one interests you?`;
            setCurrentStep("productSelection");
          } else {
            botMessage.text = "Invalid selection. Please try again.";
          }
        }
        break;
      }

      case "productSelection":
        botMessage.text =
          "Excellent choice! Could you describe your requirements?\n(e.g., size, material, style, budget)";
        setCurrentStep("description");
        break;

      case "description":
        if (selectedCategory === "Products") {
          await productRecommendations(userMessage.text);
        } else if (selectedCategory === "Ideas") {
          await ideaRecommendations(userMessage.text);
        }
        setCurrentStep("welcome");
        setSelectedCategory("");
        setSelectedSubCategory("");
        break;

      default:
        botMessage.text = "Please select an option to continue.";
    }

    if (botMessage.text) setMessages((prev) => [...prev, botMessage]);
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
        text: "Hi,\nWelcome to BuildingWorld.\n\nHow can I help you?\nWhat are you looking for?\n1. Products\n2. Professionals\n3. Ideas",
        sender: "bot",
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
      <div
        className="fixed bottom-5 right-5 w-14 h-14 bg-blue-600 rounded-full flex justify-center items-center cursor-pointer shadow-md hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50"
        onClick={toggleChat}
      >
        <BotMessageSquare height={24} width={24} />
      </div>

      {/* Chatbot Container - only visible when isOpen is true */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 w-90 max-h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden ">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="text-sm font-medium m-0">BuildingWorld Assistant</h3>
            <div className="flex gap-2">
              <button
                className="bg-transparent border-none text-white cursor-pointer p-1 text-xs flex items-center"
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
                className="bg-transparent border-none text-white cursor-pointer p-1 text-xs"
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
                <div
                  key={index}
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
              placeholder="Type your response..."
              className="flex-1 p-2 border border-gray-300 rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot2;
