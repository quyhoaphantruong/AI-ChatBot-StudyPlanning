import  { useState, useEffect } from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { flushSync } from "react-dom";
import remarkGfm from "remark-gfm";

const StudyPlan = ({ userData, onReset }) => {
  const [accumulatedText, setAccumulatedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchStudyPlan = () => {
      fetch("http://127.0.0.1:5000/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
        .then((response) => {
          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let partialData = "";

          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (isCancelled) return;

              if (done) {
                console.log("Stream complete");
                setIsGenerating(false);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              partialData += chunk;

              flushSync(() => {
                setAccumulatedText((prev) => prev + chunk);
              });

              // Continue reading
              readChunk();
            }).catch(error => {
              console.error("Error reading stream:", error);
              setIsGenerating(false);
            });
          };

          readChunk();
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsGenerating(false);
        });

      return () => {
        isCancelled = true;
      };
    };

    fetchStudyPlan();
  }, [userData]);

  return (
    <Box
      sx={{
        maxWidth: "800px",
        width: "100%",
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
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
        Study Plan Overview
      </Typography>

      <ReactMarkdown
        children={accumulatedText}
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
          strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
        }}
      />

      {isGenerating && (
        <>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Generating study plan...
          </Typography>
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={onReset}
      >
        Generate Another Plan
      </Button>
    </Box>
  );
};

export default StudyPlan;
