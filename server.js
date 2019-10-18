const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(`UNHANDLE REJECTION! : 💥. Shutting down...`);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env'
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  // eslint-disable-next-line no-unused-vars
  .then(con => console.log('DB Connection successfully.'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listen port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(`UNHANDLE REJECTION! : 💥. Shutting down...`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
