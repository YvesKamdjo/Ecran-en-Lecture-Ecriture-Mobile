var Freebusy= new Object();
var blockedRoom=[];
function setIdentification(log, pass){
	Freebusy.login=log;
	Freebusy.password=pass;
}



function initDocument(){
	var h=$(window).height();
	var w=$(window).width();
	getUrlParameters();
	setPageLanguage();
	
	if (h<w) {
		h=w/4+500;
		$("body").css("font-size",("1em"));
	}
	else $("body").css("font-size",(1.5*w/h+"em"));

	$("#salles-libres").css("height",("1.5em")).css("font-size",(h/300+"em"));
	$("#salles-occupees").css("height",("1.5em")).css("font-size",(h/300+"em"));
	
	$(window).resize(function(){
		var h=$(window).height();
		var w=$(window).width();
		
		if (h<w) {
			h=w/4+500;
			$("body").css("font-size",("1em"));
		}
		else $("body").css("font-size",(1.5*w/h+"em"));

		$("#salles-libres").css("height",("1.5em")).css("font-size",(h/300+"em"));
		$("#salles-occupees").css("height",("1.5em")).css("font-size",(h/300+"em"));
		$(".une-salle-libre").css("height",(h/125+1+"em"));
		$(".une-salle-occupee").css("height",(h/125+1+"em"));
		$(".ui-btn-inner").css("font-size",(h/400+"em"));
		$(".duree-icon").css("height",(h/2500+1+"em"));
		$(".seats-icon").css("height",(h/2500+1+"em"));
	});

	getUrbaToken(getRoomList);
	//var textareaWidth = document.getElementById("textarea").scrollWidth;
	//document.getElementById("wrapper").style.width = textareaWidth + "px";
	
	if ((Freebusy.home!="list")&&(Freebusy.home!="none")) {
		inactivityTimeout();
	}

}

function inactivityTimeout() {
	var homeTimeout = setTimeout(function(){returnHome();}, 120000);
	document.onmousemove = function(){
		clearTimeout(homeTimeout);
		homeTimeout = setTimeout(function(){returnHome();}, 120000);
	}

	document.ontouchmove = function(){
		clearTimeout(homeTimeout);
		homeTimeout = setTimeout(function(){returnHome();}, 120000);
	}
}

