var lib = exports,
    cproc = require('child_process'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    React = require('react'),
    ext = /\.mp3$|\.mp4a$|\.mpc$|\.ogg$/,
    lastFile = path.join(process.env['HOME'],'.rlast');

lib.isLinux = process.env._system_type != 'Darwin';

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
    this.audtool('playback-' + cmd)
  else
    cproc.execSync(
      "pkill -" + (cmd == "pause" ? "SIGSTOP" : "SIGCONT") + " afplay"
    );
};

lib.current = function() {
  var cmd = '%length %output-length %bitrate-kbps'
      .replace(/%/g, 'current-song-');
  return this.audtool(cmd).split(/\n/);
};

lib.sort = function(albs) {
  return _.sortBy(albs, function(alb) {
    var re = /^\d{2}[\s+|_|-]/;
    if (alb.substr(0,2) == 'M0')
      return alb.replace('M0', '200');

    var year = alb.match(re);
    if (year)
      return year[0].substr(0,2) < 30 ? '20' + alb : '19' + alb;
    // works until 2030

    return alb;
  });
};

lib.base = (name) => path.basename(name, path.extname(name));

lib.fsize = (size, range) => Math.max(Math.min(size, range.max), range.min) + "vw";

lib.cut = function(name, limit) {
  words = name.split(/\s+|\_+|\-+/),
  sizes = _.reduce(words, function(acc, w) {
    acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + w.length);
    return acc;
  }, [])
  return _.join(_.filter(words, (w, n) => sizes[n] < limit), " ");
};

lib.shortBase= (name, limit = 40) => lib.cut(lib.base(name), limit);

lib.short = (name, limit = 20) => name.substring(0, lib.cut(name, limit).length)

lib.loadArts = function() {
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

lib.loadTracks = function(alb) {
  return fs.statSync(alb).isFile() ? [alb] : this.loadAlbum(alb);
}

lib.loadAlbum = function(alb) {
  var sel = [],
      files = _.map(fs.readdirSync(alb), (f) => path.join(alb, f));

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
  var cmd = this.isLinux ? 'audacious -hqE "' : 'afplay "';
  lib.stop();
  cproc.exec(cmd + track + '"', function(err, stdout, stderr) {
    if (!err)
      callback();
  });
}

lib.stop = function() {
  var cmd = "pkill ",
      player = lib.isLinux ? "audacious" : "afplay";

  try {
    cproc.execSync(`pgrep ${player}`)
  }
  catch(e) {
    return;
  }

  if (lib.isLinux)
    cmd += "-SIGKILL ";
   // audacious needs SIGKILL to generate err in exec function

  try {
    cproc.execSync(cmd + player);
  }
  catch(e) {
    console.log(e);
  }
}

lib.loadLast = function() {
  try {
    return fs.readFileSync(lastFile, 'utf8').split(/\n/);
  }
  catch(e) {
    console.log("File .rlast not found");
    return [null, null, null];
  }
}

lib.save = function(data) {
  fs.writeFileSync(lastFile, data.join('\n'));
}

lib.seconds = function(time) {
  var ar = _.reverse(time.split(':'));
  return _.reduce(
    ar, (sum, val, n) => sum + val*Math.pow(60,n), 0
  );
}
