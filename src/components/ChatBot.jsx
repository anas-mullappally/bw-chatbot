"use client";
import React, { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatToggle from "@/components/ChatToggle";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatOptions from "@/components/ChatOptions";
import Image from "next/image";

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
  const [selectedSecondSubCategory, setSelectedSecondSubCategory] =
    useState("");
  const [clickedOptions, setClickedOptions] = useState(new Set());

  const productData = {
    Products: {
      "Bathroom & Sanitaryware": {
        "Washbasin & Vanity Unit": [
          "Countertop Basins",
          "Vanity Units",
          "Washbasin",
        ],
        "Water Closet": ["Sliding Door", "Pivot Door", "Walk-in"],
        Taps: ["Taps"],
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

  const handleDisableOptions = (options) => {
    setClickedOptions((prev) => {
      const newSet = new Set(prev);
      // Add all main options (Products, Professionals, Ideas)
      options.forEach((opt) => newSet.add(opt));
      return newSet;
    });
  };

  const handleOptionClick = (option) => {
    if (clickedOptions.has(option)) return;
    // setClickedOptions((prev) => new Set(prev).add(option));

    const userMessage = { text: option, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    let botMessage = { text: "", sender: "bot", options: [] };

    switch (currentStep) {
      case "welcome":
        setSelectedCategory(option);
        const options = Object.keys(productData);
        handleDisableOptions(options);
        const subOptions = Object.keys(productData[option]);
        botMessage.text = `Great! I can help you with ${option}.\nWhat category are you looking for?`;
        botMessage.options = subOptions;
        setCurrentStep("mainCategory");
        break;

      case "mainCategory": {
        const subOptions = Object.keys(productData[selectedCategory]);
        handleDisableOptions(subOptions);
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
        {
          const subCategoryOptions = ["Professionals", "Ideas"].includes(
            selectedCategory
          )
            ? productData[selectedCategory][selectedSubCategory]
            : Object.keys(productData[selectedCategory][selectedSubCategory]);

          handleDisableOptions(subCategoryOptions);
        }
        if (["Professionals", "Ideas"].includes(selectedCategory)) {
          botMessage.text =
            "Excellent choice! Could you describe your requirements?";
          setCurrentStep("description");
        } else {
          setSelectedSecondSubCategory(option);
          const products =
            productData[selectedCategory][selectedSubCategory][option];
          botMessage.text = `Here are ${option} options:`;
          botMessage.options = products;
          setCurrentStep("productSelection");
        }
        break;
      }

      case "productSelection": {
        const options =
          productData[selectedCategory][selectedSubCategory][
            selectedSecondSubCategory
          ];

        console.log(options, "op");
        handleDisableOptions(options);

        botMessage.text =
          "Excellent choice! Could you describe your requirements?\n(e.g., size, material, style, budget)";
        setCurrentStep("description");
        break;
      }
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
    setClickedOptions(new Set());
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
      <ChatToggle isOpen={isOpen} toggleChat={toggleChat} />

      {isOpen && (
        <div className="fixed bottom-1 right-5 w-96 h-150 bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
          <ChatHeader toggleChat={toggleChat} handleReset={handleReset} />

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 text-black">
            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage
                  message={message}
                  handleOptionClick={handleOptionClick}
                />
                {message.options && (
                  <ChatOptions
                    options={message.options}
                    handleOptionClick={handleOptionClick}
                    clickedOptions={clickedOptions}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
