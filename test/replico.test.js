/* jshint undef: false, unused: false */

var replico = (process.env.COVERAGE ? require('../lib-cov/replico.js') : require('../lib/replico.js'));
var expect = require('expect.js');
var join   = require('path').join;


function fixp(filename) {
  return join(__dirname, '/fixtures', filename);
}

describe('replico', function(){
  it('should be tested ...')
})
