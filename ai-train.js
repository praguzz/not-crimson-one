const {NlpManager} = require('node-nlp');

const manager = new NlpManager({languages: ['en']});

(async () => {
    // manager.addNamedEntityText('places', 'city', ['en'], ['Taipei', 'Tainan', 'Taichung', 'Taitung', 'Kaohsiung', 'Hsinchu', 'Taoyuan', 'Chiayi'])
    const cityEntity = manager.addTrimEntity("city");
    cityEntity.addAfterLastCondition('en', 'in');
    cityEntity.addAfterLastCondition('en', 'to');
    // cityEntity.addBeforeFirstCondition('en', '\'s');

    manager.slotManager.addSlot('places', 'city', true, {en: "Which city?"});

    manager.addDocument('en', 'How is the weather in %place%', 'weather.search');
    manager.addDocument('en', 'Weather in %place%', 'weather.search');
    manager.addDocument('en', '%place%\'s weather', 'weather.search');
    manager.addDocument('en', 'Do i have to bring umbrella to %place%?', 'weather.search');

    await manager.train();
    manager.save();
    const response = await manager.process('en', 'Weather in Taipei');
    // console.log(JSON.stringify(response));
    console.log(JSON.stringify(response.entities?.[0].sourceText));
})();