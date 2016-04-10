
var ReactDOM = require('react-dom'),
    React = require('react'),
    Main = require('./main.jsx');

global.document = window.document;
global.navigator = window.navigator;


ReactDOM.render(<Main />, document.getElementById('app'));
