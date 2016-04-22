var React = require('react'),
    lib = require('./lib.jsx'),
    _ = require('lodash'),
    cproc = require('child_process'),
    path = require('path');

module.exports = React.createClass({
  fields: [
    'art', 'alb', 'track', 'length', 'played', 'bitrate', 'status'
  ],
  
  getInitialState: function() {
    var state = {};
    _.each(this._fields, function(key) {
      state[key] = null;
    });
    return state;
  },
  
  componentDidMount: function() {
    window.addEventListener("keypress", this.keyhandler(), true);
    this.timer = setInterval(this.current, 1000);
    setState({arts: lib.load()});
  },

  componentDidUpdate: function() {
    if (this.refs.search)
      this.refs.search.focus();
  },
  
  render: function() {
    return (
      <div>
        <lib.Info fields={this.fields} state={this.state} />
        <p></p>
        <lib.Tracks state={this.state} />
        <lib.Albums state={this.state} onClick={this.playAlbum} />
        <lib.Artists state={this.state} onClick={this.selected} />
        <p></p>
        {
          this.state.search ? (
            <Typeahead ref="search"
            options={_.keys(this.state.arts)}
            onOptionSelected={this.selected}
            filterOption={this.match}
            defaultValue= " "
            />
          ) : null
         }           
      </div>
    );
  },
  
  current: function() {
    var state = _clone(this.state),
        lines = lib.current(),
        rest = lines[0];

    if (rest == 'No song playing.') {
      if (!lib.exec('pgrep audacious')) {
        state.status = 'Starting audacious';
        cproc.exec('audacious -h &');
      }
      else {
        state.status = 'Silence';
        if (state.albs && state.alb)
          this.playNext(state)             
      }
      this.setState(state);
      return;
    }

    if (state.status != 'Paused')
      state.status = null;

    rest = lines[0];
    _.each(['track', 'album', 'artist'], function(key) {
      rest = lib.fill(state, key, rest);
    });

    this.setState(state);
  },

  keyhandler: function() {
    var self = this,
        fmap = {
          w: function() {
            if (self.sel)
              self.setState({ sel: false, art: null });
            else
              self.setState({ sel: true, arts: lib.load() });
          },
          p: function() {
            var cmd = lib.audtool('playback-status') == "playing\n" ? 'pause' : 'play';   
            lib.audtool('playback-' + cmd);
            self.setState({
              status: cmd == 'pause' ? 'Paused' : null
            });
          },
          z: function() {
      		  self.setState({search: !self.state.search});
          },
        };

    return function(e) {
      if (e.ctrlKey) {
        var key = String.fromCharCode(96 + e.which);
        if (_.has(fmap, key)) {
          fmap[key]();
          e.preventDefault();
        }
      }
    };
  },
	
  selected: function(art) {
    var nodirs,
        state = _.clone(this.state);

    state.art = art;
    state.albs = lib.sort(fs.readdirSync(art));
    nodirs = _.every(state.albs, function(alb) {
      return fs.statSync(path.join(art, alb)).isFile()
    });
    // check if albs has at least one directory(album)
    
    // if not, play it art is also album
    if (nodirs) {
      this.playAlbum(art, state);
    }
    else if (state.albs.length == 1)
      this.playAlbum(path.join(art, state.albs[0]), state);
        
    this.setState(state);
  },

  match(input, opt) {
    return _.startsWith(_.toLower(opt), _.toLower(input));
  },

  playNext: function(state) {
    var alb = path.join(state.arts[state.art], state.albs[++state.albNum])
    this.playAlbum(alb, state);
  },

  playAlbum: function(alb, state) {
    if (fs.statSync(alb).isFile())
      lib.play([alb]);
    else
      lib.play(fs.readdirSync(alb), alb);
    
    if (state) 
    	state.sel = state.search = false;
    else
      this.setState({
        sel: false,
        search: false
      });
  },

});
