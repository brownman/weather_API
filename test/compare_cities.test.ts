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
                        "dt_txt": "2021-08-30 12:00:00",
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
                            "max_temp": 302

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
        let output_cities_res: any = {};

        const update_accumulator_min_max_temperature = (output_cities_res: any, day: string, item: any, city_name: string) => {

            //init new object struct;
            //todo: find a better typescript alternative 
            if (!output_cities_res[day]) {
                output_cities_res[day] = {
                    "min": {
                        temp: null,
                        cities: []
                    },
                    "max": {
                        temp: null,
                        cities: []
                    }
                };
                console.log({ output_cities_res })
            }
            //check min
            const current_min = output_cities_res[day].min?.temp ? output_cities_res[day].min.temp : null;


            const current_max = output_cities_res[day].max?.temp ? output_cities_res[day].max.temp : null;

            const candidate_min = item.main['min_temp'];
            const candidate_max = item.main['max_temp'];

            if (current_min === candidate_min) {
                output_cities_res[day]['min']['cities'].push(city_name);    //update min if candidate is lower or equal      
            } else if (candidate_min < current_min || !current_min) {
                output_cities_res[day]['min']['temp'] = candidate_min;      //   if current min temp is not yet exist or higher - replace it with the candidate.
                output_cities_res[day]['min']['cities'] = [city_name];
            }

            //update max if candidate is higher or equal
            if (current_max === candidate_max) {
                output_cities_res[day]['max']['cities'].push(city_name);
            } else if (candidate_max > current_max || !current_max) {
                //replace 
                output_cities_res[day]['max']['temp'] = candidate_max;
                output_cities_res[day]['max']['cities'] = [city_name];
            }
            return output_cities_res;
        }

        for (const [city_name, cityData] of Object.entries(input_cities) as any) {
            cityData.list.forEach((item: any) => {
                console.log(item);
                //split data 
                const day_of_year = item.dt_txt.split(' ')[0];
                update_accumulator_min_max_temperature(output_cities_res, day_of_year, item, city_name);

            })
        }
        const expected_results = { "2021-07-30": { "max": { "cities": ["jerusalem"], "temp": 300 }, "min": { "cities": ["tveria"], "temp": 9 } }, "2021-08-30": { "max": { "cities": ["new-york", "tveria"], "temp": 302 }, "min": { "cities": ["jerusalem"], "temp": 96 } } };
        expect(output_cities_res).toEqual(expected_results);
    });
});