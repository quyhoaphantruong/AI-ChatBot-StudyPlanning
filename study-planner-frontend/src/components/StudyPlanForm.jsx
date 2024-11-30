// StudyPlanForm.js
import  { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import "../styles/StudyPlanChat.css"

const learningStyles = [
  { value: "visual", label: "Visual" },
  { value: "auditory", label: "Auditory" },
  { value: "kinesthetic", label: "Kinesthetic" },
  { value: "hands-on", label: "Hands-On" },
];

const StudyPlanForm = ({ onSubmit }) => {
  const [topic, setTopic] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [learningStyle, setLearningStyle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic && timeFrame) {
      onSubmit({ topic, time_frame: timeFrame, learning_style: learningStyle });
    } else {
      alert("Please fill in the required fields.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: "500px",
        width: "100%",
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <TextField
        label="Topic"
        variant="outlined"
        required
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <TextField
        label="Time Frame (in days)"
        variant="outlined"
        required
        type="number"
        value={timeFrame}
        onChange={(e) => setTimeFrame(e.target.value)}
      />
      <TextField
        select
        label="Learning Style"
        variant="outlined"
        value={learningStyle}
        onChange={(e) => setLearningStyle(e.target.value)}
      >
        {learningStyles.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" color="primary">
        Generate Study Plan
      </Button>
    </Box>
  );
};

export default StudyPlanForm;
