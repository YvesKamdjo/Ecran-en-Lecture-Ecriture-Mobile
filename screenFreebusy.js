var Freebusy= new Object();
var blockedRoom=[];
function setIdentification(log, pass){
	Freebusy.login=log;
	Freebusy.password=pass;
}

function getTime(){
	var myDate = new Date(); 
	var hour = myDate.getHours(); 
	var minute = myDate.getMinutes(); 
	var theTime;
	 
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; } 
	
	theTime = "" + hour + ":" + minute;
	
	return theTime;
}

function compareTime(time, ref) {
	var r=ref.split(":");
	var t=time.split(":");
	if (parseInt(t[0],10)<parseInt(r[0],10)) return false;
	else if ((parseInt(t[0],10)==parseInt(r[0],10))&&(parseInt(t[1],10)<parseInt(r[1],10))) return false;
	else return true;
	
}

function addTime(time1, time2) {
	var t1=time1.split(":");
	var t2=time2.split(":");
	var t3=[];
	var time3="";
	
	minutes=parseInt(t1[1], 10)+parseInt(t2[1], 10);
	reste=Math.floor(minutes/60);
	t3[1]=minutes%60;
	if (t3[1]<10) t3[1]="0"+t3[1];
	
	heures=parseInt(t1[0], 10)+parseInt(t2[0], 10)+reste;
	t3[0]=heures;
	if (t3[0]<10) t3[0]="0"+t3[0];
	
	time3=t3[0]+":"+t3[1];
	return time3;
}

function substractTime(t1, t2) {
	var time1=[];
	var time2=[];
	var time1=t1.split(":");
	var time2=t2.split(":");
	
	var minutes1=60*parseInt(time1[0],10)+parseInt(time1[1],10);
	var minutes2=60*parseInt(time2[0],10)+parseInt(time2[1],10);
	
	var minutes3=minutes1-minutes2;
	var min=minutes3%60;
	if (min<10) min="0"+min;
	var duree=Math.floor(minutes3/60)+":"+min;
	return duree;
}

function getDocumentReady(){
	$(document).ready(function() {
		getUrbaToken(getRoomList);
	});
}
				
 function getUrbaToken(nextFunction){

	$.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+Freebusy.login+'&password='+Freebusy.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidToken',
		success: function(jsonp) {
                nextFunction();
            }		
	});

}

function setValidToken(newToken){
	Freebusy.validToken= newToken.Token;
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

function getRoomList(){
	$.ajax({
			'url' : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?Token='+Freebusy.validToken,
			'dataType' : 'jsonp',
			'jsonpCallback': 'fillRoomList',		
		});
}

function fillRoomList(objJson) {//crée un json qui reprend l'ID, le nom, la capacité de toutes les salles
	var i=0;
	var j=0;
	var allRoomList = [];
	while (objJson[i]){
		if ((objJson[i].location.id==85)||(objJson[i].location.id==89)) {
			allRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "time":objJson[i].resourceProfil.endTime, "capacity":objJson[i].capacity, "owner":""};
			j++;}
		i++;
		}

	Freebusy.roomList=allRoomList;
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
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?free=between,'+createDuration()+'&Token='+Freebusy.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillFreeRoomList',		
		});
}

function fillFreeRoomList(objJson){// crée un json contenant la liste de toutes les salles libres durant la prochaine demi-heure
	var i=0;
	var j=0;
	var freeRoomList = [];
	var now=getTime();
	var nowPlusTemp=addTime(now,"0:30");
	
	while (objJson[i]){
		if (objJson[i].location.id==85) {//si c'est une petite salle, on l'ajoute
			console.log(objJson[i].displayName);
			if (compareTime(objJson[i].resourceProfil.endTime,nowPlusTemp)){
			freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "time":""/*objJson[i].resourceProfil.endTime*/, "capacity":objJson[i].capacity};
			j++;
			}
		}
		else if (objJson[i].location.id==89) {//si c'est une grand salle, on l'ajoute
			console.log(objJson[i].displayName);
			if (compareTime(objJson[i].resourceProfil.endTime,nowPlusTemp)){
			freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "time":""/*objJson[i].resourceProfil.endTime*/, "capacity":objJson[i].capacity};
			j++;
			}
		}
		i++;
		
	}
	
	Freebusy.freeRoomList=freeRoomList;//on place cette liste dans une variable globale
	getResInfo();

}

function createStartDate() {
	var today= new Date();
	startDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T00:00:00";
	return startDate;
}

function createEndDate() {
	var today= new Date();
	endDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T23:59:59";
	return endDate;
}

