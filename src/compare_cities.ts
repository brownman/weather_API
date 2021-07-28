



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

    async process_data_for_each_city(): Promise<any> {

        let daily_min_max_temp_by_city = {};
        let list_rain_info = {};


        let promises = this.cities.map(city_name => {
            return this.load_data(city_name).catch(err => { throw new Error(err); });
        })
        const cities_data = await Promise.all(promises).catch(err => { throw new Error(err); });
        cities_data.forEach(cityData => {
            cityData = JSON.parse(cityData);

            const city_name = cityData.city?.name; //todo: must be nicer syntax
            if (!city_name) { throw new Error("city_name is not defined"); }

            if (cityData.hasOwnProperty('list') && Array.isArray(cityData.list)) {
                daily_min_max_temp_by_city[city_name] = get_minmax_temp_for_city(cityData.list, city_name);
                list_rain_info[city_name] = get_rain_info(cityData.list);
            } else {
                throw new Error("city.list data is not an array");
            }

        });
        return { daily_min_max_temp_by_city, list_rain_info };
    }



    async steps(): Promise<any> {
        const res_process_data_for_each_city: any = await this.process_data_for_each_city().catch((err) => { return Promise.reject(err) });
        const { daily_min_max_temp_by_city, list_rain_info } = res_process_data_for_each_city as any;
        const res_global_accumulator = update_global_minMax(daily_min_max_temp_by_city);

        return { res_global_accumulator, list_rain_info };
    }
}



