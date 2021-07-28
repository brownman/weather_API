import { CompareCities } from "./compare_cities";
const config = require('../config/config.json');

async function Test() {
    const c1 = new CompareCities(config.cities_name, `${__dirname}/../storage`);
    const { res_global_accumulator, list_rain_info } = await c1.steps();

    console.log('___5 days forecast:___')
    console.log('>> print the min/max temperature among the given cities for each day (the min/max temperature is tagged with its host city)');
    console.log(JSON.stringify(res_global_accumulator, null, 2));
    console.log("\n");
    console.log('>> print if rain is predicted for each city:');
    console.log(list_rain_info);
}

Test();