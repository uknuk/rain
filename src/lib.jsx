var lib = exports,
    cproc = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    path = require('path'),
    React = require('react');

lib.isStart = function() {
  try {
    cproc.execSync('pgrep audacious');
    return false
  }
  catch (err) {
    cproc.exec('audacious -h &');
    return true;
  }
};

lib.audtool = function(cmd) {
  return cproc.execSync('audtool ' + cmd).toString();
};

lib.isPaused = function() {
  return this.audtool('playback-status') == 'paused\n'
};

lib.current = function() {
  var cmd = '%filename %length %output-length %bitrate-kbps'
      .replace(/%/g, 'current-song-');
  return this.audtool(cmd).split(/\n/);
};

lib.jump = function(n) {
  lib.audtool('playlist-jump ' + n);
};

lib.sort = function(albs) {
  return _.sortBy(albs, function(alb) {
    var year, added, re = /^\d{2}[\s+|_|-]/;
    if (alb.substr(0,2) == 'M0')
      return alb.replace('M0', '200');
    year = alb.match(re);
    if (year) {
      added = year[0].substr(0,2) < 30 ? '20' + alb : '19' + alb;
      return added;
    }
    // works until 2030
    return alb;
  });
};

lib.isArtdir = function(state, dir) {
  return  _.includes(_.values(state.arts), dir);
}

lib.strip = function(name) {
  return path.basename(name, path.extname(name));
};


lib.fill = function(state, key, rest) {
  var name = path.basename(rest),
      keys = key + 's';

  if ((key == 'art' && !lib.isArtdir(state, rest)) ||
      (key == 'alb' && state['alb'] === lib.strip(state['track'])))
    return;
  // album is file

  rest = path.dirname(rest);

  if (state[key] != name && !state.sel) {
    state[key] = name;
    if (key != 'art') {
      // album is file
      if (key == 'track' && lib.isArtdir(state, rest))
        return path.join(rest, lib.strip(name));

      if (!state[keys] &&  !state.sel)
        state[keys] = fs.readdirSync(rest);

      state[key + 'Num'] = _.indexOf(state[keys], name);
    }
  }
  return rest;
}

lib.load = function() {
  var buf = fs.readFileSync(path.join(process.env['HOME'],'.nwaud'), 'utf8'),
      roots = buf.replace(/\n+/,'').split(/\s+/);

  return function() {
    var arts = {};
    // add only new keys
    _.each(roots, function(dir, n) {
      if (dir.length > 0)
        _.each(fs.readdirSync(dir), function(name) {
          arts[name] = path.join(dir, name)
        });
    });
    return arts;
  };
}();

lib.play = function(files, alb) {
  var ext = /\.mp3$|\.mp4a$|\.mpc$|\.ogg$/,
      tracks = _.filter(files, function(file) {
        return ext.test(file);
      });

  lib.audtool('playlist-clear');

  _.each(tracks, function(track) {
    var cmd = "playlist-addurl \"";
    if (alb)
      cmd += alb + "/";
    cmd += track + "\"";
    lib.audtool(cmd);
  });

  lib.audtool('playback-play');
};


lib.Info = function(props) {
  return (
    <div>
      {
        _.map(props.fields, function(key, n) {
          return (
            <span key={n} className={key}>
            {(props.state[key] || '') + ' '}
            </span>
          )
        })
       }
            <p></p>
    </div>
  );
}

lib.Tracks = function(props) {
  var state = props.state;

  if (state.sel || !state.tracks)
    return null;

  return (
    <div>
      {
        _.map(state.tracks, function(track, n) {
          return (
            <lib.Button key={n}
            type = {n == props.state.trackNum ? "current" : "track"}
            name={track} limit="50"
            onClick = {_.partial(lib.jump, n + 1) }
            />
          )
        })
       }
            <p></p>
    </div>
  );
}

lib.Albums = function(props) {
  var state = props.state;

  if (!state.albs || !state.showAlbs || !state.art)
    return null;

  return (
    <div className="albs">
      <p></p>
      {path.basename(state.art) + ': '}
      {
        _.map(state.albs, function(alb, n) {
          var val = path.join(state.arts[state.art], alb);
          return (
            <lib.Button key={n}
            type = {n == state.albNum && !state.sel ? "current" : "alb"}
            name={alb} limit="40"
            onClick = {_.partial(props.onClick, val)}
            />
          )
        })
       }
            <p></p>
    </div>
  );
}

lib.Artists = function(props) {
  if (!props.sel)
    return null;

  return (
    <div>
      {
        _.map(props.arts.sort(), function(art, n) {
          return (
            <lib.Button key={n} type="art"
            name={art} limit="20"
            onClick = { _.partial(props.onClick, art)}
            />
          )
        })
       }
    </div>
  );
}

lib.Button = function(props) {
  return (
    <button onClick={props.onClick} className={props.type} >
      {lib.strip(props.name).substring(0, props.limit)}
    </button>
  );
};




