const Filter = require('bad-words');
const filter = new Filter();

text = "hello fucker nigger"

if (filter.isProfane(text)) {
    const setFormValue = filter.clean(text);
    console.log(setFormValue)
}

