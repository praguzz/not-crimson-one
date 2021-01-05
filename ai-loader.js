const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });
manager.load('./model.nlp');

module.exports = manager;