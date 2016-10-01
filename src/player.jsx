var React = require('react'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    lib = require('./lib.js'),
    comp = require('./components.jsx');

module.exports = React.createClass({
  fields: ['art', 'alb', 'track', 'bitrate'],

  fsrange: {
    tracks: {max: 2.5, min: 1.25},
    albs:   {max: 3, min: 1.5}
  },

  maxChars: 1600,

  getInitialState: function() {
    var state = {
      sel: false,
      showAlbs: true,
      pause: false,
      bitrate: '',
      played: null,
      length: null
    };

    _.each(this.fields, function(key) {
      state[key] = '';
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
      let albs = lib.sort(fs.readdirSync(arts[art])),
          state = {
            arts: arts,
            art: art,
            selArt: art,
            albs: albs,
            selAlbs: albs
          };

      this.setState(state, _.partial(this.playAlbum, alb, parseInt(num)));
    }
  },

  render: function() {
    var search = this.state.sel && !this.state.showAlbs,
        tracks = _.map(this.state.tracks, (tr) => lib.shortBase(tr)),
        albs = _.map(this.state.selAlbs || this.state.albs, (alb) => lib.shortBase(alb)),
        chars = _.map([tracks, albs], (ar) => _.sumBy(ar, (el) => el.length)),
        fsize = this.maxChars/(chars[0] + chars[1]),
        fsTracks = lib.fsize(fsize, this.fsrange.tracks),
        fsAlbs = lib.fsize(fsize, this.fsrange[chars[0] > chars[1] ? 'albs' : 'tracks']);

    return (
      <div>
        <comp.Info display={!search} fields={this.fields} state={this.state} />
        <comp.Tracks state={this.state} tracks={tracks} fsize={fsTracks} onClick={this.playTrack} />
        <comp.Albums state={this.state} albs={albs} fsize={fsAlbs} onClick={this.selectAlbum} />
        {search ? <input type='search' onChange={this.filter} autoFocus /> : null}
        <comp.Artists display={search}
                      arts={this.state.chosen || _.keys(this.state.arts)}
                      onClick={this.selectArt} />
      </div>
    );
  },

  keyhandler: function() {
    var self = this,
        fmap = {
          s: function() {
            if (self.state.sel)
              self.setState({
                sel: false,
                selArt: self.state.art,
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
          z: function() {
            var cmd = lib.isPaused() ? 'play' : 'pause';
            lib.ctrlPlay(cmd)
            self.setState({pause: cmd == 'pause'});
          },
          q: function() {
            lib.stop();
            global.nw.App.closeAllWindows();
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

  selectArt: function(art) {
    var play = null,
        artdir = this.state.arts[art],
        selAlbs = lib.sort(fs.readdirSync(artdir));

    var nodirs = _.every(selAlbs, (alb) =>
      fs.statSync(path.join(artdir, alb)).isFile()
    );  // check if albs has at least one directory(album)

    if (nodirs) // if not, play it art is also album
      play = _.partial(this.selectAlbum, artdir)
    else if (selAlbs.length == 1)
      play = _.partial(this.selectAlbum, path.join(artdir, selAlbs[0]));

    this.setState({
      selArt: art,
      selAlbs: selAlbs,
      showAlbs: true
    }, play)
  },

  selectAlbum(alb) {
    this.setState({
      sel: false,
      art: this.state.selArt,
      albs: this.state.selAlbs,
    }, _.partial(this.playAlbum, alb)
    );
  },

  playNextAlbum: function(state) {
    var next = this.state.albNum + 1;

    if (next < this.state.albs.length)
      this.playAlbum(this.state.albs[next]);
  },

  playAlbum: function(alb, num = 0) {
    var state = _.clone(this.state),
        albPath = path.join(state.arts[state.art], alb)

    state.alb = alb;
    state.albNum = _.indexOf(state.albs, state.alb);
    state.tracks = lib.loadTracks(albPath);
    this.setState(state, _.partial(this.playTrack, num));
  },

  playTrack: function(num) {
      if (_.isNil(num))
        num = this.state.trackNum + 1;

    if (num >= this.state.tracks.length) {
      this.playNextAlbum();
      return;
    }
    else {
      let track = this.state.tracks[num];
      lib.play(track, this.playTrack);
      this.setState({trackNum: num, track: path.basename(track)});
      if (this.state.art)
        lib.save([this.state.art, this.state.alb, num]);
    }
  },

  filter: function(ev) {
    var chosen = _.filter(_.keys(this.state.arts), function(art) {
          return _.startsWith(_.toLower(art), ev.target.value);
        });

    if (chosen.length == 1)
      this.selectArt(chosen[0]);

    this.setState({chosen: chosen});
  },

  current: function() {
    var state = _.clone(this.state),
        lines = lib.current();

    _.each(['length', 'played', 'bitrate'], function(key, n) {
      state[key] = lines[n]
    });

    state.bitrate += " kbps"

    this.setState(state);
  }

});
