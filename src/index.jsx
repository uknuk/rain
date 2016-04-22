
var ReactDOM = require('react-dom'),
    React = require('react'),
    Player = require('./player.jsx');

global.document = window.document;
global.navigator = window.navigator;

ReactDOM.render(<Player />, document.getElementById('app'));
