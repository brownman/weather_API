const config = require('../config/config.json');
const node_fetch = require('node-fetch');
const fs = require('fs');

const storage_dir = ".//storage";

config.cities_name.forEach(async (city_name: string) => {
    console.log(`Creating storage for ${city_name}`);
    const url = config.api.replace("{city_name}", city_name).replace("{API_key}", config.API_key);
    const res = await node_fetch(url).then((data: any) => { return data.json(); });
    fs.writeFileSync(`${storage_dir}/${city_name}.json`, JSON.stringify(res, null, 4));
})