



const path = require('path')
var fs = require('fs');
const fsPromises = require('fs').promises;

import Utils from '../lib/utils';
const config = require('../config/config.json');
type CityTemperature = { city: string, temp: number }
type TemperatureMinMax = { min: CityTemperature, max: CityTemperature }
type Accumulator = Map<string, TemperatureMinMax>;
import { get_minmax_temp_for_city, get_rain_info, update_global_minMax } from '../lib/tasks';

export class CompareCities {
    private cities: string[];
    path_storage: string;

    constructor(cities: string[], path_storage: string) {
        this.path_storage = path_storage;
        console.log("weather of cities: " + cities);
        this.cities = cities;
    }

    load_data(city_name: string) {
        const storage_dir = path.resolve(this.path_storage);

        return fsPromises.readFile(`${storage_dir}/${city_name}.json`, 'utf8');
    }
    process_data_for_each_city(): Promise<any> {
        let cityData; //load each json file in serial order, keeping memmory consumption low

        let daily_min_max_temp_by_city = {};
        let list_rain_info = {};

        //resolve when is done
        let counter = 0;
        return new Promise(async (resolve, reject) => {
            for (let city_name of this.cities) {
                cityData = await this.load_data(city_name).catch(err => { return reject(err); });
                if (!cityData) {
                    return reject("empty file for city:" + city_name);
                }
                counter++;
                console.log(counter + " of " + this.cities.length + " cities processed");

                cityData = JSON.parse(cityData);

                if (cityData.hasOwnProperty('list') && Array.isArray(cityData.list)) {
                    daily_min_max_temp_by_city[city_name] = get_minmax_temp_for_city(cityData.list, city_name);
                    list_rain_info[city_name] = get_rain_info(cityData.list);
                } else {
                    return reject("city.list data is not an array");
                }
                if (counter === this.cities.length) {
                    console.log(JSON.stringify(daily_min_max_temp_by_city, null, 4));

                    return resolve([daily_min_max_temp_by_city, list_rain_info]);
                }
            }
        });
    }

    async steps(): Promise<any> {
        //
        const res_process_data_for_each_city: any = await this.process_data_for_each_city().catch((err) => { console.log(err); process.exit(1); });
        const [daily_min_max_temp_by_city, list_rain_info] = res_process_data_for_each_city as any;

        const res_global_accumulator = update_global_minMax(daily_min_max_temp_by_city);
        // console.log(daily_min_max_temp_by_city);
        console.log(JSON.stringify(res_global_accumulator, null, 4));
        console.log(list_rain_info);
        return { res_global_accumulator, daily_min_max_temp_by_city, list_rain_info };
    }
}

async function Test() {
    const c1 = new CompareCities(config.cities_name, `${__dirname}/../storage`);
    const res = await c1.steps();
    console.log(res);
}


Test();

