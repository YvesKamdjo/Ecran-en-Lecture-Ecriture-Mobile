var ecranEnLecture= new Object();
var refresh=false;

function setIdentification(log, pass){
	ecranEnLecture.login=log;
	ecranEnLecture.password=pass;
}

function getDocumentReady(){
	$(document).ready(function() {
		
		//getUrbaToken();
	});
}

 function getUrbaToken(){
	try{
	$.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+ecranEnLecture.login+'&password='+ecranEnLecture.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidToken',			
	})
	}
	catch(e){
	console.log(error);

	}	
}
// teste de git extension{}

function setValidToken(newToken){
	try { 
	ecranEnLecture.validToken= newToken.Token;
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}
	//console.log(newToken.Token);
	getRoomList();
	
}

function getRoomList(){
	try{
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?Token='+ecranEnLecture.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomList',		
		})
		}
	catch(e){
	console.log(e);
	getRoomList();
	}
}

function fillRoomList(objJson) {
	//console.log(objJson);
	try {
		var i=0;
		var j=0;
		var allRoomList = [];
		while (objJson[i]){
			if (objJson[i].location.id==85) {
				allRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			else if (objJson[i].location.id==89) {
				allRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			i++;
			
		}
	}

	catch(e){
	console.log(e);
	getRoomList();
	}
}

// Interface graphique En JQuery

function creerListeSallesLibres(){
var creation=[];
creation[0]='<ul id="listes-salles-libres" data-role="listview" data-inset="true" data-divider-theme="d">';
creation[1]='<li data-role="list-divider" id="salles-libres">Salles Libres</li></ul>';
$('#container').append(creation.join(''));
}
function creerListeSallesOccupees(){
var creation=[];
creation[0]='<ul id="listes-salles-occupees" data-role="listview" data-inset="true" data-divider-theme="d">';
creation[1]='<li data-role="list-divider" id="salles-occupees">Salles Occupées</li></ul>';
$('#container').append(creation.join(''));
}

function ajouterSalleLibre(nomSalle){
$("#listes-salles-libres").append('<li><div id="col"></div> <a class="libre" href="#">'+nomSalle+'</a></li></div>');
$("a.libre").css('color','green');
}

function ajouterSalleOccupee(nomSalle){
$("#listes-salles-occupees").append('<li class="une-salle-occupee"><a class="occupee" href="#">'+nomSalle+'</a></li>');
$("a.occupee").css('color','red');
}
//Fin Interface graphique
