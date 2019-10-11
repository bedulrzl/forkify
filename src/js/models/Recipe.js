import axios from 'axios';
import {key, proxy} from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe(){
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res.data);
            console.log(this.title);
        } catch(error) {
            console.log(error);
        }
    }

    calcTime(){
        const numImg = this.ingredients.length;
        const periods = Math.ceil(numImg / 3);
        this.time = periods * 15;
        console.log(this.time);
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoons', 'ounce', 'teaspoon', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            })
            // remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //parse ingredients into count, unit and ingtedient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //there is unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-','+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if(parseInt(arrIng[0], 10)) {
                //there no unit, but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1)                
                }
            } else if(unitIndex === -1) {
                //there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        //servings
        const newServings =  type === 'dec' ? this.servings - 1 : this.servings + 1;

        //ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }

}