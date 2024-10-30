import fs from "fs";
import path from "path";

export const findClassFile = (
  className: string,
  startPath: string
): string | null => {
  const files = fs.readdirSync(startPath);

  for (const file of files) {
    const filePath = path.join(startPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const found = findClassFile(className, filePath);
      if (found) return found;
    } else if (
      file.toLowerCase() === `${className.toLowerCase()}.js` ||
      file.toLowerCase() === `${className.toLowerCase()}.ts`
    ) {
      return filePath;
    } else {
    }
  }

  return null;
};
