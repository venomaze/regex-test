process.on('message', request => {
  const { regex, input } = request;
  const result = regex.test(input);

  process.send(result);
});
