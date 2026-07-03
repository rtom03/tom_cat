import { PanelTopOpen } from "lucide-react";

export default function TitleBar() {
  return (
    <div className="title-bar">
      {/* <div className="drag-region">TomCat</div> */}

      <button onClick={() => window.electronAPI.sMin()}>📌</button>

      <button onClick={() => window.electronAPI.compact()}>
        <PanelTopOpen size={18} />
      </button>

      <button onClick={() => window.electronAPI.minimize()}>─</button>

      <button onClick={() => window.electronAPI.maximize()}>□</button>

      <button onClick={() => window.electronAPI.close()}>✕</button>
    </div>
  );
}
