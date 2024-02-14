import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(express.static('public'));

app.get("/", async (req, res) => {
    // Get count of monsters from API, generate a random number within range of count, and request monster using random number as index
    const allMonsters = await axios.get("https://www.dnd5eapi.co/api/monsters");
    const monsterCount = allMonsters.data.count;
    const monsterRandom = Math.floor(Math.random()*(monsterCount + 1));
    const monsterIndex = allMonsters.data.results[monsterRandom].index
    console.log(monsterIndex)
    const monster = await axios.get(`https://www.dnd5eapi.co/api/monsters/${monsterIndex}`)
    const data = monster.data;
    const profs = data.proficiencies;
    //Create stat block object so index.ejs can run a for loop to display stats
    const stats = { 
        STR : data.strength,
        DEX : data.dexterity,
        CON : data.constitution,
        INT : data.intelligence,
        WIS : data.wisdom,
        CHA : data.charisma
    }

    //Create Speed array and convert to string
    var speedArray = []
    for( var i in data.speed ) {
        speedArray.push(`${data.speed[i]} ${i}`);
    }
    var speed = speedArray.toString().replaceAll(",", ", ");
    

    //Create Saving Throw array from proficiencies and convert to string
    var savingThrowsArray = []
    for (var i in profs) {
        if (profs[i].proficiency.name.slice(0,12) === "Saving Throw") {
            savingThrowsArray.push(`${profs[i].proficiency.name[14]}${profs[i].proficiency.name.slice(15).toLowerCase()} +${profs[i].value}`)
        }
    }
    var savingThrows = savingThrowsArray.toString().replaceAll(",", ", ");
    
    //Create Skills array from proficiencies and convert to string
    var skillsArray = []
    for (var i in profs) {
        if (profs[i].proficiency.name.slice(0,5) === "Skill") {
            skillsArray.push(`${profs[i].proficiency.name.slice(7)} +${profs[i].value}`)
        }
    }
    var skills = skillsArray.toString().replaceAll(",", ", ");

    //Creates Senses array and convert to string
    var sensesArray = []
    for (var key in data.senses) {
        sensesArray.push(`${key} ${data.senses[key]} `)
    }
    var senses = sensesArray.toString().replaceAll(",", ", ").replaceAll("_", " ");

    //Render template
    res.render("index.ejs", { 
        data : data,
        stats: stats,
        savingThrows: savingThrows,
        skills : skills,
        speed: speed,
        senses: senses
    })
})

app.listen(port, () => {
    console.log("Listening on port", port)
})