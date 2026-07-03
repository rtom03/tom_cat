import { pdf } from "@react-pdf/renderer";
import ResumePDF, { type Resume } from "../components/ResumePdf";

const sanitizeFolderName = (name: string) => {
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\.+$/, "")
    .replace(/\s+/g, " ")
    .trim();
};
export async function saveResume(
  resume: Resume,
  companyName: string,
  fileName = "Resume.pdf",
) {
  const blob = await pdf(<ResumePDF resume={resume} />).toBlob();
  const buffer = await blob.arrayBuffer();
  await window.electronAPI.saveFile(
    buffer,
    sanitizeFolderName(companyName),
    fileName,
  );
}
