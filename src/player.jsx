var React = require('react'),
    lib = require('./lib.jsx'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

module.exports = React.createClass({
  fields: [
    'art', 'alb', 'track', 'length', 'played', 'bitrate', 'status'
  ],

  getInitialState: function() {
    var state = {
      sel: false,
      showAlbs: true,

    };

    _.each(this.fields, function(key) {
      state[key] = null;
    });

    if (lib.isPaused())
      state.status = 'Paused';

    return state;
  },

  componentDidMount: function() {
    window.addEventListener("keypress", this.keyhandler(), true);
    this.timer = setInterval(this.current, 1000);
    this.setState({arts: lib.load()});
  },


  render: function() {
    return (
      <div>
        <lib.Info fields={this.fields} state={this.state} />
        <lib.Tracks state={this.state} />
        <lib.Albums state={this.state} onClick={this.playAlbum} />
        {this.state.sel ? <input type='search' onChange={this.filter} autoFocus /> : null}
        <lib.Artists sel={this.state.sel} arts={this.state.chosen || _.keys(this.state.arts)} onClick={this.selected} />
      </div>
    );
  },

  current: function() {
    var state = _.clone(this.state),
        lines = lib.current(),
        rest = lines[0];

    if (rest == 'No song playing.') {
      if (lib.isStart())
        state.status = 'Starting audacious';
      else {
        state.status = 'Stopped';
        if (state.albs && state.alb)
          this.playNext(state)
      }
      this.setState(state);
      return;
    }

    if (state.status != 'Paused')
      state.status = null;

    rest = lines[0];
    _.each(['track', 'alb', 'art'], function(key) {
      rest = lib.fill(state, key, rest);
    });

    _.each(['length', 'played', 'bitrate'], function(key, n) {
        state[key] = lines[n + 1]
    });

    this.setState(state);
  },

  keyhandler: function() {
    var self = this,
        fmap = {
          w: function() {
            if (self.state.sel)
              self.setState({ sel: false, art: null, showAlbs: true });
            else
              self.setState({
                sel: true,
                showAlbs: false,
                chosen: null,
                arts: lib.load()
              });
          },
          p: function() {
            var cmd = lib.isPaused() ? 'play' : 'pause';
            lib.audtool('playback-' + cmd);
            self.setState({
              status: cmd == 'pause' ? 'Paused' : null
            });
          }
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
        state = _.clone(this.state),
        artdir = state.arts[art];

    state.art = art;
    state.showAlbs = true;
    state.albs = lib.sort(fs.readdirSync(artdir));
    nodirs = _.every(state.albs, function(alb) {
      return fs.statSync(path.join(artdir, alb)).isFile()
    });
    // check if albs has at least one directory(album)

    // if not, play it art is also album
    if (nodirs) {
      this.playAlbum(artdir, state);
    }
    else if (state.albs.length == 1)
      this.playAlbum(path.join(artdir, state.albs[0]), state);

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

    if (state.type == 'click') // onClick
      this.setState({
        sel: false,
        tracks: null,
        status: null
      });
    else {
      state.sel  = false;
      state.tracks = self.status = null;
    }
  },

  filter: function(ev) {
    var chosen = _.filter(_.keys(this.state.arts), function(art) {
          return _.startsWith(_.toLower(art), ev.target.value);
        });

    if (chosen.length == 1)
      this.selected(chosen[0]);

    this.setState({chosen: chosen});
  }

});