function returnHome() {
	var linkHome="";
	
	if (Freebusy.home=="list") linkHome="http://demo.urbaonline.com/pjeecran/Hd/pjeecran/ecran/screenFreebusy.html?lang="+Freebusy.lang+"&home="+Freebusy.home;
	else linkHome="http://demo.urbaonline.com/pjeecran/Hd/pjeecran/ecran/screenFreebusyRoom.html?resource="+homeID+"&hideOwner=false&hidePhone=false&hideSubject=false&screen=capacitive&presenceConfirmation=true&lang=fr&home=room_"+homeID;
	
	window.location.href = linkHome;
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

/*function addRoomToDisplay(roomID){
	blockedRoom.push(roomID);
}*/

function getUrlParameters(){//permet de récupérer les identifiants des salles à afficher dans l'URL
	var p=document.location.search;
	Freebusy.lang="fr";//la langue par defaut est le français!
	var tmp1;
	var tmp=[];
	if (p!=""){
	var query=p.replace("?","");
		tmp=query.split("&");
		var i=tmp.length;
			if (i!=0){
			var j;
				for(j=0;j<i;j++){
				var valeur=[];
				valeur=tmp[j].split("=");
					switch(valeur[0]){
						case"resources"://le mot clé utilisé pour lister les salles à afficher est "resources"
						blockedRoom= valeur[1].split(",");
						break;
						case "lang":
						Freebusy.lang=valeur[1];
						break;
						case "home":
						console.log(valeur[1]);
							if (valeur[1]!="undefined") Freebusy.home=valeur[1];
							else Freebusy.home="none";
						break;
					}
				}
			}
	}
}

function setPageLanguage(){
	switch(Freebusy.lang){
	case "en":
		$("#salles-libres").html("Free Rooms");
		$("#salles-occupees").html("Busy Rooms");
		$('title').html("Room Occupation");
		Freebusy.messFinOrEnd="Until the end of the day";
		Freebusy.pendantOrFor="for ";
		Freebusy.indispoOrUnava="Unavailable";
	break;
	case "fr":
		$("#salles-libres").html("Salles Libres");
		$("#salles-occupees").html("Salles Occup&eacute;es");
		Freebusy.messFinOrEnd="jusqu'&agrave; la fin de la journ&eacute;e";
		Freebusy.pendantOrFor="pendant ";
		Freebusy.indispoOrUnava="Indisponible";
		$('title').html("Occupation des salles ");
	break;
	}
}
function getRoomList(){//récupère la liste des salles auprès de l'API
	$.ajax({
			'url' : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?Token='+Freebusy.validToken,
			'dataType' : 'jsonp',
			'jsonpCallback': 'fillRoomList'		
		});
}

function fillRoomList(objJson) {//remplit un tableau contenant la liste des salles (+ infos suplémentaires) et la passe en variable globale
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


function addMinutes(date, minutes) {//ajoute un certain nombre de minutes à l'heure actuelle
    return new Date(date.getTime() + minutes*60000);
}

function createDuration(){//traduit l'intervale de temps entre maintenant et une demi-heure en format urba (aaaa-mm-jjThh:mm:ss,aaaa-mm-jjThh:mm:ss) pour demander à l'API quelles sont les salles libres dans la prochaine demi-heure (pas minimum)
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


function getFreeRoomList(){//demande à l'API la liste des salles libres dans la prochaine demi-heure
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?free=between,'+createDuration()+'&Token='+Freebusy.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillFreeRoomList'		
		});
}

function fillFreeRoomList(objJson){// remplit un tableau avec la liste des salles libres (+infos supplémentaires) et le passe en variable globale
	var i=0;
	var j=0;
	var freeRoomList = [];
	var now=getTime();
	var nowPlusTemp=addTime(now,"0:30");
	while (objJson[i]){
		if (objJson[i].location.id==85) {//si c'est une petite salle
			if (compareTime(objJson[i].resourceProfil.endTime,nowPlusTemp)){
			freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "time":""/*objJson[i].resourceProfil.endTime*/, "capacity":objJson[i].capacity};
			j++;
			}
		}
		else if (objJson[i].location.id==89) {//si c'est une grande salle
			if (compareTime(objJson[i].resourceProfil.endTime,nowPlusTemp)){
			freeRoomList[j]={"id":objJson[i].id, "name":objJson[i].displayName, "time":""/*objJson[i].resourceProfil.endTime*/, "capacity":objJson[i].capacity};
			j++;
			}
		}
		i++;
		
	}
	
	Freebusy.freeRoomList=freeRoomList;
	getResInfo();

}

function createStartDate() {//crée une date de départ pour demander les réservations de la journée
	var today= new Date();
	startDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T00:00:00";
	return startDate;
}

function createEndDate() {//crée une date de fin pour demander les réservations de la journée
	var today= new Date();
	endDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T23:59:59";
	return endDate;
}

function getResInfo() {//demande à l'API la liste des réservations de la journée
	var startDate=createStartDate();
	var endDate=createEndDate();
	
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+Freebusy.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResListforRooms'		
		});
}

function fillResListforRooms(objJson) {// remplit un tableau avec la liste des réservations pour les trier
	var ligne=0;
	var resList=[];

	$.each(objJson, function(key, value) {
		for (i=0;i<Freebusy.roomList.length;i++) {// si la réservation est liée à une salle libre
			if ((objJson[ligne])&&(i<Freebusy.freeRoomList.length)&&(objJson[ligne].resource.id==Freebusy.freeRoomList[i].id)) {
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				
				if (compareTime(end,now)) {//si la réservation n'est pas finie (dans le passé)				
					var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone=objJson[ligne].fields[2].value;
					resList[ligne]=[objJson[ligne].resource.id,start,end];
				}
			}
			else if ((objJson[ligne])&&(objJson[ligne].resource.id==Freebusy.roomList[i].id)) {// si la réservation est liée à une salle occupée
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				
				if ((compareTime(now,start))&&(compareTime(end,now))) {//si la réservation est en cours					
					//var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					//var ownerPhone=objJson[ligne].fields[2].value;
					//resList[ligne]=[objJson[ligne].resource.id,start,end];
					Freebusy.roomList[i].owner=owner;
				}
			}
		}
		ligne++;
	});
	
	selectNextResForEachRoom(resList);
}

