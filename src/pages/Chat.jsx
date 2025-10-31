import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { getUserMessages, postMessages, deleteMessages } from "../services/api";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Guest";
  const [avatar] = useState(() => {
    // Hämta från localStorage eller generera en konsekvent baserat på username
    let stored = localStorage.getItem("avatar");
    if (stored) return stored;
    
    // Generera en konsekvent avatar baserat på username om ingen finns
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const avatarId = Math.abs(hash % 70) + 1;
    const generatedAvatar = `https://i.pravatar.cc/200?img=${avatarId}`;
    localStorage.setItem("avatar", generatedAvatar);
    return generatedAvatar;
  });
  const [botAvatar] = useState(() => {
    let stored = localStorage.getItem("botAvatar");
    if (stored) return stored;
    const randomId = Math.floor(Math.random() * 70) + 1;
    const url = `https://i.pravatar.cc/200?img=${randomId}`;
    localStorage.setItem("botAvatar", url);
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

    // DOMPurify tar automatiskt bort script-taggar och deras innehåll helt
    // Detta säkerställer att farliga script-taggar inte kan köras
    const clean = DOMPurify.sanitize(text, {
      KEEP_CONTENT: false, // Ta bort innehållet i script-taggar helt
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target'], // Endast säkra attribut
    });

    // Om meddelandet blir tomt efter sanitering, visa varning eller blockera
    if (!clean.trim()) {
      alert("Meddelandet innehöll farliga HTML-taggar och togs bort.");
      return;
    }

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
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(m.text, {
                    KEEP_CONTENT: false, // Ta bort innehållet i script-taggar helt
                    // DOMPurify tar automatiskt bort script-taggar och deras innehåll
                    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
                    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                    ALLOWED_ATTR: ['href', 'target'], // Endast säkra attribut
                  })
                }}
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
