import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography, LinearProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ReviewStudyPlan = () => {
  const [messages, setMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user's message to the chat
    const newUserMessage = { role: "user", content: userInput };
    const newUserMessages = [...userMessages, newUserMessage];
    
    setUserMessages(newUserMessages);
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/review-study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newUserMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { role: "bot", content: data.feedback };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        console.error("Server error:", response.statusText);
        const errorMessage = { role: "bot", content: "Sorry, something went wrong. Please try again later." };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: "bot", content: "Unable to connect to the server. Please try again later." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          color: "primary.main",
          fontWeight: "bold",
          mb: 4,
        }}
      >
        Review Study Plan
      </Typography>

      {/* Chat messages display */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          border: "1px solid #ccc",
          p: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: message.role === "user" ? "row-reverse" : "row",
              mb: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: "70%",
                padding: 1,
                borderRadius: 2,
                backgroundColor: message.role === "user" ? "primary.main" : "background.default",
                color: message.role === "user" ? "white" : "text.primary",
              }}
            >
              {message.role === "bot" ? (
                <ReactMarkdown
                  children={message.content}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <Typography variant="h4" {...props} />,
                    h2: ({ node, ...props }) => <Typography variant="h5" {...props} sx={{ mt: 4, mb: 2 }} />,
                    h3: ({ node, ...props }) => <Typography variant="h6" {...props} sx={{ mt: 3, mb: 1 }} />,
                    p: ({ node, ...props }) => <Typography variant="body1" {...props} sx={{ mb: 2, lineHeight: 1.6 }} />,
                    li: ({ node, ordered, ...props }) => (
                      <li style={{ marginBottom: 8 }}>
                        <Typography variant="body1" component="span" {...props} />
                      </li>
                    ),
                    strong: ({ node, ...props }) => <strong style={{ fontWeight: "bold" }} {...props} />,
                    em: ({ node, ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  {message.content}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {isGenerating && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <LinearProgress sx={{ width: "100%" }} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input field and send button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          position: "sticky",
          bottom: 0,
          backgroundColor: "background.paper",
          zIndex: 1,
          p: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="Your Message"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ width: "auto" }}
        >
          Send
        </Button>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setMessages([])}
        >
          Reset Chat
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewStudyPlan;