function selectNextResForEachRoom(list) {//tri les réservations pour ne garder que la prochaine dans le temps
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
		if (k==1){
			var duree=substractTime(startTimes[0], now);
			Freebusy.freeRoomList[i].time=duree;
			}
		else if (k>1) {
			startTimes=startTimes.sort(smallestStartTime);
			var duree=substractTime(startTimes[0], now);
			Freebusy.freeRoomList[i].time=duree;
		}
	}
	Freebusy.freeRoomList=Freebusy.freeRoomList.sort(sortRoomsByFreeTime);
	Freebusy.freeRoomList=Freebusy.freeRoomList.sort(sortRoomsByCapacity);
	compareRoomLists();
}

function smallestStartTime(a, b) {//tri par heure de départ croissante
		var A=a[0].split(":");
		var B=b[0].split(":");
		var x="";
		var y="";
		x=A[0]+""+A[1];
		y=B[0]+""+B[1];
		return parseInt(x, 10)-parseInt(y, 10);
}

function sortRoomsByCapacity(a, b) {//tri par nombre de place croissant
		var A=a.capacity;
		var B=b.capacity;
		return parseInt(A, 10)-parseInt(B, 10);
}

function sortRoomsByFreeTime(a, b) {//tri par durée libre croissante
		var A=a.time.split(":");
		var B=b.time.split(":");
		var x="";
		var y="";
		x=A[0]+""+A[1];
		y=B[0]+""+B[1];
		return parseInt(x, 10)-parseInt(y, 10);
}

function sortAlphabeticalOrder(a, b) {//tri par ordre alphabétique
	if (a.name < b.name) return false;
	else return true;
}

function compareRoomLists() {//compare les listes des salles libres à la liste des salles afin de supprimer les doublons
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
	allRooms.sort(sortAlphabeticalOrder);
	splitRoomList(freeRooms, allRooms);
}


function splitRoomList(freeRooms, busyRooms) {// divise les salles en deux listes : salles libres et salles occupées

//getUrlParameters();
var tmp= blockedRoom.join(' ');
	for (i=0;i<freeRooms.length;i++){

		if (blockedRoom.length>0){
				//console.log(blockedRoom[0]+" "+freeRooms[i].id+" "+tmp.indexOf(freeRooms[i].id));
				if (tmp.indexOf(freeRooms[i].id)!=-1){//vérification si l'ID est bien présente dans les paramètres de l'URL
				ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity, freeRooms[i].time);
				}
		}
		else
			ajouterSalleLibre(freeRooms[i].name, freeRooms[i].id, freeRooms[i].capacity, freeRooms[i].time);
	}
	for (j=0;j<busyRooms.length;j++){
		if (blockedRoom.length>0){
			if (tmp.indexOf(busyRooms[j].id)!=-1){
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].owner);
			}
		}
		else
			ajouterSalleOccupee(busyRooms[j].name, busyRooms[j].id, busyRooms[j].owner);
	}
	
	var h=$(window).height();
	var w=$(window).width();
	
	if (h<w) h=w/4+500;
	
	$(".ui-btn-inner").css("font-size",(h/400+"em"));
	$(".une-salle-libre").css("height",(h/125+1+"em"));
	$(".une-salle-occupee").css("height",(h/125+1+"em"));
	$(".duree-icon").css("height",(h/2500+1+"em"));
	$(".seats-icon").css("height",(h/2500+1+"em"));
	$(".ui-icon-custom_arrow").css("right",(h/2500-0.5+"em"));
	
	$('#listes-salles-libres').on('click', 'li', function() {
		getNameFreeRoomDisplayed($(this).text());		
	});
	$('#listes-salles-occupees').on('click', 'li', function() {
        getNameBusyRoomDisplayed($(this).text()); 
    }); 
	$(".loadgif").hide();
	setTimeout(function(){location.reload();},300000);
}

function setUrlParameters(ho,hp,hs,hb,hc){
Freebusy.hideOw=ho;
Freebusy.hidePh=hp;
Freebusy.hideSub=hs;
Freebusy.isTactile=hb;
Freebusy.btnConf=hc;
}

