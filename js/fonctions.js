var ecranEnLecture= new Object();

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
		success: function(jsonp) { 
                getRoomList();
            }		
	})
	}
	catch(e){
	console.log(error);
	}	
}

function setValidToken(newToken){
	try { 
	ecranEnLecture.validToken= newToken.Token;
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}
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
	try {
		var i=0;
		var j=0;
		var allRoomList = [];
		while (objJson[i]){
			if ((objJson[i].location.id==85)||(objJson[i].location.id==89)) {
				allRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			i++;
			}
		}
	catch(e){
		console.log(e);
		getRoomList();
		}
	ecranEnLecture.roomList=allRoomList;
	getFreeRoomList();
}


function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function createDuration(){
	var now= new Date();
	var hour = now.getHours(); 
	var minute = now.getMinutes();
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; }
	
	var later=addMinutes(now,30);
	var hourBis = later.getHours(); 
	var minuteBis = later.getMinutes();
	if (hourBis < 10) { hourBis = "0" + hourBis; } 
	if (minuteBis < 10) { minuteBis = "0" + minuteBis; }	
	
	var nowUrba=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"T"+hour+":"+minute+":00";
	var laterUrba=later.getFullYear()+"-"+(later.getMonth()+1)+"-"+later.getDate()+"T"+hourBis+":"+minuteBis+":00";
	
	var duration=nowUrba+","+laterUrba;
	return duration;
}


function getFreeRoomList(){
	try{
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?free=between,'+createDuration()+'&Token='+ecranEnLecture.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillFreeRoomList',		
		})
		}
	catch(e){
	console.log(e);
	getRoomList();
	}
}

function fillFreeRoomList(objJson){
	try {
		var i=0;
		var j=0;
		var freeRoomList = [];
		while (objJson[i]){
			if (objJson[i].location.id==85) {
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			else if (objJson[i].location.id==89) {
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName};
				j++;}
			i++;
			
		}
	}

	catch(e){
	console.log(e);
	getRoomList();
	}
	console.log(freeRoomList);
	ecranEnLecture.freeRoomList=freeRoomList;
	compareRoomLists();

}

function compareRoomLists() {
	var allRooms=ecranEnLecture.roomList;
	var freeRooms=ecranEnLecture.freeRoomList;
	var i,j=0;
	for (i=0;i<freeRooms.length;i++) {
		for (j=0;j<allRooms.length;j++) {
			if (freeRooms[i].name==allRooms[j].name) {
			allRooms.splice(j,1);
			}
		}
	}
	splitRoomList(freeRooms, allRooms);
}


function splitRoomList(freeRooms, busyRooms) {

	for (i=0;i<freeRooms.length;i++){
			ajouterSalleLibre(freeRooms[i].name);
	}
	for (j=0;j<busyRooms.length;j++){
			ajouterSalleOccupee(busyRooms[j].name);
	}
	afficheSallesLibres();
	afficheSallesOccupees();
	$('#listes-salles-libres').on('click', 'li', function() {
       getNameFreeRoomDisplayed($(this).text()); 
    });
	$('#listes-salles-occupees').on('click', 'li', function() {
       getNameBusyRoomDisplayed($(this).text()); 
    });
	
}

// Interface graphique En JQuery Mobile
function ajouterSalleLibre(nomSalle){
$("#listes-salles-libres").append('<li class="une-salle-libre"><a class="libre" data-transition="flow" href="details-salle-libre.html">'+nomSalle+'</a></li></div>');
$("a.libre").css('color','green');
$('ul').listview('refresh');
}

function ajouterSalleOccupee(nomSalle){
$("#listes-salles-occupees").append('<li class="une-salle-occupee"><a class="occupee" data-transition="flow" href="details-salle-occupee.html">'+nomSalle+'</a></li>');
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
// Evenements sur les cliques des listes
function getNameFreeRoomDisplayed(salle){
	ecranEnLecture.nomSalle=salle;
}
function setNameFreeRoomDisplayed(){
	$("#text-salle-libre").html("Salle "+ecranEnLecture.nomSalle);
}
function getNameBusyRoomDisplayed(salle){
	ecranEnLecture.nomSalle=salle;
}
function setNameBusyRoomDisplayed(){
	$("#text-salle-occupee").html("Salle "+ecranEnLecture.nomSalle);
}
