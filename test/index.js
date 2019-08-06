/* eslint-env mocha */
const chai = require('chai');
const { pipe, concat } = require('mississippi');
const sinon = require('sinon');
const through = require('through2');
const vfs = require('vinyl-fs');

const { reduce, reduceFiles } = require('../lib/utils.js');

// Mixin event-related assertions.
chai.use(require('chai-events'));

const expect = chai.expect;

describe('reduce', () => {
  it('returns a through stream', () => {
    expect(reduce(sinon.stub())).to.be.instanceOf(through().constructor);
  });

  it('should emit a single data event when the stream is processed', () => {
    const reducer = reduce(sinon.stub(), {});
    return expect(vfs.src('./test/src/data/**/*').pipe(reducer)).to.emit('data');
  });

  it('should call the passed reduce function for each stream object', done => {
    const fake = sinon.fake((acc, data) => {
      acc[data.relative] = data;
      return acc;
    });
    function assert() {
      expect(fake.calledThrice).to.be.true;
      done();
    }

    pipe(
      [vfs.src('./test/src/data/**/*'), reduce(fake, {}), concat()],
      assert,
    );
  });
});

describe('reduceFiles', () => {
  it('should return a promise', () => {
    expect(reduceFiles('./test/src/pages/**/*', sinon.stub())).to.be.instanceOf(Promise);
  });

  it('should resolve to reduced files', async () => {
    const files = await reduceFiles('./test/src/pages/**/*', (acc, data) => [...acc, data], []);
    expect(files).to.be.instanceOf(Array);
  });
});
