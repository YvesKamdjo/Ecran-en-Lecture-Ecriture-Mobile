var ecranEnLecture= new Object();
var refresh=false;

function setIdentification(log, pass){
	ecranEnLecture.login=log;
	ecranEnLecture.password=pass;
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

function getDMY() {
	var months = ["Janvier", "Février", "Mars", 
"Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", 
"Octobre", "Novembre", "Décembre"];
	var myDate = new Date();
	var day = myDate.getDate(); 
	var month = months[myDate.getMonth()]; 
	var year = myDate.getFullYear(); 
	
	theDate = "" + day + "/" + month + "/" + year;
	
	return theDate;
}
  
function showDate(){
	var d;
	var date=[];
	d = getDMY()
	date = d.split("/");
	var theDate = 'Réunions du <span class="date">' + date[0] +" "+ date[1] +" "+ date[2] +'</span>';
	document.getElementById('title').innerHTML=theDate;
	setTimeout("showDate();",60000);
}

function showTime(){
	var t;
	t = getTime();
	document.getElementById('hourPanel').innerHTML=t;
	setTimeout("showTime();",1000);
}
  
function addTime(time1, time2) {
	var t1=time1.split(":");
	var t2=time2.split(":");
	var t3=[];
	var time3="";
	t3[0]=parseInt(t1[0], 10)+parseInt(t2[0], 10);
	t3[1]=parseInt(t1[1], 10)+parseInt(t2[1], 10);
	time3=t3[0]+":"+t3[1];
	return time3;
}
		  
function compareTime(time, ref) {
	var r=ref.split(":");
	var t=time.split(":");
	if (parseInt(t[0],10)>parseInt(r[0],10)) return true;
	else if ((parseInt(t[0],10)==parseInt(r[0],10))&&(parseInt(t[1],10)>=parseInt(r[1],10))) return true;
	else return false;
	
}
		  
function intervalleOfTime(time, ref) {// dit si l'heure de début d'une résa est dans max 3 heures
	var r = ref.split(":"); 
	var t=time.split(":");
	if ((parseInt(t[0],10)-parseInt(r[0],10))<=2) 
		return true;
	else
		return false;
}

function setDateOnUrbaFormat(d){
// transforme une date d au format URBA: aaaa-mm-ddT00:00:00-->format JSON
	var m= d.getMonth()+1;
	m="0"+m;
	return d.getFullYear()+"-"+m+"-"+d.getDate()+"T00:00:00";
}

function getTimeFromUrbaFormat(date){// extrait l'heure dans une date au format URBA
	var t= date.split("T");
	var hhmm= t[1].split(":");
	return ""+hhmm[0]+":"+hhmm[1]; // l'heure au format hh:mm
}

function getDocumentReady(){
	$(document).ready(function() {
		getUrbaToken();
	});
}

function refreshScreen(){
	try{
	if (!refresh) {
		getUrbaToken();
		refresh=true;
	}
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}
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
	console.log(e);
	getUrbaToken();
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
	getRoomName();
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

function getRoomID() {
	var url=document.location.href;
	var temp=[];
	var temp=url.split("resource=");
	return temp[1];
}

function getRoomName(){
	try{
	var roomID=getRoomID();
	$.ajax({
			url: 'http://demo.urbaonline.com/pjeecran/api/v1/resources/'+roomID+'?Token='+ecranEnLecture.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomName',		
		})
		}
	catch(e){
	console.log(e);
	getRoomName();
	}
}
	
function fillRoomName(objJson){
	try {
		$("#nom-salle").html(objJson.displayName);
	}

	catch(e){
	console.log(e);
	getUrbaJson();
	}
	getResInfo();
}

function getResInfo() {
	try{
	var startDate=createStartDate();
	var endDate=createEndDate();
	//var roomID=getRoomID();
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+ecranEnLecture.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResInfos',		
		})
		}
	catch(e){
	console.log(e);
	getRoomName();
	}
}

function fillResInfos(objJson) {
	var ligne=0;
	var resFound=false;
	var roomID=getRoomID();
	
	$.each(objJson, function(key, value) {
			if (objJson[ligne].resource.id==roomID) {
				console.log(objJson[ligne]);
				var now=getTime();
				
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				
				if (compareTime(end,now)) {
					if (compareTime(start,now)) {
						var temps="jusqu'à "+start;
						$("#temps").html(temps);
					}
					else {
						var temps="jusqu'à "+end;
						$("#temps").html(temps);
					}
					
					var sujet="";
					if(objJson[ligne].fields[3].value) {sujet=' - '+'"'+objJson[ligne].fields[3].value+'"';}
					var duree="De "+start+" à "+end+sujet;
					$("#info-res-horaires").html(duree);
					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone="";
					if(objJson[ligne].fields[2].value) var ownerPhone=" - "+objJson[ligne].fields[2].value;
					var ownerInfo=owner+ownerPhone;
					$("#info-res-owner").html(ownerInfo);
					
					resFound=true;
				}
			}
		ligne++;
	});
	if (!resFound) {$("#info-res-title").html("Pas de réservation prévue aujourd'hui");}
}
/*
function displayNewJson(SortedJson){
	var ligne=0;
	var items = [];
	var today= new Date();
	now=getTime();
	$('.refresh').remove();
	$('#entete').show();
	$.each(SortedJson, function(key, value) {
		if (ligne%2==0) p=1;
		if (ligne%2==1) p=2;
		var h=(SortedJson[ligne].heuresDeResa).split(":");
		items.push('<td class="heure">'+h[0]+"h"+h[1]+'</td>');
		items.push('<td class="organisateur">'+SortedJson[ligne].organisateurs+'</td>');                           
		items.push('<td class="salle">'+SortedJson[ligne].salles+'</td>');
		if (!compareTime(SortedJson[ligne].heuresDeResa,now)) items.push('<td class="debut">en cours</td>');
		else items.push('<td class="debut"></td>');		
		$('<tr>', {
		   'class': 'ligne'+p+' refresh',
		   'id': ligne,
		   html: items.join('')
		   }).appendTo('table');
		   items.length = 0;
		   ligne++;
		});
	
	refresh=false;
	
	if (ligne==0) {
		$('#entete').hide();
		items.push('<td colspan="4" class="noRes">Aucune réservation prévue pour l\'instant</td>');
		ligne=1;		
		$('<tr>', {
		   'class': 'ligne1 refresh',
		   html: items.join('')
		   }).appendTo('table');
		   items.length = 0;
		   setTimeout("refreshScreen();", 300000)
	}

	if (ligne<=8){
		for (i=ligne; i<8; i++) {
		items.push('<td colspan="4">&nbsp;</td>');
		$('<tr>', {
		   'class': 'ligne1 refresh',
		   html: items.join('')
		   }).appendTo('table');
		   items.length = 0;
		}
		setTimeout("refreshScreen();", 300000);
	}
	else if(ligne>8){
		var nbCycles=Math.round(150/(5*(ligne-8)));
		showFirstHideNext(ligne, nbCycles);
	}
}*/