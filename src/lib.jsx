var lib = exports,
		cproc = require('child_process'),
    path = require('path'),
    React = require('react');
    
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

    
lib.Button = function(props) {
  return (
    <button
            style={{ color: props.color, fontSize: '12px' }}
            onClick={props.fun}
            >
      {props.name.replace(path.extname(props.name),'').substring(0, props.limit)}
    </button>
  );
};


lib.execAsync = (require('bluebird')).promisify(cproc.exec);

      

    
