const path = require("path");

// this file is used only to run .env.test >> instead of .env
const testEnvPath = path.resolve(process.cwd(), ".env.test");
require("dotenv").config({ path: testEnvPath });
