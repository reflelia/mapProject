import { useState, useEffect, useRef } from "react";

function ChatWidget({botMessage}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
    const messagesEndRef = useRef(null); // 스크롤 제어용 ref


  // 메시지 전송
  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { text: input, sender: "me", time: timeString },
    ]);
    setInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  useEffect(() => {
    if (botMessage) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { text: botMessage, sender: "other", time: timeString }
      ]);
    }
  }, [botMessage]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: isOpen ? "0" : "-460px", // 열렸을 때 0, 닫혔을 때 화면 아래로 숨김
        right: "20px",
        width: "350px",
        height: "500px",
        backgroundColor: "#fff",
        borderRadius: "10px 10px 0 0",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
        transition: "bottom 0.3s ease-in-out",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* 헤더 영역 */}
      <div
        style={{
          background: "#474747ff",
          color: "#ffffffff",
          padding: "10px",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "▼" : "▲"}
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === "me" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "12px",
                background: msg.sender === "me" ? "#1976d2" : "#eee",
                color: msg.sender === "me" ? "#fff" : "#000",
                maxWidth: "80%",
              }}
            >
              {msg.text}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                marginTop: "2px"
              }}
            >
              {msg.time}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 본문 영역 */}
      {/* <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
      </div> */}

      {/* 입력 영역 */}
      <div style={{padding: "5px", borderTop: "1px solid #ccc", display: "flex", alignItems:"center"}}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // 엔터 입력
          placeholder="메시지를 입력하세요"
          style={{flex: 1, padding: "5px", border: "none", outline: "none"}}
        />
        <button
        onClick={sendMessage}
            style={{
            marginLeft: "8px",
            padding: "6px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
            }}
        >
        전송
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;
