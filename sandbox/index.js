const RegexTest = require('../src');

const regex = new RegexTest({
  validateRegex: true,
});
const pattern = /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))$/;

regex
  .test(pattern, 'test@mail.com')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));

regex
  .test(pattern, 'mail.com')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));

regex
  .test(pattern, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));

regex
  .test(pattern, 'test@mail.com')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));
