export class GlobalAccumulator {
    private acc: any = {};
    constructor() {
    }

    get_min_for_day(day: string) {
        return this.acc[day].min?.temp ? this.acc[day].min.temp : null;
    }
    get_max_for_day(day: string) {
        return this.acc[day].max?.temp ? this.acc[day].max.temp : null;
    }
    add_city_to_min(day: string, city_name: string) {
        this.acc[day]['min']['cities'].push(city_name);
    }
    add_city_to_max(day: string, city_name: string) {
        this.acc[day]['max']['cities'].push(city_name);
    }

    replace_max_and_related_city(day: string, city_name: string, candidate_max: number) {
        this.acc[day]['max']['temp'] = candidate_max;
        this.acc[day]['max']['cities'] = [city_name];
    }
    replace_min_and_related_city(day: string, city_name: string, candidate_min: number) {
        this.acc[day]['min']['temp'] = candidate_min;
        this.acc[day]['min']['cities'] = [city_name];
    }
    update_day(day: string, city_name: string, min_max_obj: any) {

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