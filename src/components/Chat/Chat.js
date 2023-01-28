import React, { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { BiLogIn } from "react-icons/bi";
import { BsDiscord, BsFillChatDotsFill } from "react-icons/bs";
import { CiDark } from "react-icons/ci";
import agent from "../../assest/brain.svg";
import user from "../../assest/user-circle.svg";

import "../style/style.css";
const Chat = () => {
  const [form, setForm] = useState("");

  // const form = document.querySelector('form')
  const chatContainer = document.querySelector("#chat_container");

  let loadInterval;

  function loader(element) {
    element.textContent = "";

    loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += ".";

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === "....") {
        element.textContent = "";
      }
    }, 300);
  }

  function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

  // generate unique ID for each message div of bot
  // necessary for typing text effect for that specific reply
  // without unique ID, typing text will work on every element
  function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  }

  function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? agent : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                   
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = form;
    setForm("");
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data);

    // to clear the textarea input
    setForm("");

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    const response = await fetch("http://localhost:7999", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data,
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'
      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";
      alert(err);
    }
  };
  return (
    <div className="grid grid-cols-5">
      <div className="w-full  bg-[#030303ee] text-white text-xs flex flex-col justify-end gap-4 md:text-[16px] font-medium px-4 items-start pb-6">
        <h2 className="flex justify-start items-center gap-x-1">
          {" "}
          <span className="flex justify-start items-center gap-x-2">
            <BsFillChatDotsFill />
          </span>{" "}
          New chat
        </h2>
        <h2 className="flex justify-start items-center gap-x-2">
          <span>
            <CiDark />
          </span>{" "}
          Dark mode
        </h2>
        <h2 className="flex justify-start items-center gap-x-2">
          {" "}
          <span>
            <BsDiscord />
          </span>
          OpenAI Discord
        </h2>
        <h2 className="flex justify-start items-center gap-x-2">
          {" "}
          <span>
            <BiLogIn />
          </span>
          Login
        </h2>
        <p className="text-[8px]">powered by MRS</p>
      </div>
      <div id="app" className="col-span-4 w-full">
        <h2 className="title">Welcome ChatGPT V.3</h2>
        <div id="chat_container"></div>

        <form onSubmit={handleSubmit}>
          <input
            onChange={(e) => setForm(e.target.value)}
            name="prompt"
            autoComplete="off"
            value={form}
            placeholder="Ask your question..."
          />
          <button onClick={(e) => handleSubmit(e)}>
            <span>
              <AiOutlineSend className="text-white text-2xl" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
