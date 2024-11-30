// App.js
import { useState } from "react";
import { CssBaseline, Box } from "@mui/material";
import StudyPlanForm from "./components/StudyPlanForm";
import StudyPlan from "./components/StudyPlan";
import StudyPlanChat from "./components/StudyPlanChat";

function App() {
  const [userData, setUserData] = useState(null);

  const handleFormSubmit = (data) => {
    setUserData(data);
  };

  return (
    <>
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
        {!userData ? (
          // <StudyPlanForm onSubmit={handleFormSubmit} />
          <StudyPlanChat />
        ) : (
          <StudyPlan userData={userData} />
        )}
      </Box>
    </>
  );
}

export default App;
