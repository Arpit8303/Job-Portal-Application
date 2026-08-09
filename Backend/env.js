// env.js — Must be the VERY FIRST import in server.js
// ES modules execute imports top-to-bottom at load time,
// so dotenv must load before any other module reads process.env
import dotenv from "dotenv";
dotenv.config();
