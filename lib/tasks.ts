import { GlobalAccumulator } from "./globalAccumulator";
//stages: 
//1 - get_minmax_temp_for_city:store data per city - for each day - save min temperature and max temperature
//2 - compare all cities' data stored at stage 1 and find the min/max temperature for each day - and tag the temperature's city (it's source).
//3 - get_rain_info - returns: is forcast indicates rain

import Utils from "./utils";

export const get_rain_info = (list): boolean => {
    const res = list.filter((item: any) => { return Utils.isObjectWithData(item["rain"]); })
    const rain_data = Utils.isObjectWithData(res);
    return rain_data;
}

export const update_global_minMax = (output_cities_res: any) => {
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


export const get_minmax_temp_for_city = (list: any, city_name: string) => {

    const item_ops = {
        get_item_day: (item) => {
            return item["dt_txt"].split(' ')[0];
        },
        get_item_min: (item) => {
            return item["main"]["temp_min"];
        },
        get_item_max: (item) => {
            return item["main"]["temp_max"];
        }
    }

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
    const res = minMax(list);
    return res;
}
