const { fork } = require('child_process');
const path = require('path');
const JSONfn = require('json-fn');

class RegexTest {
  constructor(options = {}) {
    this.timeout = options.timeout || 1000;
    this.workerLocation = path.join(__dirname, 'worker.js');

    this.queue = [];
    this.isTesting = false;
    this.worker = null;

    process.on('exit', () => this.cleanWorker());

    this.createWorker();
  }

  createWorker() {
    this.worker = fork(this.workerLocation);
  }

  destroyWorker() {
    if (this.worker) {
      this.worker.kill();
    }
  }

  recreateWorker() {
    this.destroyWorker();
    this.createWorker();
  }

  addToQueue(regex, input, resolve, reject) {
    const testRequest = {
      regex: new RegExp(regex),
      input: input.toString(),
      resolve,
      reject,
    };

    this.queue.push(testRequest);
  }

  test(regex, input) {
    return new Promise((resolve, reject) => {
      this.addToQueue(regex, input, resolve, reject);

      if (!this.isTesting) {
        this.testFromQueue();
      }
    });
  }

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

  cleanWorker() {
    if (this.worker) {
      this.destroyWorker();
      this.worker = null;
    }
  }
}

module.exports = RegexTest;