function getResInfo() {
	var startDate=createStartDate();
	var endDate=createEndDate();
	
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+Freebusy.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResListforRooms',		
		});
}

function fillResListforRooms(objJson) {//crée un tableau avec toutes les réservations des salles libres
	var ligne=0;
	var resList=[];

	$.each(objJson, function(key, value) {
		for (i=0;i<Freebusy.roomList.length;i++) {
			if ((objJson[ligne])&&(i<Freebusy.freeRoomList.length)&&(objJson[ligne].resource.id==Freebusy.freeRoomList[i].id)) {
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				
				if (compareTime(end,now)) {					
					var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone=objJson[ligne].fields[2].value;
					resList[ligne]=[objJson[ligne].resource.id,start,end];
				}
			}
			else if ((objJson[ligne])&&(objJson[ligne].resource.id==Freebusy.roomList[i].id)) {
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				
				if ((compareTime(now,start))&&(compareTime(end,now))) {					
					//var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					//var ownerPhone=objJson[ligne].fields[2].value;
					//resList[ligne]=[objJson[ligne].resource.id,start,end];
					console.log(owner+" ; "+Freebusy.roomList[i].name);
					Freebusy.roomList[i].owner=owner;
				}
			}
		}
		ligne++;
	});
	
	selectNextResForEachRoom(resList);
}

function selectNextResForEachRoom(list) {// ne prend en compte que la prochaine réservation (le but étant d'indiquer combien de temps la salle est libre)
	var startTimes=[];
	var now=getTime();
	
	for (i=0;i<Freebusy.freeRoomList.length;i++) {
		var k=0
		for (j=0;j<list.length;j++) {
			if(list[j]){
				var res=[];
				res=list[j];
				if (res[0]==Freebusy.freeRoomList[i].id) {
					startTimes[k]=res[1];
					k++;
				}
			}
		}
		
		if (k==1){//s'il n'y a qu'une seule réservation, le calcul est facile
			var duree=substractTime(startTimes[0], now);
			Freebusy.freeRoomList[i].time=duree;//on ajoute à la salle sa durée pendant laquelle elle est libre
			}
		else if (k>1) {
			startTimes=startTimes.sort(smallestStartTime);//on tri les heures de début des résa par ordre croissant afin de prendre seulement la plus proche dans le temps
			var duree=substractTime(startTimes, now);
			Freebusy.freeRoomList[i].time=duree;
		}
	}
	Freebusy.freeRoomList=Freebusy.freeRoomList.sort(sortRoomsByFreeTime);//on tri les salles par durées
	Freebusy.freeRoomList=Freebusy.freeRoomList.sort(sortRoomsByCapacity);//on tri les salles par capacités croissantes
	compareRoomLists();
}

function smallestStartTime(a, b) {
		var A=a[0].split(":");
		var B=b[0].split(":");
		var x="";
		var y="";
		x=A[0]+""+A[1];
		y=B[0]+""+B[1];
		return parseInt(x, 10)-parseInt(y, 10);
}

function sortRoomsByCapacity(a, b) {
		var A=a.capacity;
		var B=b.capacity;
		return parseInt(A, 10)-parseInt(B, 10);
}

function sortRoomsByFreeTime(a, b) {
		var A=a.time.split(":");
		var B=b.time.split(":");
		var x="";
		var y="";
		x=A[0]+""+A[1];
		y=B[0]+""+B[1];
		return parseInt(x, 10)-parseInt(y, 10);
}

function sortAlphabeticalOrder(a, b) {
	if (a.name < b.name) return false;
	else return true;
}

function compareRoomLists() {// compare les listes de salles pour ne pas avoir de doublons et que seules les salles occupées apparaissent en tant que telles
	var allRooms=Freebusy.roomList;
	var freeRooms=Freebusy.freeRoomList;
	var i,j=0;
	for (i=0;i<freeRooms.length;i++) {
		for (j=0;j<allRooms.length;j++) {
			if (freeRooms[i].name==allRooms[j].name) {
			allRooms.splice(j,1);
			}
		}
	}
	allRooms.sort(sortAlphabeticalOrder);// on tri les salles occupées par ordre alphabétique
	splitRoomList(freeRooms, allRooms);
}


