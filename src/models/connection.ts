// or as an es module:
import { MongoClient, Db } from "mongodb";
//import { url } from "../../config";
import * as dotenv from "dotenv";
dotenv.config();
// Connection URL
const mongoUrl = process.env.url ? process.env.url : "";

const client = new MongoClient(mongoUrl);

// Database Name
const dbName = "elmentor";
// Use connect method to connect to the server
export async function connection() {
  await client.connect();
  console.log("database connected successfully");
}

export function collection(collectionName: string) {
  return client.db(dbName).collection(collectionName);
}
