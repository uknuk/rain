var lib = exports,
		cproc = require('child_process'),
    path = require('path');
    
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
    <button key={this.props.key}
            style={{ color: this.props.color, fontSize: '12px' }}
            onClick={this.props.fun}
            >
      {this.shorten(this.props.name, this.props.limit)}
    </button>
  );
};

lib.shorten = function(name, limit) {
  // to do: word border matching
  return name.replace(p.extname(name),'').substring(0, limit);
};

lib.execAsync = (require('bluebird')).promisify(cproc.exec);

      

    
