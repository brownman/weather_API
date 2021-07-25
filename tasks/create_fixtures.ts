const config = require('../config/config.json');
const node_fetch = require('node-fetch');
const fs = require('fs');

const fixtures_dir = "./tests/fixtures";

config.cities_name.forEach(async (city_name: string) => {
    console.log(`Creating fixtures for ${city_name}`);
    const url = config.api.replace("{city_name}", city_name).replace("{API_key}", config.API_key);
    const res = await node_fetch(url).then((data: any) => { return data.json(); });
    // console.log(res);
    fs.writeFileSync(`${fixtures_dir}/${city_name}.json`, JSON.stringify(res, null, 4));
})