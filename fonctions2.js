var ecranEnLecture= new Object();

function createDate() {
	var now= new Date();
	var today=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"T00:00:00";
	return today;
}

function createStartDate() {
	var now= new Date();
	var hour = now.getHours(); 
	var minute = now.getMinutes();
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; }	
	
	var startDate=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"T"+hour+":"+minute+":00";

	return startDate;
}

function createEndDate() {
	var now= new Date();
	var later=addMinutes(now,30);
	var hour = later.getHours(); 
	var minute = later.getMinutes();
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; }	
	
	var startDate=later.getFullYear()+"-"+(later.getMonth()+1)+"-"+later.getDate()+"T"+hour+":"+minute+":00";

	return EndDate;
}

var jsonToSend={
"date":createDate(),
"startDate":createStartDate(),
"endDate":createEndDate(),
"fields":[
{
"displayName":"Qui",
"value":"écran",
"key":"Champ1"
},{
"displayName":"Organisateur",
"value":"écran",
"key":"Champ2"
},{
"displayName":"Téléphone",
"value":null,
"key":"Champ3"
},{
"displayName":"Objet",
"value":"-- Salle réservée via écran --",
"key":"Champ6"
},{
"displayName":"Commentaire",
"value":null,
"key":"Champ7"
},{
"displayName":"Disposition",
"value":"disposition courante",
"key":"Champ8"
},{
"displayName":"Nb participants",
"value":"0",
"key":"Champ9"
}],
"status":0,
"owner":"écran",
"creator":"écran",
"EID":"040000008200E00074C7783",
"resource":{
"id":158,
"displayName":"Salle Lazare",
"url":"resources/158"
}
};


function sendRes(){

	console.log(jsonToSend);

	//jsonToSend.date="2013-04-02T13:00:00";
	//jsonToSend.startDate="2013-04-02T13:00:00";
	//jsonToSend.endDate="2013-04-02T15:00:00";
	

	$.ajax({
	type: "POST",
	url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token="+ecranEnLecture.validToken,
	data: jsonToSend
	}).done(function( msg ) {
	alert( "Data Saved: " + msg );
	});

}

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
				//sendRes();
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
				allRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "capacity":objJson[i].capacity};
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
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "capacity":objJson[i].capacity};
				j++;}
			else if (objJson[i].location.id==89) {
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName,"capacity":objJson[i].capacity};
				j++;}
			i++;
			
		}
	}

	catch(e){
	console.log(e);
	getRoomList();
	}
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
			ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity);
	}
	for (j=0;j<busyRooms.length;j++){
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id );
	}
	
	$('#listes-salles-libres').on('click', 'li', function() {
		getNameFreeRoomDisplayed($(this).text());
	});
	$('#listes-salles-occupees').on('click', 'li', function() {
        getNameBusyRoomDisplayed($(this).text()); 
    }); 
}

// Interface graphique En JQuery Mobile
function ajouterSalleLibre(nomSalle, idSalle, capacite){
var ligne=[];
ligne.push('<li class="une-salle-libre">');
ligne.push('<a class="libre" data-transition="flow"  data-ajax="false" href="details-salle-libre.html?resource='+idSalle+'">'+nomSalle);
ligne.push('<p>Libre jusqu\'à ...</p>');
ligne.push('<span class="ui-li-count">'+capacite+" places"+'</span></a></li>');
$("#listes-salles-libres").append(ligne.join(''));
$("li.une-salle-libre:odd").css({'background':'#d7f0db'});
$("li.une-salle-libre:odd").mouseover(function() {
	$(this).css('background','#C2D8C5');
});
$("li.une-salle-libre:odd").mouseout(function() {
	$(this).css('background','#d7f0db');
});
$("a:even").css('color','#5e8894');
$('#listes-salles-libres').listview('refresh');
}

function ajouterSalleOccupee(nomSalle, idSalle){
$("#listes-salles-occupees").append('<li class="une-salle-occupee"><a class="occupee" data-transition="flow"  data-ajax="false" href="details-salle-occupee.html?resource='+idSalle+'">'+nomSalle+'</a></li>');
$("li.une-salle-occupee:odd").css('background','#fad2d3');
$("li.une-salle-occupee:odd").mouseover(function() {
	$(this).css('background','#E1BDBE');
});
$("li.une-salle-occupee:odd").mouseout(function() {
	$(this).css('background','#fad2d3');
});
$("a:even").css('color','#5e8894');
$('ul').listview('refresh');
}

//Fin Interface graphique
// Evenements sur les cliques des listes
function getNameFreeRoomDisplayed(salle){
	ecranEnLecture.nomSalle=salle;
}
function setNameFreeRoomDisplayed(){
	$("#nom-salle").html(ecranEnLecture.nomSalle);
}
function getNameBusyRoomDisplayed(salle){
	ecranEnLecture.nomSalle=salle;
}
function setNameBusyRoomDisplayed(){
	$("#nom-salle").html(ecranEnLecture.nomSalle);
}
