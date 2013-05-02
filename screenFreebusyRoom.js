var FreebusyRoom= new Object();

//test

function setIdentification(log, pass){
	FreebusyRoom.login=log;
	FreebusyRoom.password=pass;
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
  
function showTime(){
	var t;
	t = getTime();
	document.getElementById('hourPanel').innerHTML=t;
	afficherHeureSurFrise();
	setTimeout("showTime();",1000);
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
		  
function compareTime(time, ref) {
	var r=ref.split(":");
	var t=time.split(":");
	if (parseInt(t[0],10)<parseInt(r[0],10)) return false;
	else if ((parseInt(t[0],10)==parseInt(r[0],10))&&(parseInt(t[1],10)<=parseInt(r[1],10))) return false;
	else return true;
	
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

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function initDocument(){
	getUrlParameters();
	FreebusyRoom.vacancy=false;
	FreebusyRoom.refresh=false;
	FreebusyRoom.bResPushed=false;
	FreebusyRoom.timeRes="";
	$("#sub").hide();
	$("#bouton").hide();
	$("#b_conf").hide();
	var w=$(window).width();
	var h=$(window).height();
	$("body").css("font-size",((w*h/1000000)+0.5)+"em");
	$("#info-salle").css("top",(w*(-1/322)+10+"%"));
	$("#nom-salle").css("font-size",((w*h/500000)+1)+"em").css("left", (w*(1/322)+20)+"px");//.css("top", (w*(1/322)-8)+"px");
	$("#hourPanel").css("font-size",((w*h/500000)+1)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/1000000)+2)+"em").css("left", (w*(1/322)+15)+"px");
	$(window).resize(function(){
		var w=$(window).width();
		var h=$(window).height();
	$("body").css("font-size",((w*h/1000000)+0.5)+"em");
	$("#info-salle").css("top",(w*(-1/400)+5+"%"));
	$(".menu_hour").css("padding-top",(w*(-1/400)+5)+"%");
	$("#nom-salle").css("font-size",((w*h/500000)+1)+"em").css("left", (w*(1/322)+20)+"px");
	$("#hourPanel").css("font-size",((w*h/500000)+1)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/1000000)+2)+"em").css("left", (w*(1/322)+15)+"px");
	});
	construireLaFrise();
	getUrbaToken(getRoomInfo);
	$(window).resize(function(){
	afficherHeureSurFrise();
	});
}

 function getUrbaToken(function1){
 $.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+FreebusyRoom.login+'&password='+FreebusyRoom.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidToken',
		success: function(jsonp) {
						function1();
					}		
	});	
}


function setValidToken(newToken){
	FreebusyRoom.validToken= newToken.Token;
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

function getUrlParameters(){//permet de recuperer les parametres dans l'URL pour filtrer les info � afficher
	var allArg;
	allArg= document.location.search;//recuperation de la requete contenue dans l'URL
	var t=[];
	var t1=[];
	t=allArg.split("&");
	t1=t[0].split("=");
	FreebusyRoom.ID= t1[1];
	if (t.length>2){//permet de savoir s'il s'agit d'une salle occup�e ou pas
	t1=t[1].split("=");
	FreebusyRoom.hideOwner= t1[1];
	t1=t[2].split("=");
	FreebusyRoom.hidePhone=t1[1];
	t1=t[3].split("=");
	FreebusyRoom.hideSubject=t1[1];
	}
}

function getRoomInfo(){
	$.ajax({
			url: 'http://demo.urbaonline.com/pjeecran/api/v1/resources/'+FreebusyRoom.ID+'?Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomInfo',	
			crossDomain: 'true'
		});
}

function getFreeRoomList(){
	$.ajax({
			type: "GET",
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/resources?free=between,'+createDuration()+'&Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'checkRoomVacancy'//,	
			//success: function(res, status, xhr) { 
			//alert(xhr.getResponseHeader());
			//}
		})
}

function checkRoomVacancy(objJson) {
	var i=0;
	var now=getTime();
	var nowPlusTemp=addTime(now,"0:30");
	
	while (objJson[i]) {
		if (objJson[i].id==FreebusyRoom.ID) {
			if (compareTime(objJson[i].resourceProfil.endTime,nowPlusTemp)) {
				FreebusyRoom.vacancy=true;
			}
		}
		i++;
	}
	//getUrbaToken(getRoomInfo);
	getUrbaToken(getResInfo);
}
	
function fillRoomInfo(objJson){
	$("#nom-salle").append(objJson.displayName);
	FreebusyRoom.roomName=objJson.displayName;
	FreebusyRoom.startTime=objJson.resourceProfil.startTime;
	FreebusyRoom.endTime=objJson.resourceProfil.endTime;
	//getResInfo();
	getFreeRoomList();
}

function pingServeur(){//permet de faire un ping au serveur pour r�cup�rer l'heure
	var client = new XMLHttpRequest();
	client.open("GET", "time.txt", true);//script appel� sur le serveur juste pour avoir le temps!
	client.send();
	client.onreadystatechange = function() {
	if(this.readyState == 2) {
	var ping=this.getResponseHeader('Date');
	var text=[];
	text=ping.split(" ");
	isDeviceInTime(text[4]);
  }
}
}

function isDeviceInTime(temps){//permet de v�rifier que le client est � l'heure
	var t=[];
	var tempo= new Date();
	var all=tempo.toUTCString();//la date locale est convertie au temps UTC ce qui permet de g�rer les changements d'heures
	//console.log("heure du poste "+all+" heure du serveur: "+temps);
	var nt=all.split(" ");
	var hms=[];
	hms=nt[4].split(":");
	var m= parseInt(hms[1],10);
	var h= parseInt(hms[0],10);
	t=temps.split(":");
	var m2=parseInt(t[1],10);
	var h2=parseInt(t[0],10);
	if (h-h2!=0 || Math.abs(m-m2)>=10)// s'il y a un d�calage d'aumoins 15 minutes alors signaler!
		alert("Attention l'heure de cet appareil doit etre verifiee!");
}
function getResInfo() {
	var startDate=createStartDate();
	var endDate=createEndDate();
	var geturl=$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResListforRoom',
			});

		
}

