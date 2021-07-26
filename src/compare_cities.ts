



const path = require('path')
var fs = require('fs');
const fsPromises = require('fs').promises;

import Utils from '../lib/utils';
const config = require('../config/config.json');
type CityTemperature = { city: string, temp: number }
type TemperatureMinMax = { min: CityTemperature, max: CityTemperature }
const fixtures_dir = path.resolve(`${__dirname}/../test/fixtures`);
type Accumulator = Map<string, TemperatureMinMax>;

class CompareCities {

    constructor(cities: string[]) {
        let five_days_accumulator = new Map();
        console.log("weather of " + cities);
        cities.forEach(async (city_name) => {
            console.log("weather of " + city_name);

            let data = await this.load_data(city_name).catch((err: any) => { throw err; });
            data = JSON.parse(data);

            // const max_temp = this.get_max_temp(city_name, data, five_days_accumulator);
            // console.log(
            //     city_name, max_temp
            // );

            const rain_data = this.get_rain(data);
            console.log(
                city_name, rain_data
            );
        })
    }
    get_max_temp(city_name: string, data: any, five_days_accumulator: Map<any, any>) {
        throw new Error('Method not implemented.');
    }

    load_data(city_name: string) {
        return fsPromises.readFile(`${fixtures_dir}/${city_name}.json`, 'utf8');
    }

    get_rain(data: any) {
        //todo: check if valid object
        if (!Utils.isObjectWithData(data)) { throw new Error("invalid input"); }
        const res = data.list.filter((item: any) => { return Utils.isObjectWithData(item.rain); })
        return Utils.isObjectWithData(res);
    }


}

function Test() {
    const c1 = new CompareCities(config.cities_name);
}


Test();

