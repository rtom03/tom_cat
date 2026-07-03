// interface Window {
//   electronAPI: {
//     saveFile: (
//       buffer: ArrayBuffer,
//       companyName: string,
//       fileName: string,
//     ) => Promise<void>;
//   };
// }

// interface Window {
//   electronAPI: {
//     saveFile: (
//       buffer: ArrayBuffer,
//       companyName: string,
//       fileName: string,
//     ) => Promise<void>;

//     togglePin: () => Promise<boolean>;

//     toggleCompact: () => Promise<boolean>;

//     minimize: () => Promise<void>;

//     maximize: () => Promise<boolean>;

//     close: () => Promise<void>;
//   };
// }
export {};

declare global {
  interface Window {
    electronAPI: {
      saveFile: (
        buffer: ArrayBuffer,
        companyName: string,
        fileName: string,
      ) => Promise<void>;

      togglePin: () => Promise<boolean>;

      toggleCompact: () => Promise<boolean>;

      minimize: () => Promise<void>;

      maximize: () => Promise<boolean>;

      close: () => Promise<void>;
    };
  }
}
