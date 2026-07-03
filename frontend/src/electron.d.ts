// export {};

// declare global {
//   interface Window {
//     electronAPI: {
//       saveFile: (
//         buffer: ArrayBuffer,
//         companyName: string,
//         fileName: string,
//       ) => Promise<void>;
//     };
//   }
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

      sMin: () => Promise<boolean>;

      compact: () => Promise<boolean>;

      minimize: () => Promise<void>;

      maximize: () => Promise<boolean>;

      close: () => Promise<void>;
    };
  }
}
