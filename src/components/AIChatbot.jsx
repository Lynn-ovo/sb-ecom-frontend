import { useState, useRef } from "react";
import axios from "axios";

export default function AIChatbot() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([
        { sender: "bot", text: "Hi! I am your AI shopping assistant. You can ask me anything or upload a product image 📷" }
    ]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ===== 原有文字发送功能，未改动 =====
    const sendMessage = async () => {
        if (!message.trim()) return;

        const userText = message;
        setChat(prev => [...prev, { sender: "user", text: userText }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:8080/api/chatbot",
                { message: userText },
                { headers: { "Content-Type": "application/json" } }
            );
            setChat(prev => [...prev, { sender: "bot", text: res.data.reply }]);
        } catch (error) {
            setChat(prev => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    // ===== 新增：图片选择 =====
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // ===== 新增：图片发送 =====
    const sendImage = async () => {
        if (!imageFile) return;

        setChat(prev => [...prev, {
            sender: "user",
            text: "📷 I uploaded a product image",
            image: imagePreview
        }]);
        setImagePreview(null);
        setImageFile(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", imageFile);

            const res = await axios.post(
                "http://localhost:8080/api/image-search",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setChat(prev => [...prev, { sender: "bot", text: res.data.reply }]);
        } catch (error) {
            setChat(prev => [...prev, { sender: "bot", text: "Sorry, could not process the image." }]);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    return (
        <>
            {/* 浮动按钮 */}
            <button style={styles.floatingButton} onClick={() => setOpen(!open)}>
                {open ? "✕" : "💬"}
            </button>

            {open && (
                <div style={styles.chatBox}>
                    {/* Header */}
                    <div style={styles.header}>
                        <span>🛍️ AI Shopping Assistant</span>
                        <span style={styles.onlineDot}>● Online</span>
                    </div>

                    {/* Messages */}
                    <div style={styles.messages}>
                        {chat.map((msg, index) => (
                            <div key={index} style={msg.sender === "user" ? styles.userRow : styles.botRow}>
                                {msg.sender === "bot" && (
                                    <div style={styles.avatar}>🤖</div>
                                )}
                                <div style={msg.sender === "user" ? styles.userMsg : styles.botMsg}>
                                    {msg.image && (
                                        <img src={msg.image} alt="uploaded" style={styles.msgImage} />
                                    )}
                                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={styles.botRow}>
                                <div style={styles.avatar}>🤖</div>
                                <div style={styles.botMsg}>
                                    <span style={styles.typing}>● ● ●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 图片预览区 */}
                    {imagePreview && (
                        <div style={styles.previewArea}>
                            <img src={imagePreview} alt="preview" style={styles.previewImg} />
                            <div style={styles.previewBtns}>
                                <button style={styles.confirmBtn} onClick={sendImage}>
                                    Send Image
                                </button>
                                <button style={styles.cancelBtn} onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input 区域 */}
                    <div style={styles.inputArea}>
                        <input
                            style={styles.input}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about products..."
                            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                            disabled={loading}
                        />
                        {/* 新增图片按钮 */}
                        <button
                            style={styles.imgBtn}
                            onClick={() => fileInputRef.current.click()}
                            disabled={loading}
                            title="Upload product image"
                        >
                            📷
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                        <button
                            style={{ ...styles.sendBtn, opacity: loading ? 0.6 : 1 }}
                            onClick={sendMessage}
                            disabled={loading}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    floatingButton: {
        position: "fixed",
        right: "25px",
        bottom: "25px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 4px 15px rgba(37,99,235,0.5)"
    },
    chatBox: {
        position: "fixed",
        right: "25px",
        bottom: "95px",
        width: "370px",
        height: "500px",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden"
    },
    header: {
        padding: "14px 18px",
        backgroundColor: "#111827",
        color: "white",
        fontWeight: "bold",
        fontSize: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    onlineDot: {
        fontSize: "11px",
        color: "#4ade80"
    },
    messages: {
        flex: 1,
        padding: "14px",
        overflowY: "auto",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    botRow: {
        display: "flex",
        alignItems: "flex-end",
        gap: "8px"
    },
    userRow: {
        display: "flex",
        justifyContent: "flex-end"
    },
    avatar: {
        fontSize: "22px",
        flexShrink: 0
    },
    botMsg: {
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        padding: "10px 14px",
        borderRadius: "12px 12px 12px 0",
        fontSize: "14px",
        color: "#111827",
        maxWidth: "80%",
        lineHeight: "1.5",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    userMsg: {
        backgroundColor: "#2563eb",
        color: "white",
        padding: "10px 14px",
        borderRadius: "12px 12px 0 12px",
        fontSize: "14px",
        maxWidth: "80%",
        lineHeight: "1.5",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    msgImage: {
        width: "140px",
        borderRadius: "8px"
    },
    typing: {
        color: "#9ca3af",
        letterSpacing: "3px",
        fontSize: "16px"
    },
    previewArea: {
        padding: "10px 14px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    previewImg: {
        width: "55px",
        height: "55px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #e5e7eb"
    },
    previewBtns: {
        display: "flex",
        gap: "8px"
    },
    confirmBtn: {
        padding: "6px 12px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px"
    },
    cancelBtn: {
        padding: "6px 12px",
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px"
    },
    inputArea: {
        display: "flex",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white",
        padding: "8px"
    },
    input: {
        flex: 1,
        padding: "9px 12px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        outline: "none",
        fontSize: "14px",
        marginRight: "6px"
    },
    imgBtn: {
        padding: "9px 11px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        cursor: "pointer",
        fontSize: "16px",
        marginRight: "6px"
    },
    sendBtn: {
        padding: "9px 16px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold"
    }
};