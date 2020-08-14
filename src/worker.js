const JSONfn = require('json-fn');

process.on('message', request => {
  const { regex, input } = JSONfn.parse(request);
  const result = regex.test(input);

  process.send(result);
});
