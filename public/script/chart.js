// Script executé coté client
var MyChart = null
async function FetchData (){  //Récupère les données contenu sur /data
    const response = await fetch('/data')
    return await response.text()
}
function ShowData(arrayDatas){  //Affiche les données sous forme de Diagramme en barres stackées
  let context = document.getElementById('chart').getContext('2d')
  let arrayPaidEntries = []
  let arrayFreeEntries = []
  let arrayYears = []
  //Trier le tableau de données par années croissantes
  arrayDatas.sort((a,b) => {return a[0] - b[0]})
  //Séparer les données dans 3 tableaux
  arrayDatas.forEach(data => {
    arrayYears.push(data[0])
    arrayPaidEntries.push(data[1])
    arrayFreeEntries.push(data[2])
  })
  //Construction du JSON de config
  const config = {
    type: 'bar',
    data: {
      labels: arrayYears,
      datasets: [{
        label: 'gratuites',
        data: arrayFreeEntries,
        stack: 'Stack',
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        borderColor: 'rgba(255, 0, 0,1)',
        borderWidth: 1
    },
    {
      label: 'payantes',
      data: arrayPaidEntries,
      stack: 'Stack',
      backgroundColor: 'rgba(0, 0, 255, 0.3)',
      borderColor: 'rgba(0, 0, 255, 1)',
      borderWidth: 1
    }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Fréquentation des musées de France'
        },
      },
      responsive: true,
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      }
    }
  }
  //Création ou Mise à jour du Canvas
  if(MyChart == null){
    MyChart = new Chart(context, config)
  }
  else{
    MyChart.data = {
      labels: arrayYears,
      datasets: [{
        label: 'gratuites',
        data: arrayFreeEntries,
        stack: 'Stack',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderColor: 'rgba(255, 0, 0,1)',
        borderWidth: 1
    },
    {
      label: 'payantes',
      data: arrayPaidEntries,
      stack: 'Stack',
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      borderColor: 'rgba(0, 0, 255, 1)',
      borderWidth: 1
    }]
    }
    MyChart.update()
  }
}
async function ProcessDataByYear(){ //Traite les données pour avoir le total d'entrée par an
  //Formate les données en JSON
  const content = '{"data":'+ await FetchData() + "}"
  let arrayDatas = []
  let json
  let paidEntries
  let freeEntries
  let year
  //Récupération de la somme des entrées payantes et gratuites par année
  json = JSON.parse(content)
  json.data.forEach(data => {
      paidEntries = 0
      freeEntries = 0
      data.forEach(museum =>{
          paidEntries += parseInt(museum.stats.split(";")[0].split(":")[1]) //Entrée payantes
          freeEntries += parseInt(museum.stats.split(";")[1].split(":")[1]) //Entrée gratuites
      })
      year = data[0].year //Récupère la date sur les stats du premier musée
      arrayDatas.push([year,paidEntries,freeEntries])
  })
  ShowData(arrayDatas)
}
function EmptyCombo(ID){  //Vide le selecteur avec l'ID passé en paramètre
  let select = document.getElementById(ID)
  let length = select.options.length
  for (i = length-1; i >= 0; i--){
    select.options[i] = null
  }
}
async function FillCombo(){ //Rempli le selecteur contenant les musées
  //Formate les données en JSON
  const content = '{"data":'+ await FetchData() + "}"
  let select = document.getElementById("Musee")
  let json
  let opt
  let arrayID = []
  let arrayName = []
  //Récupère le nom et l'id de tous les musées contenus dans le premier csv lu
  //Axe d'amélioration : récupérer ceux tout les csv de manière unique
  json = JSON.parse(content)
  json.data[0].forEach(museum => {
    arrayID.push(museum.id)
    arrayName.push(museum.name)
  })
  //Ajout des option au selecteur
  //(1 option pour guider l'utilisateur puis la liste des musées)
  opt = document.createElement("option")
  opt.textContent = "----- Veuillez choisir une option -----"
  select.appendChild(opt)
  for(let i = 0; i < arrayName.length; i++) {
    opt = document.createElement("option")
    opt.textContent = arrayName[i]
    opt.value = arrayID[i]
    select.appendChild(opt)
  }
}
async function Redirect(valeur){ //Fonction appelée au choix d'un nouvel affichage
  EmptyCombo("Musee")
  switch(valeur){
    case "year" :
      await ProcessDataByYear()
      break
    case "museum" :
      ShowData([])
      await FillCombo()
      break
    default :
      ShowData([])
  }
}
async function ChooseMuseum(ID){ //Fonction appelée au choix d'un musée
  //Formate les données en JSON
  const content = '{"data":'+ await FetchData() + "}"
  let json
  let arrayDatas = []
  //Récupérer les données du musée avec l'ID passé en paramètre
  json = JSON.parse(content)
  json.data.forEach(year => {
    year.forEach(museum => {
      if(museum.id == ID){
        arrayDatas.push([
          museum.year,
          museum.stats.split(';')[0].split(':')[1], //Entrées payantes
          museum.stats.split(';')[1].split(':')[1]]) //Entrées gratuites
      }
    })
  })
  ShowData(arrayDatas)
}
ProcessDataByYear()