function fillResListforRoom(objJson) {
	var ligne=0;
	var j=0;
	var jsonLocal=[];
	var resList=[];
	$.each(objJson, function(key, value) {
			if (objJson[ligne].resource.id==FreebusyRoom.ID) {
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				jsonLocal[j]={startH:start,endH:end};// récupération de l'heure de début et de fin dans un JSON
					j++;
				if (compareTime(end,now)) {					
					var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone=objJson[ligne].fields[2].value;
					resList[ligne]=[start,end,owner,ownerPhone,subject]
				}
			}
		ligne++;
	});
	//construireLaFrise();
	remplirLaFrise(jsonLocal);
	sortResList(resList);	
}

function sortResList(list) {
	if (list.length>1) {
		list = list.sort(function(a, b) {
			var A=a[0].split(":");
			var B=b[0].split(":");
			var x="";
			var y="";
			x=A[0]+""+A[1];
			y=B[0]+""+B[1];
			return parseInt(x, 10)-parseInt(y, 10);
		});
	}
	
	fillResInfos(list);
}
function fillResInfos(list) {	
	var now=getTime();
	var nowPlusTemp=addTime(now,"0:30");
	
	FreebusyRoom.state="free";//marque la salle comme libre!
	if (list.length>0) {
		res=list[0];
		if (compareTime(res[0],nowPlusTemp)) {//Si la prochaine r�servation est dans plus d'une demi-heure
			if (FreebusyRoom.vacancy) {//Si la salle appartient bien � la liste des salles libres
//-----------Salle libre--------------
				var temps="jusqu'à "+res[0];
				var dureeLibre=substractTime(res[0],now);
				if (compareTime(dureeLibre,"1:00")) {
					$("#sub").append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(60)"> 1 h </div></li>');
				}
				if (compareTime(dureeLibre,"1:30")) {
					$("#sub").append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(90)"> 1 h 30 </div></li>');
				}
				if (compareTime(dureeLibre,"2:00")) {
					$("#sub").append('<li><div type="button" id="b_res120" class="menu_hour" onClick="res_demand(120)"> 2 h </div></li>');
				}
				var w=$(window).width();
				$(".menu_hour").css("padding-top",(w*(-1/400)+5)+"%");
				$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
				$("#screenBorder").css({"background-color":"#38b54d"});
				$("#nom-salle").css({"color":"#d7f0db"});
				$("#etat").html("Libre").css({"color":"#38b54d"});
				$("#temps").html(temps);
				$("#bouton").show();
				$("#info-res-title").html("Prochaine réunion :");
				$(".loadgif").hide();
				$("#b_conf").hide();
				console.log("libre");
			}
			else {//La salle n'appartient pas � la liste des salles libres
//-------Salle indisponible--------------
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat").html("Indisponible").css({"color":"#ed1b24"}).css({"padding-left":"19%"});
			$(".loadgif").hide();
			$("#b_conf").hide();
			}
		}
		else {//la r�servation commence dans moins d'une demi-heure ou a commenc�
//------Salle occup�e----------------
			var temps="jusqu'à "+res[1];
			var resStartTimePlusTemp=addTime(res[0],"0:15");
			FreebusyRoom.state="busy";//marque la salle comme occup�e!!!
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat").html("Occup\351").css({"color":"#ed1b24"}).css({"padding-left":"19%"});
			$("#temps").html(temps).css({"padding-left":"20%"});
			if(compareTime(resStartTimePlusTemp, now)) {
				$("#b_conf").show();
				}
			else{$("#b_conf").hide();}
			$("#info-res-title").html("Réunion actuelle:");
			$(".loadgif").hide();
			$("#bouton").hide();
		}
		
		var sujet="";
		if(FreebusyRoom.hideSubject=="false")
			if(res[4]) 
				{sujet=' - '+'"'+res[4]+'"';}
		var duree="De "+res[0]+" à "+res[1]+sujet;
		$("#info-res-horaires").html(duree);
		if (FreebusyRoom.hideOwner=="false")
			var owner=res[2];
		var ownerPhone="";
		if (FreebusyRoom.hidePhone=="false")
			if(res[3]) 
				var ownerPhone=" - "+res[3];
		var ownerInfo=owner+ownerPhone;
		if (ownerInfo!="undefined")
			$("#info-res-owner").html(ownerInfo);
	}
	else {//il n'y a pas de r�servation d'ici la fin de la journ�e
		if (FreebusyRoom.vacancy) {//si la salle est libre (et non-indisponible)
//-------Salle libre-----------
				$("#sub").append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(60)"> 1 h </div></li>');
				$("#sub").append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(90)"> 1 h 30 </div></li>');
				$("#sub").append('<li><div type="button" id="b_res120" class="menu_hour" onClick="res_demand(120)"> 2 h </div></li>');
			var w=$(window).width();
			$(".menu_hour").css("padding-top",(w*(-1/400)+5)+"%");
			$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
			$("#screenBorder").css({"background-color":"#38b54d"});
			$("#nom-salle").css({"color":"#d7f0db"});
			$("#etat").html("Libre").css({"color":"#38b54d"});
			$("#bouton").show();
			$("#info-res-title").html("Pas d'autre réservation prévue aujourd'hui");
			$(".loadgif").hide();
			$("#b_conf").hide();
			$("#temps").html("")
			$("#info-res-horaires").html("");
			$("#info-res-owner").html("");
			console.log("libre toute la journ�e");
		}
		else {//si la salle est indisponible
//-------Salle indisponible-----------
		FreebusyRoom.state="busy";
		$("body").css({"background-color":"#fad2d3"});
		$("#screenBorder").css({"background-color":"#ed1b24"});
		$("#nom-salle").css({"color":"#fad2d3"});
		$("#etat").html("Indisponible").css({"color":"#ed1b24"}).css({"padding-left":"19%"});
		$(".loadgif").hide();
		$("#bouton").hide();
		$("#b_conf").hide();
		$("#temps").html("")
		$("#info-res-horaires").html("");
		$("#info-res-owner").html("");
		console.log("indisponible sans res");
		}
	}
	setTimeout(function() {refresh();},3000);
}

