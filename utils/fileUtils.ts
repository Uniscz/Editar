
export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result from readAsDataURL is a data URL: "data:image/png;base64,iVBORw..."
      // We only need the base64 part, so we split and take the second part.
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
