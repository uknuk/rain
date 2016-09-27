var lib = exports,
    cproc = require('child_process'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    React = require('react'),
    ext = /\.mp3$|\.mp4a$|\.mpc$|\.ogg$/;

lib.isLinux = process.env._system_type == 'linux';

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
  if (this.isLinux)
    return this.audtool('playback-status') == 'paused\n'
  else
    return cproc
      .execSync('ps -o state -p $(pgrep afplay)')
      .toString().split('\n')[1].startsWith('T');
};

lib.ctrlPlay = function(cmd) {
  if (this.isLinux)
    this.audtool('playback-' + cmd);
  else
    cproc.execSync(
      "pkill -" + (cmd == "pause" ? "SIGSTOP" : "SIGCONT") + " afplay"
    );
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
  var buf = fs.readFileSync(path.join(process.env['HOME'],'.mhdirs'), 'utf8'),
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

lib.tracks = function(alb) {
  return fs.statSync(alb).isFile() ? [alb] : this.loadAlbum(alb);
}

lib.loadAlbum = function(alb) {
  var sel = [],
      files = _.map(fs.readdirSync(alb), function(f) {
    return path.join(alb, f)
  });

  _.each(files, function(file) {
    if (fs.statSync(file).isFile()) {
      if (ext.test(file))
        sel.push(file);
    }
    else
      sel = sel.concat(lib.loadAlbum(file));
  });

  return sel;
}

lib.play = function(track, callback) {
  var cmd = this.isLinux ? "audacious -hqE '" : "afplay '";
  cproc.exec(cmd + track + "'", function(err, stdout, stderr) {
    if (!err)
      callback();
  });
}

lib.stop = function() {
  var cmd = this.isLinux ? 'audacious' : 'afplay';
  try {
    cproc.execSync("pkill " + cmd);
  }
  catch(e) {
    console.log(e);
  }
}