function refresh() {
	console.log("refresh");
	location.reload();
	getUrbaToken(getFreeRoomList);
}

function createDate() {
	var today= new Date();
	var theDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
	
	return theDate;
}

function createStartTime(){
	var now=getTime();
	var t=[];
	t=now.split(":");
	m=parseInt(t[1],10);	
	if (m<15) m="00";
	else if (m<30) m="15";
	else if (m<45) m="30";
	else if (m>=45) m="45";
	var startTime=""+t[0]+":"+m+":00";
	return startTime;
}

function createEndTime() {
	var now=createStartTime();	
	var endTime=addTime(now,FreebusyRoom.timeRes)+":00";
	return endTime;
}

function createJsonRes(){
	jsonToSend = '{"id":0,"date":"'+createDate()+'T00:00:00","startDate":"'+createDate()+'T'+createStartTime()+'","endDate":"'+createDate()+'T'+createEndTime()+'","fields":[{"name":"ecran","value":"Ecran","key":"Champ1"},{"name":null,"value":"Ecran","key":"Champ2"},{"name":null,"value":"","key":"Champ3"},{"name":null,"value":"","key":"Champ4"},{"name":null,"value":"","key":"Champ5"},{"name":null,"value":"","key":"Champ6"},{"name":null,"value":"","key":"Champ7"},{"name":null,"value":"","key":"Champ9"},{"name":null,"value":"","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"'+createDate()+'T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"Théo","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":'+FreebusyRoom.ID+'}}'
	
	return jsonToSend;
}

