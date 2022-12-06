const express= require("express");
const { render } = require("express/lib/response");
const path = require("path")
const sqlite3= require("sqlite3").verbose();

const app = express();
app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }));

/* Connecting to database */
const db_name= path.join(__dirname, "database", "appdb.db")
const db = new sqlite3.Database(db_name, err => {
    if(err){
        return console.error(err.message);
    }
    console.log("Success connecting to database")
})
/* Creating Speakers table */
db.serialize(function() {
const sql_create_speakers_tbl = `CREATE TABLE IF NOT EXISTS Speakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    about VARCHAR(100) NOT NULL,
    workplace VARCHAR(100) NOT NULL
  
  );`;
  db.run(sql_create_speakers_tbl, err => {
      if(err){
          return console.error(err.message)
      }
      console.log("successful creation of speakers table")
  });

  /* Seeding speakers table */
  const sql_insert = `INSERT INTO Speakers (id, name, title, about, workplace) VALUES
  (1, 'John Kennedy', 'Web development', 'John is a web developer at microsoft for 12 years', 'Microsoft'),
  (2, 'Johnstone Colombus', 'Environment Conservation', 'John has been a UN advocate for the past 6  years', 'United Nations'),
  (3, 'Kirk Byers', 'Health and Exrecise', 'Kirk is a professional football player', 'FC Football');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
  });
})


/* Port listening */
app.listen(5000, ()=> {
    console.log("server started at port 5000")
})


/* Fetching all speakers data */
app.get("/", (req, res) =>{
    const fetch_speakers= "SELECT * FROM Speakers ORDER BY id"
    db.all(fetch_speakers, [], (err,rows) => {
        if(err){
            return console.error(err.message)

        }
        res.render("speakers", {model: rows})

    })

    app.get("/api/speakers/:id", (req, res) =>{
        const id= req.params.id;
        const findspeakerbyid="SELECT * FROM Speakers WHERE id=?";
        db.get(findspeakerbyid, id,(err,row)=>{
            if(err){
                console.error(err.message)
            }
            res.render("speaker", {model: row})

        });

    })
    app.get("/speakers/edit/:id", (req, res) =>{
        const id= req.params.id;
        const findspeakerbyid="SELECT * FROM Speakers WHERE id=?";
        db.get(findspeakerbyid, id,(err,row)=>{
            if(err){
                console.error(err.message)
            }
            res.render("edit_speaker", {model: row})

        });

    })
    /* Update records */
    app.post("/speakers/edit/:id", (req, res) => {
        const id = req.params.id;
        const speaker = [req.body.name, req.body.title, req.body.about,req.body.workplace, id];
        const sql = "UPDATE Speakers SET name = ?, title = ?, about = ?, workplace = ? WHERE (id = ?)";
        db.run(sql, speaker, err => {
          // if (err) ...
          res.redirect(`/${id}`);
        });
      });
/* Adding new speaker */      
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
  });
  /*  Posting data from create speaker screen */
  app.post("/create", (req, res) => {
    const sql = "INSERT INTO Speakers (name, title, workplace, about) VALUES (?, ?, ?,?)";
    const speaker = [req.body.name, req.body.title, req.body.workplace, req.body.about];
    db.run(sql, speaker, err => {
      // if (err) ...
      res.redirect("/");
    });
  });
  /*  Delete speaker */
  app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Speakers WHERE id = ?";
    db.run(sql, id, err => {
      // if (err) ...
      res.redirect("/");
    });
  });



   
})