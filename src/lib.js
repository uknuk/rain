var lib = exports,
		cproc = require('child_process');
    
lib.execute =  function(cmd, callback) {
  if (!callback)
	  callback = function() {};
  cproc.exec(cmd, function(error, stdout, stderr) {
    callback(stdout);
  });
};

lib.audtool = function(cmd, callback) {
    this.execute('audtool ' + cmd, callback);
};

    
