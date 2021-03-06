'use strict'

const path = require('path');
var fs = require('fs');




import { get_minmax_temp_for_city, get_rain_info, update_global_minMax } from '../lib/tasks';
import { CompareCities } from "../src/compare_cities";



describe('extract relevant fields from data', () => {
    let output_cities, input_cities, input_will_rain;
    let daily_min_max_temp_by_city: any;
    let output_cities_res: any;


    beforeAll(() => {
        daily_min_max_temp_by_city = {};

        const input_cities_json = path.resolve(`${__dirname}/fixtures/input_cities.json`)
        input_cities = require(input_cities_json);

        const input_will_rain_json = path.resolve(`${__dirname}/fixtures/will_rain.json`)
        input_will_rain = require(input_will_rain_json);
    })


    it('store min/max temperature per day for each city', () => {
        const expected_daily_min_max_temp_by_city = { "jerusalem": { "2021-07-30": { "max": 301, "min": 96 } }, "new-york": { "2021-07-30": { "max": 299, "min": 99 }, "2021-08-30": { "max": 303, "min": 98 } }, "tveria": { "2021-07-30": { "max": 299, "min": 9 }, "2021-08-30": { "max": 302, "min": 98 } } };

        for (const [city_name, cityData] of Object.entries(input_cities) as any) {
            daily_min_max_temp_by_city[city_name] = get_minmax_temp_for_city(cityData.list, city_name);
        }
        expect(daily_min_max_temp_by_city).toEqual(expected_daily_min_max_temp_by_city);
    });

    it('compare between cities - store min/max temperature per day tagged by city', () => {
        const res = update_global_minMax(daily_min_max_temp_by_city);
        const expected_global_res = { "acc": { "2021-07-30": { "max": { "cities": ["jerusalem"], "temp": 301 }, "min": { "cities": ["tveria"], "temp": 9 } }, "2021-08-30": { "max": { "cities": ["new-york"], "temp": 303 }, "min": { "cities": ["new-york", "tveria"], "temp": 98 } } } };
        expect(res).toEqual(expected_global_res);
    });

    it('city forcast includes rain', () => {
        const res_rain = get_rain_info(input_will_rain.list);
        const expected_rain: boolean = true;
        expect(res_rain).toEqual(true);
    });

    it('check integration - run all steps using a class', async (done) => {
        const compareCities = new CompareCities(["Jerusalem", "New York"], `${__dirname}/fixtures/cities`);
        const res = await compareCities.steps().catch(err => { done(err) });
        const expected_res = { "list_rain_info": { "Jerusalem": false, "New York": true }, "res_global_accumulator": { "acc": { "2021-07-27": { "max": { "cities": ["New York"], "temp": 305.43 }, "min": { "cities": ["Jerusalem"], "temp": 294.86 } }, "2021-07-28": { "max": { "cities": ["Jerusalem"], "temp": 303.51 }, "min": { "cities": ["Jerusalem"], "temp": 293.32 } }, "2021-07-29": { "max": { "cities": ["Jerusalem"], "temp": 304.43 }, "min": { "cities": ["Jerusalem"], "temp": 293.2 } }, "2021-07-30": { "max": { "cities": ["Jerusalem"], "temp": 305.61 }, "min": { "cities": ["Jerusalem"], "temp": 293.73 } }, "2021-07-31": { "max": { "cities": ["Jerusalem"], "temp": 306.54 }, "min": { "cities": ["New York"], "temp": 293.4 } }, "2021-08-01": { "max": { "cities": ["Jerusalem"], "temp": 307.05 }, "min": { "cities": ["New York"], "temp": 294.88 } } } } };

        expect(res).toEqual(expected_res);
        done();
    });
});