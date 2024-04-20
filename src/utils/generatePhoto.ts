import path from "path";
import urlImage from "../controllers/students/urlImage";
import fs from "fs";

export function generatePhoto(image: any) {
  const imageName = Math.random().toString(36).substring(2, 7);
  let myPath: string | null = path.normalize(
    __dirname + `../../../storage/uploads/${imageName}.png`
  );
  console.log("myPath from validation ="+myPath);
  console.log("dirName from validation ="+__dirname);
  console.log(image);
  let baseName: any = path.basename(myPath);
  let imageUrl: any = urlImage(baseName);
  if (image) {
    fs.writeFile(myPath, image, (err) => {
      if (err) {
        console.log("Error");
      } else {
        console.log("hallo from png");
      }
    });
  } else {
    imageUrl = null;
    baseName = null;
    myPath = null;
  }
  return { imageUrl, baseName };
}
