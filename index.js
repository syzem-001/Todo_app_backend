import express, { json, response } from "express";
import mysql from "mysql2/promise";
import { myConfig } from "./configDataBase.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())

let connection;

try {
  //test a kapcsolódásra connectionPool csaklétre hozza az obj-de nem kapcsolódik az adatbázishoz

  connection = mysql.createPool(myConfig);
  await connection.execute("select 1");
  console.log("sikeres kapcsolódás az adatbázishoz");

} catch (error) {
  console.log("ahhhhhh", error);
  process.exit(1); //leállítja a programot mert az alkalmalzás nem tudja megnyitni az adatbázist!!
}

app.get("/todos", async (rq, rs) => {
  try {
    const sql = `SELECT * FROM todolist ORDER BY timestamp;`;
    const [rows, fields] = await connection.execute(sql);
    console.log(rows, fields);
    rs.status(200).json(rows)

  } catch (error) {
    console.log(error);
  }
});

app.post("/todos",async (rq,rs) =>{
    const {task} = rq.body
    try {
        const sql = `INSERT into todolist (task) VALUES (?)`;
        await connection.execute(sql, [task]);
        rs.status(201).json({msg : "sikeres hozzáadás!"})

  } catch (error) {
    console.log(error);
  }
});

app.patch("/todos/:id", async (rq,rs)=>{
    const {id} = rq.params
    try {
        const sql = 'UPDATE todolist set complete=NOT complete WHERE id = ?'
        const [rows] = await connection.execute(sql,[id])
        console.log(rows)
        rs.status(200).json({msg : "Sikeresmódosítás!!"})

    } catch (error) {
        console.log(error)
    }
})

app.delete('/todos/:id', async (rq,rs) =>{
    const {id} = rq.params
    try {
       const sql = 'DELETE FROM `todolist` WHERE id = ?'
       const [row] = await connection.execute(sql,[id])
       rs.status(200).json({msg : "Sikeres Törlés!!"})
       console.log(row)
    } catch (error) {
        console.log(error);
        
    }
})

//bejelentkezes
app.post('/todos/login',(rq,rs) =>{
   const {username,password} = rq.body
   if(username == process.env.LOGIN_USER && password == process.env.LOGIN_PW){
     rs.json({success : true , msg : 'Sikeres bejelentkezés'})
   }
   else{
      rs.status(400).json({success : false , msg : 'Sikertelen bejelentkezés'})
   }

})


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server listening on port:${port}...`));
