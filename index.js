// Script executé coté serveur
import express from "express";
import fs from "fs";
import Papa from "papaparse";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.locals.basedir = "./public";
app.set("view engine", "pug");

const fileDir = "files/";
var datas = [];

//Lecture du dossier contenant les csv
fs.readdir(fileDir, (err, tabFile) => {
  if (err) console.log(err);
  else {
    //Lecture de chaque fichier csv
    tabFile.forEach((fileName) => {
      let file = fs.createReadStream(fileDir + fileName);
      Papa.parse(file, {
        header: true,
        worker: true,
        complete: (results) => {
          datas.push(results.data);
        },
      });
    });
  }
});
//Routage
app.get("/", function (req, res) {
  res.render("index");
});
app.get("/data", function (req, res) {
  res.send(datas);
});
app.listen(port);
