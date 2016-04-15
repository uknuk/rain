var React = require('react'),
    lib = require('./lib.jsx'),
    _ = require('lodash'),
    path = require('path');

module.exports = React.createClass({
  displayName: 'Player',
  _fields: [
    'artist', 'album', 'track', 'length', 'played', 'bitrate', 'status'
  ],
  _colours: {
    artist: 'blue',
    album:  'green',
    track:  'red',
  },  
  getInitialState: function() {
    var state = {};
    _.each(this._fields, function(val) {
      state[val] = null;
    });
    return state;
  },
  componentDidMount: function() {
    //window.addEventListener("keypress", this.pause, true);
    this.timer = setInterval(this._tick, 1000);
  },

  shouldComponentUpdate(nextState, nextProps) {
    console.log(nextProps);
    return true;
  },

  componentWillUpdate: function() {
    console.log(this.props.data);
  },

  
  
  render: function() {
    return (
      <div>
        {
          _.map(this._fields, _.bind(function(key, n) {
            return <span key={n} style = {{color: this._colours[key] || 'brown'}}>
              {(this.state[key] || '') + ' '}
            </span>
          }, this))
         }
    </div>
    );
  },
  _tick: function() {
    var cmd = "current-song-filename current-song-length current-song-output-length current-song-bitrate-kbps",
        state = {},
        data = {},
        self = this,
        rest,
        name;

    lib.audtool(cmd, function(output) {
	    var lines = output.split(/\n/);
      //console.log(lines);
      if (lines[0] == 'No song playing.') {
		    lib.execute('pgrep audacious', function(output) {
		      if (output.length == 0) {
            state.status = 'Starting audacious';
			      lib.execute('audacious -h &');
		      }
		      else {
            _.each(self.state, function(val, key) {
              state[key] = null;
            });
		      	state.status = 'Silence';
		      }
          self.setState(state);
		    });
        return;
      }

      rest = lines[0];
      _.each(['track', 'album', 'artist'], function(key) {
		    name = path.basename(rest);
		    rest = path.dirname(rest);
		    if (self.state[key] != name) {
          data[key] = state[key] = name;
          if (key == 'track')
            data.tracks = fs.readdirSync(rest);
        }
	    });

      _.each(['length', 'played', 'bitrate'], function(key, n) {
        state[key] = lines[n + 1];
      });
      if (self.state.status == 'Silence')
      	state.status = null;
      self.setState(state);
      self.props.update(data);
    });  
  },
  pause: function(e) {
    var self = this;
    console.log(e.which);
    
    if (e.ctrlKey && String.fromCharCode(96 + e.which) == 'p')
      lib.audtool('playback-status', function(status) {
		    var cmd = status == "playing\n" ? 'pause' : 'play';		
		    lib.audtool('playback-' + cmd);
        self.setState({
            status: cmd == 'pause' ? 'Paused' : null
          });
	    });
  }

});
