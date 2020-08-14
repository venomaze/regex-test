const { fork } = require('child_process');
const path = require('path');
const JSONfn = require('json-fn');

class RegexTest {
  /**
   * Create a queue and a worker
   * @constructor
   * @param {Object} [options] - Custom options object (optional)
   * @returns {void}
   */
  constructor(options = {}) {
    this.timeout = options.timeout || 1000;
    this.workerLocation = path.join(__dirname, 'worker.js');

    this.queue = [];
    this.isTesting = false;
    this.worker = null;

    process.on('exit', () => this.cleanWorker());

    this.createWorker();
  }

  /**
   * @property {Function} createWorker - Create a new worker
   * @access private
   * @returns {void}
   */
  createWorker() {
    this.worker = fork(this.workerLocation);
  }

  /**
   * @property {Function} destroyWorker - Kill the worker
   * @access private
   * @returns {void}
   */
  destroyWorker() {
    if (this.worker) {
      this.worker.kill();
    }
  }

  /**
   * @property {Function} recreateWorker - Kill the worker and create a new one
   * @access private
   * @returns {void}
   */
  recreateWorker() {
    this.destroyWorker();
    this.createWorker();
  }

  /**
   * @property {Function} addToQueue - Add a new test request to the queue
   * @param {RegExp} regex - Regex to test the string against it
   * @param {String} input - String to be tested against the regex
   * @param {Function} resolve - Promise resolve callback function
   * @param {Function} reject - Promise reject callback function
   * @access private
   * @returns {void}
   */
  addToQueue(regex, input, resolve, reject) {
    const testRequest = {
      regex: new RegExp(regex),
      input: input.toString(),
      resolve,
      reject,
    };

    this.queue.push(testRequest);
  }

  /**
   * @property {Function} test - Test a string against a regex
   * @param {RegExp} regex - Regex to test the string against it
   * @param {String} input - String to be tested against the regex
   * @returns {Promise} - A promise which will be resolved after getting the result
   */
  test(regex, input) {
    return new Promise((resolve, reject) => {
      this.addToQueue(regex, input, resolve, reject);

      if (!this.isTesting) {
        this.testFromQueue();
      }
    });
  }

  /**
   * @property {Function} testFromQueue - Get a test request from the queue and test it
   * @access private
   * @returns {(void|null)}
   */
  testFromQueue() {
    if (!this.queue.length) {
      this.cleanWorker();
      return null;
    }

    if (!this.worker) {
      this.createWorker();
    }

    let isTested = false;
    this.isTesting = true;
    const request = this.queue.shift();
    const { regex, input, resolve, reject } = request;

    const timeout = setTimeout(() => {
      if (!isTested) {
        isTested = true;
        this.isTesting = false;
        this.recreateWorker();

        const error = new Error('Test evaluation has passed the timeout.');

        reject(error);
        this.testFromQueue();
      }
    }, this.timeout);

    this.worker.send(JSONfn.stringify({ regex, input }));

    this.worker.once('message', result => {
      if (!isTested) {
        isTested = true;
        this.isTesting = false;
        clearTimeout(timeout);

        resolve(result);
        this.testFromQueue();
      }
    });
  }

  /**
   * @property {Function} cleanWorker - Destroy and remove the worker
   * @access private
   * @returns {void}
   */
  cleanWorker() {
    if (this.worker) {
      this.destroyWorker();
      this.worker = null;
    }
  }
}

module.exports = RegexTest;
