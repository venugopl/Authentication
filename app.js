const express = require("express");
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path");
const bcrypt = require("bcrypt")

const dbPath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async ()=>{
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database;
        })
        app.listen(3000,()=>{
            console.log("Server Running at http://localhost/3000/")
        });
    }catch(error){
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    };
};
initializeDbAndServer();

const validatePassword = (password)=>{
    return password.length > 4;
};

app.post("/register", async (request,response)=>{
    const {username, name, password, gender, location} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const selectUserQuery = `
    SELECT 
    *
    FROM
    userData
    WHERE
    username = ${username};`;
    const dataBase = await db.get(selectUserQuery);

    if(dataBase === undefined){
        const createUserQuery = `
        INSERT INTO
        user (username, name, password, gender, location)
        VALUES
        (
            ${username},
            ${name},
            ${password},
            ${gender},
            ${location}
        );`;
        if(validatePassword(password)){
            await db.run(createUserQuery);
            response.send("User created successfully");
        }else{
            respond.send(400);
            respond.send("Password is too short");
        }else{
            response.send(400);
            response.send("User already exists");
        }
    };
});

app.get("/login", async (request,response) => {
    const { username, password } = request.body;
    const selectUserQuery = `
    SELECT * FROM user WHERE username = ${username}
    `;
    const database = await db.get(selectUserQuery);

    if(database === undefined){
        response.send(400);
        response.send("Invalid user");
    }else{
        const isPasswordMatch = await bcrypt.compare(
            password,
            database.password;
        );
        if(isPasswordMatch === true){
            response.send("Login Success!")
        }else{
            response.send(400);
            response.send("Invalid Password")
        };
    }
});

app.put("/change-password", async (request,response)=>{
    const {username, newPassword, oldPassword } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = ${username};`;
    const database = await db.get(selectUserQuery);

    if(database === undefined){
        response.send(400);
        response.send("Invalid User")
    }else{
        const isPasswordMatched = await bcrypt.compare(
            oldPassword,
            database.password;
        );
        if(isPasswordMatch === undefined){
            if(validatePassword(newPassword)){
                const hashedPassword = await bcrypt.hash(newPassword,10)
                const UpdatePasswordQuery = `
                UPDATE user SET ${hashedPassword} WHERE username = ${username}`;
                const user = await database.run(UpdatePasswordQuery);
                response.send("Password updated")
            }else{
                response.send(400);
                response.send("Password is too short")
            }else{
                response.send(400)
                response.send("Invalid current password")
            }
        }
    }
});
module.exports = app;