// App.js
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StudyPlanChat from "./components/StudyPlanChat";
import ReviewStudyPlan from "./components/ReviewStudyPlan";

function App() {
  console.log("hello")

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
          <Route path="/study-plan" element={<StudyPlanChat />} />
          <Route path="/review-study-plan" element={<ReviewStudyPlan userData={userData} />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
