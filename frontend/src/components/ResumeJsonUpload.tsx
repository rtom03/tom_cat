import React from "react";
import { uploadJsonResume } from "../services/appServices";

const ResumeJsonUpload = () => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const json = JSON.parse(event.target?.result as string);
      await uploadJsonResume(json); // extract the fetch logic into a function
    };
    reader.readAsText(file);
  };

  // In JSX
  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileUpload} />
    </div>
  );
};

export default ResumeJsonUpload;
