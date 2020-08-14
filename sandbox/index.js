const RegexTest = require('../src');

const regex = new RegexTest();

regex
  .test(/o$/, 'hello')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));

regex
  .test(/(a+)*$/, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));
