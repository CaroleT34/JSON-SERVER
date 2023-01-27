document.addEventListener("DOMContentLoaded", init);
var url = 'http://localhost:3000/receipes';
let receipes=[];

/* Generator ID */
const uniqId = (() => {
    let i = 0;
    return () => {
        return i++;
    }
})();

/*
* Fonction qui charge les recettes et appelle la fonction afficherResultat pour
* construire le tableau HTML des receipes
*/
function init(){
    fetch(url)
    .then(res=>res.json())
    .then(json=>afficherResultat(json))
    .catch(e=>{
        let affichage = document.querySelector("#affichage");
        affichage.innerHTML="<h2>Impossible de récupérer les résultats</h2> : " + e;
    });
}

/*
* Construit le tableau HTML des recettes avec en paramètre le JSON retourné par le serveur
*/
 function afficherResultat(res){
    receipes=res;
    let html = '';
    for (receipe of receipes) {
        html += '<div class="card receipesCard col-12 col-md-4 col-lg-3">';
            html += '<img src="https://assets.afcdn.com/story/20230110/2205979_w944h530c1cx1097cy684cxt0cyt0cxb2194cyb1367.webp" class="card-img-top">';
            html += '<div class="card-body mx-auto">'
                html += '<div class="d-flex justify-content-around my-3">';
                    html += '<h5 class="card-title col" id="titleReceipe">'+receipe.name+'</h5>';
                    html+= "<span class='mx-2'><i class='fas fa-lg fa-user text-primary'></i></span>";
                    html += '<p class="card-text col-2"> x '+receipe.nb_part+'</p>';
                html += '</div>';
                html += '<p class="card-text">'+receipe.description+'</p>';
                html += '<div class="d-flex justify-content-center">';
                    html+= "<span class='mx-4'><i class='fas fa-lg fa-trash text-danger' onclick=\"deleteReceipe('"+receipe.id+"')\"></i></span>";
                    html+= "<span class='mx-4'><i class='fas fa-lg fa-pencil text-success' onclick=\"editReceipe('"+receipe.id+"')\"></i></span>";
                html += '</div>';
            html += '</div>';
            html += '<div class="card-body mx-auto">'
                html += '<h6 class="card-title">Ingrédients :</h6>';
                for (r of receipe.ingredients) {
                    html+= "<span>" + r.quantity + " " + r.unit + " de " + r.name +" </span></br>";
                }
                html += '<div class="d-flex justify-content-center my-3"><a href="'+receipe.link+'" class="btn btn-primary">Regarder la vidéo</a></div>';
            html += '</div>';
        html += '</div>';
    }
    
    let affichage = document.querySelector("#affichage");
    affichage.innerHTML=html;
}

/*
* Traiter le formulaire et envoyer une nouvelle citation vers le serveur
*/
function validerMessage(){
    let id = uniqId;
    let name = document.querySelector("#name").value;
    let nb_part = document.querySelector("#nb_part").value;
    let description = document.querySelector("#description").value;
    let link = document.querySelector("#link").value;
    let ingredient= [];
    let nombreIngredient = $("#nombreIngredient").val();
    for (let index = 1; index <= nombreIngredient; index++) {
        if (index !== nombreIngredient) {
            ingredient.push({
                "name" :  document.querySelector("#ingName_" + index).value,
                "quantity" : document.querySelector("#quantity_"+ index).value,
                "unit" : document.querySelector("#unit_"+ index).value,
            },)
        } else {
            ingredient.push({
                "name" :  document.querySelector("#ingName_" + index).value,
                "quantity" : document.querySelector("#quantity_"+ index).value,
                "unit" : document.querySelector("#unit_"+ index).value,
            }) 
        }
    }
    
    let objet = {
        "id": id,
        "name": name,
        "nb_part": nb_part,
        "description" : description,
        "link" : link,
        "ingredients": ingredient,
    }
    callServeur(url, objet, 'POST');
}

/*
* Formulaire dynamique pour permettre de saisir le nombre d'ingrédients suohaités 
*/
function ajouterIngredient(){
   let nombreIngredient = $("#nombreIngredient").val();
   let affichage;
   if (is_int(nombreIngredient) === false) {
    affichage = document.querySelector("#errorInput");
    affichage.innerHTML="Merci de saisir un nombre entier";
   } else if (is_int(nombreIngredient) === true) {
    let html= '<div class="row mt-2">';
        for (let index = 1; index <= nombreIngredient; index++) {
            html+= '<div class="my-auto">';
                html+='<h3 class="h6">Ingrédient '+ index +' :</h3>';
            html+= '</div>';
            html+= '<div class="my-auto">';
                html+='<input class="form-control" type="text" id="ingName_'+ index +'" placeholder="Nom">';
                html+= '<input class="form-control" type="text" id="quantity_'+ index +'"" placeholder="Quantité">';
                html+= '<input class="form-control" type="text" id="unit_'+ index +'"" placeholder="Unité de mesure">';
            html+= '</div>';
        }
    html+= '</div>';

    affichage = document.querySelector("#ingredients");
    affichage.innerHTML=html;
   }
}

function editReceipe(id) {
    $('#titleAjoutCard').html('Modifier une recette');
    $('#updateButtons').css('display', 'flex');
    $('#postButton').css('display', 'none');

    $('#name').val(receipes[id]["name"]);
    $('#nb_part').val(receipes[id]["nb_part"]);
    $('#description').val(receipes[id]["description"]);
    $('#link').val(receipes[id]["link"]);

    let ingredient= receipes[id]["ingredients"];
    $('#nombreIngredient').val(ingredient.length);
    console.log(ingredient.length);
    ajouterIngredient(ingredient.length);
    let count =1;
    for (let index = 0; index < ingredient.length; index++) {
        console.log(receipes[id].ingredients[index]);
        $('#ingName_'+ count).val(receipes[id].ingredients[index]['name']);
        $('#quantity_'+ count).val(receipes[id].ingredients[index]['quantity']);
        $('#unit_'+ count).val(receipes[id].ingredients[index]['unit']);

        count++;
    }
}

function cancelUpdate() {
    $('#titleAjoutCard').html('Ajouter une nouvelle recette');
    $('#updateButtons').css('display', 'none');
    $('#postButton').css('display', 'flex');
    $('.formEdit').val('');
    $('#nombreIngredient').val(0);
    $('#ingredients').css('display', 'none');
}

function deleteReceipe(id) {
    for (receipe of receipes){
        if (receipe.id==id){
          if (window.confirm("Voulez-vous supprimer la recette de "+receipe.name+" ?")) {
            callServeur(url + '/' + id, receipe, 'DELETE');
          }
        }
    }
}
/*
* Méthode générique d'appel du serveur et qui provoque et rafraichissement du tableau des citations
*/
function callServeur(url, objet, method) {
    const requestOptions = {
        "method": method,
        "headers": { 'Content-Type': 'application/json' },
        "body": JSON.stringify(objet)
    };
    fetch(url, requestOptions)
    .then(response => response.json())
    .then(dataJson => init());
}


/* CONTROLE DE SAISIE */

/**Vérifier que la valeur attendue est bien un entier */
function is_int(value){
    if((parseFloat(value) == parseInt(value)) && !isNaN(value)){ 
        return true;
    } else {
        return false;
    }
}