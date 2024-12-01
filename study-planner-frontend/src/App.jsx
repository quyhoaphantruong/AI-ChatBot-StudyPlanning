import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudyPlanChat from "./components/StudyPlanChat";
import ReviewStudyPlan from "./components/ReviewStudyPlan";

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
        }}
      >
        <Routes>
          <Route path="/" element={<StudyPlanChat />} />
          <Route path="/review" element={<ReviewStudyPlan />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
