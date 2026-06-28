import { pdf } from "@react-pdf/renderer";
import ResumePDF, { type Resume } from "../components/ResumePdf";

export async function saveResume(
  resume: Resume,
  companyName: string,
  fileName = "Resume.pdf",
) {
  const blob = await pdf(<ResumePDF resume={resume} />).toBlob();
  const buffer = await blob.arrayBuffer();
  await window.electronAPI.saveFile(buffer, companyName, fileName);
}