// Interface graphique En JQuery Mobile
function ajouterSalleLibre(nomSalle, idSalle, nBseats, timeFree){// affiche la salle dans la liste des salles libres
	var time="";
	if (timeFree=="") {time=Freebusy.messFinOrEnd;}//Freebusy.messFinOrEnd="jusqu'à la fin de la journée"
	else {
		var duree=timeFree;
		if ((compareTime(duree,"0:30"))&&(compareTime("1:0",duree))) duree="30 min";
		else if ((compareTime(duree,"1:0"))&&(compareTime("1:30",duree))) duree="1h";
		else if ((compareTime(duree,"1:30"))&&(compareTime("2:0",duree))) duree="1h30";
		else if ((compareTime(duree,"2:0"))&&(compareTime("3:0",duree))) duree="2h";
		else if ((compareTime(duree,"3:0"))&&(compareTime("4:0",duree))) duree="3h";
		else if ((compareTime(duree,"4:0"))&&(compareTime("5:0",duree))) duree="4h";
		else if (compareTime(duree,"5:0")) {
			var heure=[];
			heure=duree.split(":");
			duree="jusqu'à "+ heure[0]+"h";
			}
		time=Freebusy.pendantOrFor+duree;//Freebusy.pendantOrFor="pendant "
	}
setUrlParameters(false,false,false,"capacitive",true);
var html=[];
html.push('<li class="une-salle-libre" data-icon="custom_arrow"><a class="libre" data-transition="slide" data-ajax="false"');
html.push(' href="screenFreebusyRoom.html?resource='+idSalle+'&hideOwner='+Freebusy.hideOw+'&hidePhone='+Freebusy.hidePh+'&hideSubject=');
html.push(Freebusy.hideSub+'&screen='+Freebusy.isTactile+'&presenceConfirmation='+Freebusy.btnConf+'&lang='+Freebusy.lang+'&home='+Freebusy.home+'"><div class="room_name">'+nomSalle+'</div><div class="room_info"><div class="seats">');
html.push('<img class="seats-icon">'+nBseats+' places</div><div class="duree"><img class="duree-icon">'+time+'</div></div></a></li>');
$("#listes-salles-libres").append(html.join(''));
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


function ajouterSalleOccupee(nomSalle, idSalle, owner){// ajoute la salle dans la liste des salles occupées
setUrlParameters(false,false,false,"capacitive",true);
var html=[];
html.push('<li class="une-salle-occupee" data-icon="custom_arrow">');
html.push('<a class="occupee" data-transition="flow"  data-ajax="false" href="screenFreebusyRoom.html?resource='+idSalle);
html.push('&hideOwner='+Freebusy.hideOw+'&hidePhone='+Freebusy.hidePh+'&hideSubject='+Freebusy.hideSub+'&screen='+Freebusy.isTactile+'&presenceConfirmation='+Freebusy.btnConf+'&lang='+Freebusy.lang+'&home='+Freebusy.home+'">');
html.push('<div class="room_name">'+nomSalle+'</div><div class="room_info">');
if (owner!="") html.push('<div class="seats"><img class="seats-icon">'+owner+'</div></div></a></li>');
else html.push('<div class="seats"><img class="seats-icon indisponible">'+Freebusy.indispoOrUnava+'</div>'); //Freebusy.indispoOrUnava="Indisponible"
$("#listes-salles-occupees").append(html.join(''));
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
$(".indisponible").css('display','none');
$("a:even").css('color','#5e8894');
$('ul').listview('refresh');
}

//Fin Interface graphique
// Evenements sur les cliques des listes
function getNameFreeRoomDisplayed(salle){
	Freebusy.nomSalle=salle;
	jaaulde.utils.cookies.set('linkBack',document.location.search);//dans les cookies
}
function setNameFreeRoomDisplayed(){
	$("#nom-salle").html(Freebusy.nomSalle);
}
function getNameBusyRoomDisplayed(salle){
	Freebusy.nomSalle=salle;
	jaaulde.utils.cookies.set('linkBack',document.location.search);//dans les cookies
}
function setNameBusyRoomDisplayed(){
	$("#nom-salle").html(Freebusy.nomSalle);
}
