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
        [art, alb, num] = lib.loadLast();

    window.addEventListener("keypress", this.keyhandler(), true);

    if (lib.isLinux)
      this.timer = setInterval(this.current, 1000);

    if (num) {
      var albs = lib.sort(fs.readdirSync(arts[art])),
          state = {
            arts: arts,
            selArt: art,
            selAlbs: albs,
            albNum: _.indexOf(albs, alb)
          };

      this.playAlbum(path.join(arts[art], alb), _.clone(this.state), parseInt(num));
      this.setState(state);
      }
  },


  render: function() {
    var search = this.state.sel && !this.state.showAlbs;
    return (
      <div>
        <comp.Info display={!search} fields={this.fields} state={this.state} />
        <comp.Tracks state={this.state} onClick={this.jump}/>
        <comp.Albums state={this.state} onClick={this.selectAlbum} />
        {search ? <input type='search' onChange={this.filter} autoFocus /> : null}
        <comp.Artists display={search} arts={this.state.chosen || _.keys(this.state.arts)} onClick={this.selected} />
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
              self.setState({
                sel: false,
                selArt: null,
                selAlbs: null,
                showAlbs: true
              });
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

  selected: function(newArt) {
    var state = _.clone(this.state),
        artdir = state.arts[newArt];

    state.selArt = newArt;
    state.showAlbs = true;
    state.selAlbs = lib.sort(fs.readdirSync(artdir));
    var nodirs = _.every(state.selAlbs, function(alb) {
      return fs.statSync(path.join(artdir, alb)).isFile()
    });
    // check if albs has at least one directory(album)

    // if not, play it art is also album
    if (nodirs) {
      this.playAlbum(artdir, state);
    }
    else if (state.selAlbs.length == 1)
      this.playAlbum(path.join(artdir, state.selAlbs[0]), state);

    this.setState(state);
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
    state.albs = state.selAlbs;
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
    lib.saveData([state.art, state.alb, num]);
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
    if (this.state.art)
      lib.saveData([this.state.art, this.state.alb, num]);
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
