import { exit } from "node:process";
import mongoose from "mongoose";

export const connectDB = async () => {
   try {
      const databaseUri = process.env.DATABASE_URI;
      if (!databaseUri) {
         console.error("DATABASE_URI no se encontro en el archivo .env");
         exit(1);
      }
      const { connection } = await mongoose.connect(databaseUri);
      const url = `${connection.host}:${connection.port}`;
      console.log(`MongoDB conectado en: ${url}`);
   } catch (error) {
      console.log("Error al conectar a MongoDB");
      exit(1);
   }
};
