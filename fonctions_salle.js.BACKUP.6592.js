var ecranEnLecture= new Object();
var refresh=false;
var bResPushed=false;

function resizeFont() {
var w2=h2=0;
var w= document.body.offsetWidth;
var h=document.body.offsetHeight;
    //console.log("I'm done resizing for the moment");
	console.log("w/h="+w/h+" et h="+h);
 w2=w;

};


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
function createButton(){
$('#bouton').append('<a href="#" data-role="button" data-icon="img-but" data-iconpos="bottom" >Réserver<!--mg src="d-arrow2.png" id="link_list"--></a>');

$('#bouton').css({"display":"inline-block"})
}
function createHeader(){
$('#entete').append('<div id="back-button"><a href="detail-salles.html" ><img src="l-arrow.png" width="65vmin"></a></div>');
$('#entete').append('<div id="nom-salle"></div><div id="hourPanel"></div>');
//$('#entete').append('<!--a ="" href="detail-salles.html"--><img src="l-arrow.png" width="100%" id="link_list"><!--/a-->');
//data-role="button" data-icon="arrow-l" data-iconpos="notext" data-theme="c" data-inline="true"
}
function getDocumentReady(){
<<<<<<< HEAD
	$("#sub").hide();
=======
	createButton();
	createHeader();
>>>>>>> journée du 10/04
	$(document).ready(function() {
		getUrbaToken();
	});
	/*var resizeTimer;// adapter la taille de la police à la taille de la fenetre
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeFont, 100);
});*/
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

<<<<<<< HEAD
function createJsonRes(){
	/*var jsonToSend={
		"date":"2013-04-10T00:00:00",
		"startDate":"2013-04-10T10:00:00",
		"endDate":"2013-04-10T11:00:00",
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
	};*/
	jsonToSend = '{"id":0,"date":"2013-04-10T00:00:00","startDate":"2013-04-10T11:00:00","endDate":"2013-04-10T14:00:00","fields":[{"name":"toto","value":"Guillaume","key":"Champ1"},{"name":null,"value":"Guillaume","key":"Champ2"},{"name":null,"value":"Guillaume","key":"Champ3"},{"name":null,"value":"Guillaume","key":"Champ4"},{"name":null,"value":"Guillaume","key":"Champ5"},{"name":null,"value":"Guillaume","key":"Champ6"},{"name":null,"value":"Guillaume","key":"Champ7"},{"name":null,"value":"Guillaume","key":"Champ9"},{"name":null,"value":"test","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"2013-04-10T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"Théo","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":158}}'
=======
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
>>>>>>> journée du 10/04
	
	return jsonToSend;
}

 function getTokenWrite(){
 try{
 $.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+ecranEnLecture.login+'&password='+ecranEnLecture.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidTokenWrite',			
	})
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}	
}

function setValidTokenWrite(newToken){
	try { 
	ecranEnLecture.validToken= newToken.Token;
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}
	sendRes();
}

function sendRes(){
	var jsonRes=createJsonRes()
	console.log(jsonRes);

	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token=" +ecranEnLecture.validToken,
		contentType: 'application/json; charset=utf-8',
		data: jsonRes
		}).done(function( msg ) {
		alert( "Data Saved: " + msg );
	});

}

function button_res() {
	if (bResPushed) {
		$("#sub").hide();
		bResPushed=false;
	}
	else {
		$("#sub").show();
		bResPushed=true;
	}
}
