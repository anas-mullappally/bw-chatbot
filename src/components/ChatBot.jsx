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
  const [location, setLocation] = useState("");
  const [clickedOptions, setClickedOptions] = useState(new Set());
  const [category, setCategory] = useState("");

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
      "Access Safety & Security": [],
      "Doors & Entrances": [],
    },
    Professionals: ["Interior Designer", "Architect"],
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
        const subOptions =
          option === "Professionals"
            ? productData[option]
            : Object.keys(productData[option]);
        // console.log(subOptions, "sub");

        botMessage.text = `Great! I can help you with ${option}.\nWhat category are you looking for?`;
        botMessage.options = subOptions;
        if (option === "Professionals") {
          setCurrentStep("subCategory");
        } else {
          setCurrentStep("mainCategory");
        }
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
          let subCategoryOptions;

          if (selectedCategory === "Professionals") {
            subCategoryOptions = productData[selectedCategory];
          } else if (selectedCategory === "Ideas") {
            subCategoryOptions =
              productData[selectedCategory][selectedSubCategory];
          } else {
            subCategoryOptions = Object.keys(
              productData[selectedCategory][selectedSubCategory]
            );
          }

          handleDisableOptions(subCategoryOptions);
        }

        if (["Professionals", "Ideas"].includes(selectedCategory)) {
          setCategory(option);
          botMessage.text =
            "Excellent choice! Please share your city for the relevant idea near your city.";
          setCurrentStep("location");
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

        handleDisableOptions(options);
        setCategory(option);
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

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage = { text: trimmedInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    if (currentStep === "location") {
      setInputValue("");
      const message = {
        text: "Excellent choice! Could you describe your requirements?",
        sender: "bot",
      };
      setMessages((prev) => [...prev, message]);
      setCurrentStep("description");
    } else if (currentStep === "description") {
      console.log(trimmedInput, selectedCategory, category, "blah");
      if (selectedCategory === "Products" || selectedCategory === "Ideas") {
        setInputValue("");
        getRecommendations(trimmedInput, selectedCategory, category);
      }
      setCurrentStep("welcome");
      setSelectedCategory("");
      setSelectedSubCategory("");
      setLocation("");
      setCategory("");
    }
  };

  // location variable is exist and update  above
  const getRecommendations = async (query, productType, category) => {
    try {
      let updatedQuery = query;
      if (productType === "Ideas" && location) {
        updatedQuery = `${query} in ${location}`;
      }
      const res = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({
          query: updatedQuery,
          topK: 3,
          productType,
          category,
        }),
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        const message = { text: "No products found", sender: "bot" };
        setMessages((prev) => [...prev, message]);
        return;
      }
      const message = {
        sender: "bot",
        type: productType?.toLowerCase(),
      };
      if (productType === "Products") {
        message.products = data;
      } else if (productType === "Ideas") {
        message.ideas = data;
      }
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error(error);
    }
  };

  // const productRecommendations = async (description) => {
  //   try {
  //     const res = await fetch("/api/search/products", {
  //       method: "POST",
  //       body: JSON.stringify({ query: description, topK: 5 }),
  //     });
  //     const data = await res.json();
  //     if (!data || data.length === 0) {
  //       const message = { text: "No products found", sender: "bot" };
  //       setMessages((prev) => [...prev, message]);
  //       return;
  //     }
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         sender: "user",
  //         type: "products",
  //         products: data,
  //       },
  //     ]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const ideaRecommendations = async (description) => {
  //   try {
  //     const res = await fetch("/api/search/ideas", {
  //       method: "POST",
  //       body: JSON.stringify({ query: description, topK: 5 }),
  //     });
  //     const data = await res.json();
  //     if (!data || data.length === 0) {
  //       const message = { text: "No ideas found", sender: "bot" };
  //       setMessages((prev) => [...prev, message]);
  //       return;
  //     }
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         sender: "user",
  //         type: "ideas",
  //         ideas: data,
  //       },
  //     ]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
    setSelectedSecondSubCategory("");
    setLocation("");
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
