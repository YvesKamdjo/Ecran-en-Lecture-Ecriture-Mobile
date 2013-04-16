var ecranEnLecture= new Object();
var blockedRoom=[];

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
function addRoomToDisplay(roomID){
blockedRoom.push(roomID);
}
function getRoomForDisplaying(){
var query= document.location.search;
console.log(document.location.search);
var tmp1;
var tmp=[];
tmp= query.split("=");
	if (tmp!=""){
		tmp1= tmp[1].split("=");
		tmp1=tmp1+"";
		console.log(tmp1);
		blockedRoom = tmp1.split("_");
		console.log(blockedRoom[0]);
	}
}
function fillRoomList(objJson) {
	console.log(objJson);
	//addRoomNotDisplay(654);
	//addRoomNotDisplay(655);
	
	try {
		var i=0;
		var j=0;
		var id;
		var allRoomList = [];
		while (objJson[i]){
			if ((objJson[i].location.id==85)||(objJson[i].location.id==89)) {
			id=objJson[i].id;
				allRoomList[j]={"id":id, "name":objJson[i].displayName, "capacity":objJson[i].capacity};
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
getRoomForDisplaying();
console.log(blockedRoom.length);
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
				freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "capacity":objJson[i].capacity};
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
	//
}


function splitRoomList(freeRooms, busyRooms) {
var tmp= blockedRoom.join(' ');
	for (i=0;i<freeRooms.length;i++){
			if (blockedRoom.length>0){
				console.log(blockedRoom[0]+" "+freeRooms[i].id+" "+tmp.indexOf(freeRooms[i].id));
				if (tmp.indexOf(freeRooms[i].id)!=-1){//if (jQuery.inArray(freeRooms[i].id,blockedRoom)!=-1){
			ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity);
			}
		}
		else
			ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity);
	}
	for (j=0;j<busyRooms.length;j++){
		if (blockedRoom.length>0){
			if (tmp.indexOf(freeRooms[j].id)!=-1){
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].capacity );
			}
		}
		else
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].capacity );
	}
	
	$('#listes-salles-libres').on('click', 'li', function() {
		getNameFreeRoomDisplayed($(this).text());
	});
	$('#listes-salles-occupees').on('click', 'li', function() {
        getNameBusyRoomDisplayed($(this).text()); 
    }); 
}

// Interface graphique En JQuery Mobile
function setHideParameters(ho,hp,hs){
ecranEnLecture.hideOw=ho;
ecranEnLecture.hidePh=hp;
ecranEnLecture.hideSub=hs;
}
function ajouterSalleLibre(nomSalle, idSalle, nBseats){
setHideParameters(false,true,true);
var html=[];
html.push('<li class="une-salle-libre" data-icon="custom_arrow">');
html.push('<a class="libre" data-transition="flow"  data-ajax="false" ');
html.push('href="screenFreebusyRoom.html?resource='+idSalle+'">');
//?hideOwner='+ecranEnLecture.hideOw+'?hidePhone='+ecranEnLecture.hidePh+'?hideSubject='+ecranEnLecture.hideSub+'">');
html.push('<div class="room_name">'+nomSalle+'</div><div class="room_info">');
html.push('<div class="duree"><img src="icon-duree-dark.png" class="icon">30min</div><div class="seats">');
html.push('<img src="icon-seats-dark.png" class="icon">'+nBseats+' places</div></div></div></a></li>');
$("#listes-salles-libres").append(html.join(''));
$("li.une-salle-libre:odd").css({'background-color':'#d7f0db'});
$("li.une-salle-libre:even").css({'background-color':'white'});

$("li.une-salle-libre:odd").mouseover(function() {
	$(this).css('background','#C2D8C5');
});
$("li.une-salle-libre:odd").mouseout(function() {
	$(this).css('background','#d7f0db');
});
$("li.une-salle-libre:even").mouseover(function() {
	$(this).css('background','#e5eae5');
});
$("li.une-salle-libre:even").mouseout(function() {
	$(this).css('background','white');
});

$(".duree-icon:even").attr('src','icon-duree-light.png');
$(".seats-icon:even").attr('src','icon-seats-light.png');
$(".duree-icon:odd").attr('src','icon-duree-dark.png');
$(".seats-icon:odd").attr('src','icon-seats-dark.png');
$("a:even").css('color','#5e8894');
$('#listes-salles-libres').listview('refresh');
}


function ajouterSalleOccupee(nomSalle, idSalle){
var html=[];
html.push('<li class="une-salle-occupee" data-icon="custom_arrow"><a class="occupee" data-transition="flow"  data-ajax="false"');
html.push('href="screenFreebusyRoom.html?resource='+idSalle+'&hideOwner='+ecranEnLecture.hideOw+'&hidePhone='+ecranEnLecture.hidePh+'&hideSubject='+ecranEnLecture.hideSub+'">'+nomSalle+'</a></li>');
$("#listes-salles-occupees").append(html.join(''));
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
