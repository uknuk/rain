var React = require('react'),
    Player = require('./player.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
    	data: {}
      };
  },
     
  render: function() {
    return (
      <div>
        <Player data={this.state.data} update={this._updateData} />
      </div>
    );
  },

  _updateData: function(key, val) {
    var data = _.clone(this.state.data);
    data[key] = val;
    this.setState({
      data: data
    });
  }
  
});
  
