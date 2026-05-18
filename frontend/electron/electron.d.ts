interface Window {
  electronAPI: {
    saveFile: (
      buffer: ArrayBuffer,
      companyName: string,
      fileName: string,
    ) => Promise<void>;
  };
}