function splitRoomList(freeRooms, busyRooms) {

getRoomForDisplaying();
var tmp= blockedRoom.join(' ');
console.log(blockedRoom.length);
	for (i=0;i<freeRooms.length;i++){

		if (blockedRoom.length>0){
				//console.log(blockedRoom[0]+" "+freeRooms[i].id+" "+tmp.indexOf(freeRooms[i].id));
				if (tmp.indexOf(freeRooms[i].id)!=-1){
				ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity, freeRooms[i].time);
				}
		}
		else
			ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity, freeRooms[i].time);
	}
	for (j=0;j<busyRooms.length;j++){
		if (blockedRoom.length>0){
			if (tmp.indexOf(freeRooms[j].id)!=-1){
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].owner);
			}
		}
		else
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].owner);
	}
	
	$('#listes-salles-libres').on('click', 'li', function() {
		getNameFreeRoomDisplayed($(this).text());
	});
	$('#listes-salles-occupees').on('click', 'li', function() {
        getNameBusyRoomDisplayed($(this).text()); 
    }); 
	$(".loadgif").hide();
}

function setHideParameters(ho,hp,hs){
Freebusy.hideOw=ho;
Freebusy.hidePh=hp;
Freebusy.hideSub=hs;
}

// Interface graphique En JQuery Mobile
function ajouterSalleLibre(nomSalle, idSalle, nBseats, timeFree){
	var time="";
	if (timeFree=="") {time="jusqu'à la fin de la journée";}//s'il n'y a pas de réservation prévue de la journée
	else {// sinon on donne un arrondi de la durée pendant laquelle la salle est libre
		var duree=timeFree;
		if ((compareTime(duree,"0:30"))&&(compareTime("1:0",duree))) duree="30 min";
		else if ((compareTime(duree,"1:0"))&&(compareTime("1:30",duree))) duree="1h";
		else if ((compareTime(duree,"1:30"))&&(compareTime("2:0",duree))) duree="1h30";
		else if ((compareTime(duree,"2:0"))&&(compareTime("3:0",duree))) duree="2h";
		else if ((compareTime(duree,"3:0"))&&(compareTime("4:0",duree))) duree="3h";
		else if ((compareTime(duree,"4:0"))&&(compareTime("5:0",duree))) duree="4h";
		else if (compareTime(duree,"5:0")) {//si la durée dépasse 5h, on donne l'heure approximative de la prochaine réservation
			var heure=[];
			heure=startTimes[0].split(":");
			duree="jusqu'à "+ heure[0]+"h";
			}
		time="pendant "+duree;
	}
$("#listes-salles-libres").append('<li class="une-salle-libre" data-icon="custom_arrow"><a class="libre" data-transition="flow"  data-ajax="false" href="screenFreebusyRoom.html?resource='+idSalle+'"><div class="room_name">'+nomSalle+'</div><div class="room_info"><div class="seats"><img class="seats-icon">'+nBseats+' places</div><div class="duree"><img class="duree-icon">'+time+'</div></div></a></li>');
$("li.une-salle-libre").mouseover(function() {
	$(this).css('background','#cedfd0');
});
$("li.une-salle-libre").mouseout(function() {
	$(this).css('background','#ecf3ed');
});

$(".duree-icon:even").attr('src','icon-duree-light.png');
$(".seats-icon:even").attr('src','icon-seats-light.png');
$(".duree-icon:odd").attr('src','icon-duree-dark.png');
$(".seats-icon:odd").attr('src','icon-seats-dark.png');
$("a:even").css('color','#5e8894');
$('#listes-salles-libres').listview('refresh');
}


function ajouterSalleOccupee(nomSalle, idSalle, owner){
setHideParameters(false,false,false);
$("#listes-salles-occupees").append('<li class="une-salle-occupee" data-icon="custom_arrow"><a class="occupee" data-transition="flow"  data-ajax="false" href="screenFreebusyRoom.html?resource='+idSalle+'"><div class="room_name">'+nomSalle+'</div><div class="room_info"><div class="seats"><img class="seats-icon">'+owner+'</div></div></a></li>');
$("li.une-salle-occupee").mouseover(function() {
	$(this).css('background','#e7c5bc');
});
$("li.une-salle-occupee").mouseout(function() {
	$(this).css('background','#ffe7e1');
});
$(".duree-icon:even").attr('src','icon-duree-light.png');
$(".seats-icon:even").attr('src','icon-seats-light.png');
$(".duree-icon:odd").attr('src','icon-duree-dark.png');
$(".seats-icon:odd").attr('src','icon-seats-dark.png');
$("a:even").css('color','#5e8894');
$('ul').listview('refresh');
}

//Fin Interface graphique
// Evenements sur les cliques des listes
function getNameFreeRoomDisplayed(salle){
	Freebusy.nomSalle=salle;
}
function setNameFreeRoomDisplayed(){
	$("#nom-salle").html(Freebusy.nomSalle);
}
function getNameBusyRoomDisplayed(salle){
	Freebusy.nomSalle=salle;
}
function setNameBusyRoomDisplayed(){
	$("#nom-salle").html(Freebusy.nomSalle);
}
