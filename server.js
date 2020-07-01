const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('tiny'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, () => {
    console.log(`Server is listening to the port: ${PORT}`);
});

module.exports = app;