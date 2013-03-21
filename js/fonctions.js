var ecranEnLecture= new Object();
var refresh=false;
var freeRoomList = [];
var busyRoomList=[];
var objetJSON= new Object();

function setIdentification(log, pass){
	ecranEnLecture.login=log;
	ecranEnLecture.password=pass;
}

function getDocumentReady(){
					$(document).ready(function() {
						getUrbaToken();
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
	getRoomList();
	
}

function getRoomList(){
	try{
	$.ajax({
			'url' : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?Token='+ecranEnLecture.validToken,
			'dataType' : 'jsonp',
			'jsonpCallback': 'fillRoomList',		
		})
		}
	catch(e){
	console.log(e);
	getRoomList();
	}
}

function fillRoomList(objJson) {
	console.log(objJson);
	try {
		var i=0;
		var j=0;
		var k=0;
		while (objJson[i]){
			if (objJson[i].location.id==85) {
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			else if (objJson[i].location.id==89) {
				busyRoomList[k]={"id":objJson[i].id, "name":objJson[i].displayName};
				k++;}
			i++;
			
		}
	}

	catch(e){
	console.log(e);
	getRoomList();
	}
	afficheSallesLibres();
	afficheSallesOccupees();
}
// Interface graphique En JQuery Mobile
function ajouterSalleLibre(nomSalle){
$("#listes-salles-libres").append('<li><div id="col"></div> <a class="libre" href="#">'+nomSalle+'</a></li></div>');
$("a.libre").css('color','green');
$('ul').listview('refresh');
}

function ajouterSalleOccupee(nomSalle){
$("#listes-salles-occupees").append('<li class="une-salle-occupee"><a class="occupee" href="#">'+nomSalle+'</a></li>');
$("a.occupee").css('color','red');
$('ul').listview('refresh');
}
function afficheSallesLibres(){
$.each(freeRoomList, function(key, value) {
ajouterSalleLibre(value.name);
});
}
function afficheSallesOccupees(){
$.each(busyRoomList, function(key, value) {
ajouterSalleOccupee(value.name);
});
}
//Fin Interface graphique
