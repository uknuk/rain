var React = require('react'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    lib = require('./lib.js'),
    comp = require('./components.jsx');

module.exports = React.createClass({
  fields: ['art', 'alb', 'track', 'bitrate'],

  getInitialState: function() {
    var state = {
      sel: false,
      showAlbs: true,
      pause: false,
      played: null,
      length: null
    };

    _.each(this.fields, function(key) {
      state[key] = null;
    });

    return state;
  },

  componentDidMount: function() {
    var arts = lib.loadArts(),
        [art, alb, num] = lib.loadLast(),
        albs = alb ? lib.sort(fs.readdirSync(arts[art])) : null;

    window.addEventListener("keypress", this.keyhandler(), true);

    if (lib.isLinux)
      this.timer = setInterval(this.current, 1000);

    if (num)
      this.playAlbum(alb, _.clone(this.state), parseInt(num));

    this.setState({
      arts: arts,
      art: art,
      selArt: art,
      albs: albs,
      albNum: _.indexOf(albs, path.basename(alb))
    });
  },


  render: function() {
    return (
      <div>
        <comp.Info fields={this.fields} state={this.state} />
        <comp.Tracks state={this.state} onClick={this.jump}/>
        <comp.Albums state={this.state} onClick={this.selectAlbum} />
        {this.state.sel && !this.state.showAlbs ? <input type='search' onChange={this.filter} autoFocus /> : null}
        <comp.Artists sel={this.state.sel} arts={this.state.chosen || _.keys(this.state.arts)} onClick={this.selected} />
      </div>
    );
  },

  current: function() {
    var state = _.clone(this.state),
        lines = lib.current();

    _.each(['length', 'played', 'bitrate'], function(key, n) {
        state[key] = lines[n]
    });

    state.bitrate += " kbps"

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
                arts: lib.loadArts()
              });
          },
          p: function() {
            var cmd = lib.isPaused() ? 'play' : 'pause';
            lib.ctrlPlay(cmd)
            self.setState({pause: cmd == 'pause'});
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

    state.selArt = art;
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
    lib.save(0, art);
  },

  match(input, opt) {
    return _.startsWith(_.toLower(opt), _.toLower(input));
  },

  playNext: function(state) {
    var state = _.clone(this.state),
        next = state.albNum + 1;

    if (next < state.albs.length)
      this.playAlbum(
        path.join(state.arts[state.art], state.albs[next]), state
      );
  },

  playAlbum: function(alb, state, num) {
    if (!num)
      num = 0;

    state.art = state.selArt;
    state.trackNum = num;
    state.tracks = lib.loadTracks(alb);
    state.track = path.basename(state.tracks[num]);
    state.alb = path.basename(alb);
    state.albNum = _.indexOf(state.albs, state.alb);
    state.sel = false;

    this.setState(state);
    lib.stop();
    this.playTrack(state.tracks[num], num);
    // track passed due to slow state update
    lib.save(1, alb);
  },

  selectAlbum(alb) {
    var state = _.clone(this.state);
    this.playAlbum(path.join(state.arts[state.selArt], alb), state);
  },


  playTrack: function(track, num) {
    if (!track) {
      if (!num)
        num = this.state.trackNum + 1;

      if (num < this.state.tracks.length)
        track = this.state.tracks[num];
      else {
        this.playNext();
        return;
      }
    }

    lib.play(track, this.playTrack);
    this.setState({trackNum: num, track: path.basename(track)});
    lib.save(2, num);
  },

  jump: function(num) {
    lib.stop()
    this.playTrack(this.state.tracks[num], num);
    // track and num can't be passed via state
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
