'use strict'


let DaySettings = {
    "min": {
        temp: null,
        cities: []
    },
    "max": {
        temp: null,
        cities: []
    }
};
class GlobalAccumulator {
    private acc: any = {};
    constructor() {
    }

    get_min_for_day(day) {
        return this.acc[day].min?.temp ? this.acc[day].min.temp : null;
    }
    get_max_for_day(day) {
        return this.acc[day].max?.temp ? this.acc[day].max.temp : null;
    }
    add_city_to_min(day, city_name) {
        this.acc[day]['min']['cities'].push(city_name);
    }
    add_city_to_max(day, city_name) {
        this.acc[day]['max']['cities'].push(city_name);
    }

    replace_max_and_related_city(day, city_name, candidate_max) {
        this.acc[day]['max']['temp'] = candidate_max;
        this.acc[day]['max']['cities'] = [city_name];
    }
    replace_min_and_related_city(day, city_name, candidate_min) {
        this.acc[day]['min']['temp'] = candidate_min;
        this.acc[day]['min']['cities'] = [city_name];
    }
    update_day(day, city_name, min_max_obj) {

        //case: adding a new day property
        if (!this.acc[day]) {
            this.acc[day] = {
                "min": {
                    temp: min_max_obj.min,
                    cities: [city_name]
                },
                "max": {
                    temp: min_max_obj.max,
                    cities: [city_name]
                }
            };
        } else {
            //update based on comparison
            const current_min = this.get_min_for_day(day);
            const current_max = this.get_max_for_day(day);

            const candidate_min = min_max_obj.min;
            const candidate_max = min_max_obj.max;

            //update min if candidate is lower or equal 
            if (current_min === candidate_min) {
                this.add_city_to_min(day, city_name);
            } else if (candidate_min < current_min || !current_min) {
                this.replace_min_and_related_city(day, city_name, candidate_min);
            }

            //update max if candidate is higher or equal
            if (current_max === candidate_max) {
                this.add_city_to_max(day, city_name);
            } else if (candidate_max > current_max || !current_max) {
                this.replace_max_and_related_city(day, city_name, candidate_max);
            }
        }
    } //method
}//class

describe('extract relevant fields from data', () => {
    let output_cities, input_cities;

    beforeAll(() => {
        input_cities =
        {
            "jerusalem": {
                list: [
                    {
                        "dt_txt": "2021-07-30 12:00:00",
                        "main": {
                            "min_temp": 100,
                            "max_temp": 300
                        },
                    }, {
                        "dt_txt": "2021-07-30 12:00:00",
                        "main": {
                            "min_temp": 96,
                            "max_temp": 301
                        }
                    }
                ]
            }//city
            ,
            "new-york": {
                list: [
                    {
                        "dt_txt": "2021-07-30 12:00:00",
                        "main": {
                            "min_temp": 99,
                            "max_temp": 299
                        },
                    }, {
                        "dt_txt": "2021-08-30 12:00:00",
                        "main": {
                            "min_temp": 98,
                            "max_temp": 303

                        }
                    }
                ]
            },

            "tveria": {
                list: [
                    {
                        "dt_txt": "2021-07-30 11:00:00",
                        "main": {
                            "min_temp": 9,
                            "max_temp": 299
                        },
                    }, {
                        "dt_txt": "2021-08-30 12:00:00",
                        "main": {
                            "min_temp": 98,
                            "max_temp": 302

                        }
                    }
                ]
            }
            //city
        }//cities



        output_cities = {
            "2021-07-30": {
                "min": {
                    temp: null,
                    city: []
                },
                "max": {
                    temp: null,
                    city: []
                }
            },
            "2021-08-30": {
                "min": {
                    temp: null,
                    cities: []
                },
                "max": {
                    temp: null,
                    cities: []
                }
            }
        }
    })

    it('accumulate min/max temperature tagged by city name and segmented by day of year', () => {
        let output_cities_res: any = null;
        // let res;
        const item_ops = {
            get_item_day: (item) => {
                return item["dt_txt"].split(' ')[0];
            },
            get_item_min: (item) => {
                return item["main"]["min_temp"];
            },
            get_item_max: (item) => {
                return item["main"]["max_temp"];
            }
        }

        const update_global_minMax = (output_cities_res: any) => {
            const globalAccumulator = new GlobalAccumulator();
            let acc_output_cities_res: any = {};

            Object.keys(output_cities_res).forEach((city_name: string) => {
                Object.keys(output_cities_res[city_name]).forEach((day: string) => {
                    const min_max_obj = output_cities_res[city_name][day];
                    globalAccumulator.update_day(day, city_name, min_max_obj);
                });
            });
            return globalAccumulator;
        }


        const get_minmax_temp_for_city = (list: any) => {
            function minMax(items) {
                return items.reduce((acc, item) => {

                    const val_min: number = item_ops.get_item_min(item);
                    const val_max: number = item_ops.get_item_max(item);
                    const day_of_year: string = item_ops.get_item_day(item) as any;
                    const ref = acc[day_of_year];

                    //initial min,max entry for day
                    if (!ref) {
                        acc[day_of_year] = {
                            min: val_min,
                            max: val_max
                        };
                    } else {
                        ref["min"] = (ref["min"] === undefined || val_min < ref["min"]) ? val_min : ref["min"]
                        ref["max"] = (ref["max"] === undefined || val_max > ref["max"]) ? val_max : ref["max"]
                    }

                    return acc;
                }, {});
            }
            return minMax(list);
        }


        const daily_min_max_temp_by_city = {};
        const expected_daily_min_max_temp_by_city = { "jerusalem": { "2021-07-30": { "max": 301, "min": 96 } }, "new-york": { "2021-07-30": { "max": 299, "min": 99 }, "2021-08-30": { "max": 303, "min": 98 } }, "tveria": { "2021-07-30": { "max": 299, "min": 9 }, "2021-08-30": { "max": 302, "min": 98 } } };

        for (const [city_name, cityData] of Object.entries(input_cities) as any) {
            daily_min_max_temp_by_city[city_name] = get_minmax_temp_for_city(cityData.list);

        }
        const res = update_global_minMax(daily_min_max_temp_by_city);
        const expected_global_res = { "acc": { "2021-07-30": { "max": { "cities": ["jerusalem"], "temp": 301 }, "min": { "cities": ["tveria"], "temp": 9 } }, "2021-08-30": { "max": { "cities": ["new-york"], "temp": 303 }, "min": { "cities": ["new-york", "tveria"], "temp": 98 } } } };
        expect(res).toEqual(expected_global_res);
    });
});