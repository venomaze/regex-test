# regex-test

⌛ Safely test strings against any regex with a timeout.

## Installation

**npm**:

```
npm install regex-test
```

**yarn**:

```
yarn add regex-test
```

**GitHub**:

```
git clone https://github.com/venomaze/regex-test.git
```

## Usage

First create a new instance:

```javascript
const RegexTest = require('regex-test');

const regex = new RegexTest({
  timeout: 500, // ms
  safeRegexOnly: true,
});
```

Then you can use the `test` method this way:

```javascript
const pattern = /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))$/;

regex
  .test(pattern, 'test@mail.com')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));

regex
  .test(pattern, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')
  .then(res => console.log(res))
  .catch(err => console.log(err.message));
```

## Options

The options are:

- **timeout**: The timeout for regular expression tests in milliseconds. (Default to 1000)
- **safeRegexOnly**: If true, throw an error if the regex is potentially catastrophic exponential-time. (Default to false)
