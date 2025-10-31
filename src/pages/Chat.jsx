import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { getUserMessages, postMessages, deleteMessages } from "../services/api";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const userId = sessionStorage.getItem("userId");
  const username = sessionStorage.getItem("username") || "Guest";
  const avatar =
    sessionStorage.getItem("avatar") || "https://i.pravatar.cc/200";
  const [botAvatar] = useState(() => {
    let stored = sessionStorage.getItem("botAvatar");
    if (stored) return stored;
    const randomId = Math.floor(Math.random() * 70) + 1;
    const url = `https://i.pravatar.cc/200?img=${randomId}`;
    sessionStorage.setItem("botAvatar", url);
    return url;
  });
  const chatListRef = useRef(null);

  async function load() {
    try {
      const msgs = await getUserMessages();
      setMessages(msgs || []);
    } catch (err) {
      console.error("Kunde inte hämta meddelanden", err);
    }

    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }, 200);
  }

  useEffect(() => {
    load();
  }, []);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const clean = DOMPurify.sanitize(text);

    await postMessages(clean);
    setText("");
    await load();
    setTimeout(() => {
      const botMsg = {
        id: `bot-${Date.now()}`,
        text: "Auto-response: Tack för ditt meddelande!",
        createdAt: new Date().toISOString(),
        userId: "support-bot",
      };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => {
        if (chatListRef.current) {
          chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
      }, 50);
    }, 900);
  }

  async function remove(id) {
    await deleteMessages(id);
    await load();
  }

  return (
    <div className="chat-wrap">
      <header className="chat-header">
        <img src={avatar} alt="avatar" className="chat-avatar" />
        <span className="chat-username">{username}</span>
      </header>
      <div className="chat-list" ref={chatListRef}>
        {messages.map((m) => {
          const mine = String(m.userId) === String(userId);
          return (
            <div key={m.id} className={`msg ${mine ? "mine" : "other"}`}>
              <img
                src={mine ? avatar || "https://i.pravatar.cc/200" : botAvatar}
                alt="avatar"
                className="msg-avatar"
              />
              <div
                className="bubble"
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
              {mine && (
                <button className="delete" onClick={() => remove(m.id)}>
                  🗑
                </button>
              )}
            </div>
          );
        })}
      </div>

      <form className="chat-input" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv ett meddelande..."
        />
        <button type="submit">Skicka</button>
      </form>
    </div>
  );
}
