const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendButton = form.querySelector("button");

// Array to store the conversation history
const chatHistory = [];

/**
 * Appends a message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message text.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  // Add user message to history for context
  chatHistory.push({ role: "user", content: userMessage });

  input.value = "";
  sendButton.disabled = true;

  const thinkingMessage = appendMessage("bot", "Thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response from server.");
    }

    const botResponse = data.result || "Sorry, no response received.";
    thinkingMessage.textContent = botResponse;

    // Add bot response to history. The Gemini API uses 'model' for the assistant's role.
    chatHistory.push({ role: "model", content: botResponse });
  } catch (error) {
    console.error("Error fetching chat response:", error);
    thinkingMessage.textContent = error.message || "An error occurred while fetching the response.";
    // On error, remove the last user message from history to allow retrying.
    chatHistory.pop();
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
});
