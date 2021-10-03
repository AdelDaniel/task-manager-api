// this is the file where my programm start

const app = require("./app-init-express");
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server Is On port: ${port}`);
});
