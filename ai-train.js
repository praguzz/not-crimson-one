const {NlpManager} = require('node-nlp');

const manager = new NlpManager({languages: ['en']});

(async () => {
    manager.addNamedEntityText('places', 'city', ['en'], ['Taipei', 'Tainan', 'Taichung', 'Taitung', 'Kaohsiung', 'Hsinchu', 'Taoyuan', 'Chiayi'])

    manager.addDocument('en', 'How is the weather in %place%', 'weather.search');
    manager.addDocument('en', 'Weather in %place%', 'weather.search');
    manager.addDocument('en', '%place%\'s weather', 'weather.search');
    manager.addDocument('en', 'Do i have to bring umbrella to %place%?', 'weather.search');

    await manager.train();
    manager.save();
    const response = await manager.process('en', 'How is the weather in Tainan');
    console.log(JSON.stringify(response));
})();