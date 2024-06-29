import path from "path";
import urlImage from "../controllers/students/urlImage";
import fs from "fs";

export default function deletePhoto(PhotoName: any) {
  let myPath: string | null = path.normalize(
    __dirname + `../../../storage/uploads/${PhotoName}`
  );
  fs.unlinkSync(myPath);
}