function sendRes(){
	var jsonRes=createJsonRes();

	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token=" +FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data: jsonRes
		}).done(function( msg ) {
		location.reload();
	});
}

function button_res() {
	if (FreebusyRoom.bResPushed) {
		$("#sub").hide();
		FreebusyRoom.bResPushed=false;
		document.getElementById("b_res_arrow").src = "arrow_d.png";
	}
	else {
		document.getElementById("b_res_arrow").src = "arrow_u.png";
		$("#sub").show();
		FreebusyRoom.bResPushed=true;
	}
}

function res_demand(minutes) {
		$("#b_res"+minutes).css({"background-color":"#38b54d"});
		FreebusyRoom.timeRes=Math.floor(minutes/60)+":"+minutes%60;
		getUrbaToken(sendRes);
}
function construireLaFrise(){// juste dessiner le squelette de la frise.
	var i;
	var tmp1, tmp2;
	var startH, startMin;
	var endH, endMin;
	for (i=8;i<20;i++){
		$("#ligne1").append('<td width="8.33%" class="caseFrise" colspan="4">'+i+'h</td>');
		$("#ligne2").append('<td width="8.33%" style="font-size:25%" class="caseFrise traitSeparation" colspan="4">&nbsp;</td>');
		for(var j=1; j<=4; j++){// division de chaque tranche d'heure en quatre (graduation selon le 1/4 d'heure)
		$("#ligne3").append('<td class="caseFrise" heigth="10px" id="case'+i+''+j+'"> &nbsp;</td>');
		$("#case"+i+""+j).css('background','white');
		}
	}
}
function remplirLaFrise(json){// remplissage de la frise avec la couleur rouge selon les occupations
	$.each(json, function(key, value){
		var all=[];
		all= value.startH.split(":");
		var starth= parseInt(all[0],10);//l'heure de d�but de la r�sa
		var startm=parseInt(all[1],10);// les minutes de d�but de la r�sa!
		all=value.endH.split(":");
		var endh=parseInt(all[0],10);// l'heure de fin
		var endm=parseInt(all[1],10);//les minutes de fin
		if(starth==endh){//si la resa a une dur�e inf�rieure � 1 heure
				var quartHeure;
				if(endm!=0)
					quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la résa
				else
					quartHeure=1;
				var l;
				var deb;
				if (startm!=0)
				deb=1+startm/15;//calcul du quart d'heure à partir duquel commence la résa
				else
				deb=1;
				for(l=deb;l<=quartHeure;l++){
				var idcasedebut="case"+starth+""+l;//l'id de la case à colorier en rouge
				$("#"+idcasedebut).css('background','red');
				}
			}
		else{
		
			var k;
			for(k=starth;k<=endh;k++){
					if (k==endh){
						var quartHeure; // calcul du quart d'heure à partir duquel commence la résa
						if(endm!="00"){
						
							quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la résa
							}
						else
							quartHeure=0;// l'heure de fin de resa est du genre xh00
						var l;
						for(l=1;l<=quartHeure;l++){
						var idcasedebut="case"+k+""+l;//l'id de la case à colorier en rouge
						$("#"+idcasedebut).css('background','red');
						}
					}
					else if (k==starth){
						var l;
						var deb;
						if(startm!=0){
							quartHeure=1+startm/15;
						}
						else
							quartHeure=1;
						var l;
						for(l=quartHeure;l<=4;l++){
							var idcasedebut="case"+k+""+l;
						$("#"+idcasedebut).css('background','red');
						}
					}
					else{
						for(l=1;l<=4;l++){
							var idcasedebut="case"+k+""+l;//l'id de la case à colorier en rouge
							$("#"+idcasedebut).css('background','red');
							}
					}

				}
			}
	});
}
function afficherHeureSurFrise(){// pour afficher un curseur pour l'heure sur la frise
	var t;
	var uniteHeure=$(window).width()*0.0833;// calcul de la taille d'heure en pixel
	var uniteMinute=uniteHeure/60;// calcul d'une minute en pixel
	t = getTime();
	var t2=[];
	t2=t.split(":");
	var h=parseInt(t2[0],10);
	var m=parseInt(t2[1],10);
	var temp=h-8;
	var pos= temp*uniteHeure+m*uniteMinute+2;// calcul de la position en fonction de l'heure actuelle
	//console.log(FreebusyRoom.state);
	if(FreebusyRoom.state=="free")
		$("#frise").css('background-image','url(curseur-vert.png)');
	else
		if(FreebusyRoom.state=="busy")
			$("#frise").css('background-image','url(curseur-rouge.png)');
	$("#frise").css('background-position',pos);
	$("#frise").css('background-size','0.525% 100%');
	
}