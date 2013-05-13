var FreebusyRoom= new Object();
FreebusyRoom.pushed=0;

function setIdentification(log, pass){
	FreebusyRoom.login=log;
	FreebusyRoom.password=pass;
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
	//pingServeur();
	FreebusyRoom.vacancy=false;
	FreebusyRoom.bResPushed=false;
	FreebusyRoom.timeRes="";
	showTime();
	$(".btn_res").hide();
	$("#sub").hide();
	$("#sub li").hide();
	$(".menu_hour").hide();
	$("#b_conf").hide();
	var w=$(window).width();
	var h=$(window).height();
	$("body").css("font-size",((w*h/1000000)+0.8)+"em");
	$("#info-salle").css("top", (-(w*h/2000000)+2)+"em");
	$("#entete").css("font-size",(-(w*h/10000)+370)+"%");
	$("#nom-salle").css("font-size",((w*h/400000)+1.3)+"em").css("left", (w*(1/322)+20)+"px");
	$("#hourPanel").css("font-size",((w*h/400000)+1.3)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/600000)+2)+"em").css("left", (w*(1/322)+15)+"px");
	$("#table-frise").css("padding-top", ((12*h/1000))+"px");
	$("#ligne2").css("font-size", ((12*h/1000))+"px");
	$("#ligne3").css("font-size", ((24*h/1000))+"px");
	$(window).resize(function(){
		var w=$(window).width();
		var h=$(window).height();
	$("body").css("font-size",((w*h/1000000)+0.8)+"em");
	$("#info-salle").css("top", (-(w*h/2000000)+2)+"em");
	$("#entete").css("font-size",(-(w*h/10000)+370)+"%");
	$(".menu_hour").css("padding-top",(w*(-1/400)+5)+"%");
	$("#nom-salle").css("font-size",((w*h/400000)+1.3)+"em").css("left", (w*(1/322)+20)+"px");
	$("#hourPanel").css("font-size",((w*h/400000)+1.3)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/600000)+2)+"em").css("left", (w*(1/322)+15)+"px");
	$("#table-frise").css("padding-top", ((12*h/1000))+"px");
	$("#ligne2").css("font-size", ((12*h/1000))+"px");
	$("#ligne3").css("font-size", ((24*h/1000))+"px");
	$(".heureFrise").css("font-size", ((12*h/1000)+10)+"px");
	});
	construireLaFrise();
	getUrbaToken(getRoomInfo);
	$(window).resize(function(){
	afficherHeureSurFrise();
	});
}

 function getUrbaToken(function1, param1){
 $.ajax({
		url : FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/authentication/getToken?login='+FreebusyRoom.login+'&password='+FreebusyRoom.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidToken',
		crossDomain: true,
		fail: function() {
		getUrbaToken(function1, param1);
		},
		success: function(){
		function1(param1);
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

function getUrlParameters(){//permet de recuperer les parametres dans l'URL pour filtrer les info ï¿½ afficher
	var allArg;
	allArg= document.location.search;//recuperation de la requete contenue dans l'URL
	FreebusyRoom.connectMode="http";// par defaut on utilise une connexion http
	var t;
	t=allArg.replace("?","");
	var t1=[];
	t1=t.split("&");
	var i;
	for(i=0;i<t1.length;i++){
		switch (t1[i].substring(0,6)){
		case "resour":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.ID= tmp[1];
		break;
		case "hideOw":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.hideOwner= tmp[1];
		break;
		case "hidePh":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.hidePhone= tmp[1];
		break;
		case "hideSu":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.hideSubject= tmp[1];
		break;
		case "isTact":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.tactile= tmp[1];
		break;
		case "isHttp":
		var tmp=[];
		tmp=t1[i].split("=");
		FreebusyRoom.http=tmp[1];
		isHTTP();
		break;
		}
	}
}

function isHTTP(){//permet de spécifier le type de connexion selectionné: HTTP ou HTTPS
if (FreebusyRoom.http=="true")
	FreebusyRoom.connectMode=="http";
else if (FreebusyRoom.http=="false")
	FreebusyRoom.connectMode="https";
}

function getRoomInfo(){
	$.ajax({
			url: FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/api/v1/resources/'+FreebusyRoom.ID+'?Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomInfo',	
			crossDomain: 'true'
		});
}

function getFreeRoomList(){
	$.ajax({
			type: "GET",
			url : FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/api/v1/resources?free=between,'+createDuration()+'&Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'checkRoomVacancy',
			error: function(jqXHR, textStatus, errorThrown) {
			  console.log(textStatus, errorThrown);
			}
		}).fail(function() {console.log("211"); getUrbaToken(getFreeRoomList);});
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
	getUrbaToken(getResInfo);
}
	
function fillRoomInfo(objJson){
	$("title").html('Salle '+objJson.displayName);
	$("#nom-salle").append(objJson.displayName);
	FreebusyRoom.roomName=objJson.displayName;
	FreebusyRoom.startTime=objJson.resourceProfil.startTime;
	FreebusyRoom.endTime=objJson.resourceProfil.endTime;
	getUrbaToken(getFreeRoomList);
}

function pingServeur(){//permet de récupérer l'heure sur l'api public timeapi.org
$.ajax({
    url: 'http://timeapi.org/utc/now.json',
    dataType: 'jsonp',
	jsonpCallback:'isDeviceOnTime'
});
}

function isDeviceOnTime(server){//permet de vérifier que le client est à l'heure
	var t=[];
	var w=new Date(server.dateString);
	var serverTime=w.toUTCString();
	console.log("server time="+serverTime);
	var tempo= new Date();
	var all=tempo.toUTCString();//la date locale est convertie au temps UTC ce qui permet de gérer les changements d'heures
	console.log("local time="+all);
	var text=[];
	text=serverTime.split(" ");
	var nt=all.split(" ");
	var hms=[];
	hms=nt[4].split(":");
	var m= parseInt(hms[1],10);
	var h= parseInt(hms[0],10);
	t=text[4].split(":");
	var m2=parseInt(t[1],10);
	var h2=parseInt(t[0],10);
	if (h-h2!=0 || Math.abs(m-m2)>=10)// s'il y a un décalage d'aumoins 15 minutes alors signaler!
		alert("Attention l'heure de cet appareil doit etre verifiee!");
}

function getResInfo() {
	var startDate=createStartDate();
	var endDate=createEndDate();
	var geturl=$.ajax({
			url : FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResListforRoom'
			}).fail(function() {console.log("275"); getUrbaToken(getResInfo);});	
}

function fillResListforRoom(objJson) {// tri par id de la salle
	var ligne=0;
	var j=0;
	var jsonLocal=[];
	var resList=[];
	$.each(objJson, function(key, value) {
			if (objJson[ligne].resource.id==FreebusyRoom.ID) {
				//var resID=objJson[ligne].id;//Id de la reservation
				var now=getTime();
				var sD=(objJson[ligne].startDate).split("T");
				var startHour=(sD[1]).split(":");
				var start=""+startHour[0]+":"+startHour[1];
				var eD=(objJson[ligne].endDate).split("T");
				var endHour=(eD[1]).split(":");
				var end=""+endHour[0]+":"+endHour[1];
				jsonLocal[j]={startH:start,endH:end};// recuperation de l'heure de dÃ©but et de fin dans un JSON
					j++;
				if (compareTime(end,now)) {					
					var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone=objJson[ligne].fields[2].value;
					var order=objJson[ligne].idOrder;
					var presenceConf=false;
					var resID=objJson[ligne].id;
					
					console.log(objJson[ligne].presenceConfirmedDate);
					
					if (objJson[ligne].presenceConfirmedDate)
						presenceConf=true;
					
					resList[ligne]=[start,end,owner,ownerPhone,subject, order, presenceConf, resID]
				}
			}
		ligne++;
	});
	remplirLaFrise(jsonLocal);
	sortResList(resList);	
}

function getOrder(id) {
	$.ajax({	
		type: "GET",
		url : FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/api/v1/orders/'+id+'?Token='+FreebusyRoom.validToken,
		dataType : 'jsonp',
		jsonpCallback: 'fillOrder',
		error: function(jqXHR, textStatus, errorThrown) {
		  console.log(textStatus, errorThrown);
		}
	}).fail(function() {console.log("319");  getUrbaToken(getOrder(id)); });
}

function fillOrder(json) {
	for (i=0;i<json.roomServiceGroups.length;i++) {
		for(j=0;j<json.roomServiceGroups[i].orderItems.length;j++) {
			console.log(i+","+j+","+json.roomServiceGroups[i].orderItems[j].displayName);
			if (json.roomServiceGroups[i].orderItems[j].value!=0) {
				$('#info-res-presta').append(json.roomServiceGroups[i].orderItems[j].displayName+" ("+json.roomServiceGroups[i].orderItems[j].value+")");
			}
		}
	}

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
		if (compareTime(res[0],nowPlusTemp)) {//Si la prochaine rï¿½servation est dans plus d'une demi-heure
			if (FreebusyRoom.vacancy) {//Si la salle appartient bien ï¿½ la liste des salles libres
//-----------Salle libre--------------
				var temps="jusqu'Ã  "+res[0];
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
				if (FreebusyRoom.tactile=="true") $(".btn_res").show();
				else $(".btn_res").hide();
				$("#info-res-title").html("Prochaine rÃ©union :");
				$(".loadgif").hide();
				$("#b_conf").hide();
				$("#b_vide").hide();				
				console.log("libre");
			}
			else {//La salle n'appartient pas ï¿½ la liste des salles libres
//-------Salle indisponible--------------
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat").html("Indisponible").css({"color":"#ed1b24"});
			$(".loadgif").hide();
			$("#b_conf").hide();
			$("#b_vide").hide();
			$(".btn_res").hide();
			}
		}
		else {//la rï¿½servation commence dans moins d'une demi-heure ou a commencï¿½
//------Salle occupï¿½e----------------
			var temps="jusqu'Ã  "+res[1];
			$('#info-res-presta').html('');
			$("#entete").css({"background-color":"#233a40"});
			var resStartTimePlusTemp=addTime(res[0],"0:15");
			FreebusyRoom.resId=res[7];
			FreebusyRoom.state="busy";//marque la salle comme occupï¿½e!!!
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat").html("Occup\351").css({"color":"#ed1b24"});
			$("#temps").html(temps);
			if (FreebusyRoom.tactile=="true") {
				console.log(FreebusyRoom.tactile=="true");
				if(compareTime(resStartTimePlusTemp, now)) {
					$("#b_vide").hide();
					}
				else {
					$("#b_vide").show();
				}
			}
			else $("#b_vide").hide();
			if (res[6]) $("#b_conf").hide();
			else if ((!res[6])&&(FreebusyRoom.tactile=="true")) $("#b_conf").show();
			$("#info-res-title").html("RÃ©union actuelle:");
			$(".loadgif").hide();
			$(".btn_res").hide();
		}
		console.log(res);
		var sujet="";
		if(!FreebusyRoom.hideSubject)
			if(res[4]) {sujet=' - '+'"'+res[4]+'"';}
		var duree="De "+res[0]+" Ã  "+res[1]+sujet;
		$("#info-res-horaires").html(duree);
		if (!FreebusyRoom.hideOwner) {
			var owner=res[2];
		}
		var ownerPhone="";
		if (!FreebusyRoom.hidePhone) {
			if(res[3]) var ownerPhone=" - "+res[3];
		}
		var ownerInfo=owner+ownerPhone;
		if (ownerInfo!="undefined")
			$("#info-res-owner").html(ownerInfo);
			
		if (res[5]!=0) {
		$('#info-res-presta').html('<img src="prestation.png" style="width:1em;vertical-align:-15%;"> Prestations li\351es');
			//getUrbaToken(getOrder)
		}
	}
	else {//il n'y a pas de rï¿½servation d'ici la fin de la journï¿½e
		if (FreebusyRoom.vacancy) {//si la salle est libre (et non-indisponible)
//-------Salle libre-----------
				$("#sub").append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(60)"> 1 h </div></li>');
				$("#sub").append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(90)"> 1 h 30 </div></li>');
				$("#sub").append('<li><div type="button" id="b_res120" class="menu_hour" onClick="res_demand(120)"> 2 h </div></li>');
			var w=$(window).width();
			$('#info-res-presta').html('');
			$(".menu_hour").css("padding-top",(w*(-1/400)+5)+"%");
			$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
			$("#screenBorder").css({"background-color":"#38b54d"});
			$("#nom-salle").css({"color":"#d7f0db"});
			$("#etat").html("Libre").css({"color":"#38b54d"});
			if (FreebusyRoom.tactile=="true") $(".btn_res").show();
			else $(".btn_res").hide();
			$("#info-res-title").html("Pas d'autre rÃ©servation prÃ©vue aujourd'hui");
			$(".loadgif").hide();
			$("#b_vide").hide();
			$("#b_conf").hide();
			$("#temps").html("")
			$("#info-res-horaires").html("");
			$("#info-res-owner").html("");
			console.log("libre toute la journée");
		}
		else {//si la salle est indisponible
//-------Salle indisponible-----------
		FreebusyRoom.state="busy";
		$('#info-res-presta').html('');
		$("body").css({"background-color":"#fad2d3"});
		$("#screenBorder").css({"background-color":"#ed1b24"});
		$("#nom-salle").css({"color":"#fad2d3"});
		$("#etat").html("Indisponible").css({"color":"#ed1b24"}).css({"padding-left":"19%"});
		$(".loadgif").hide();
		$("#b_vide").hide();
		$(".btn_res").hide();
		$("#b_conf").hide();
		$("#temps").html("")
		$("#info-res-horaires").html("");
		$("#info-res-owner").html("");
		console.log("indisponible sans res");
		}
	}
	setTimeout(function() {window.location.reload();},3600000);
	setTimeout(function() {refresh();},300000);
}

function refresh() {
	location.reload();
	getUrbaToken(getFreeRoomList);
}

function createDate() {
	var today= new Date();
	var year=today.getFullYear();
	var month=today.getMonth()+1;
	var day=today.getDate();
	
	if (month<10) month="0"+month;
	if (day<10) day="0"+day;
	var theDate=""+year+"-"+month+"-"+day;
	
	return theDate;
}

function createStartTime(){//faire commencer au quarteur précédent
	var now=getTime();
	var t=[];
	t=now.split(":");
	m=parseInt(t[1],10);	
	if (m<15) m="00";
	else if (m<30) m="15";
	else if (m<45) m="30";
	else if (m>=45) m="45";
	var startTime=""+t[0]+":"+m+":00";//retourne l'heure actuelle au format hh:mm:00
	return startTime;
}

function createEndTime() {
	var now=createStartTime();	
	var endTime=addTime(now,FreebusyRoom.timeRes)+":00";
	return endTime;
}

function createJsonRes(){
	jsonToSend = '{"id":0,"date":"'+createDate()+'T00:00:00","startDate":"'+createDate()+'T'+createStartTime()+'","endDate":"'+createDate()+'T'+createEndTime()+'","fields":[{"name":"ecran","value":"Ecran","key":"Champ1"},{"name":null,"value":"Ecran","key":"Champ2"},{"name":null,"value":"","key":"Champ3"},{"name":null,"value":"","key":"Champ4"},{"name":null,"value":"","key":"Champ5"},{"name":null,"value":"","key":"Champ6"},{"name":null,"value":"","key":"Champ7"},{"name":null,"value":"","key":"Champ9"},{"name":null,"value":"","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"'+createDate()+'T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"ThÃ©o","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":'+FreebusyRoom.ID+'},"presenceConfirmedDate":"'+createDate()+'T00:00:00'+'"}'
	
	return jsonToSend;
}

function sendRes(){
	var jsonRes=createJsonRes();
	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token="+FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data: jsonRes
		}).done(function( msg ) {
		location.reload();
	});
}
function getBookingToStop(){//recupère la resa à terminer!
	$.ajax({
		type: "GET",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings/"+FreebusyRoom.resId+"?Token="+FreebusyRoom.validToken,
		dataType : 'jsonp',
		jsonpCallback:"changeEndTime"
		})
}
function toUrbaFormat(){// renvoie l'heure locale à la seconde près au format de Urba
var d= new Date();
var d2=d.toJSON();//renvoie une date au format aaaa-mm-jjThh:mm:ss
var d3=d.toTimeString()//renvoie une date au format hh:mm:ss GMT+002
var d31=d3.split(" ");
var d4=d2.split("T");
var d5=d4[0]+"T"+d31[0];
return d5;
}
function changeEndTime(json){// modification de l'heure de fin de la resa à terminer
var t=toUrbaFormat();

var t2=t.split(".");
var t3=t2[0].split("T");//recuperation de la date du jour
var heureFinale=t3[0]+"T"+createStartTime();//createStartTime(): renvoie l'heure actuelle au format hh:mm:00 reglee au quart precedent
json.endDate=heureFinale;
getUrbaToken(sendBookingToStop,json);
}
function sendBookingToStop(jsonF){//Interrompt la reservation encours en envoyant un JSON qui modifie l'heure de fin et rafraichit l'écran!
var json=JSON.stringify(jsonF);
	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token="+FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data : json
		}).done(function(msg){
			location.reload();
			});
}
function getRes() {
	var geturl=$.ajax({
		url : FreebusyRoom.connectMode+'://demo.urbaonline.com/pjeecran/api/v1/bookings/'+FreebusyRoom.resId+'?&Token='+FreebusyRoom.validToken,
		dataType : 'jsonp',
		jsonpCallback: 'updateResToConfirmPresence'
	}).fail(function() {console.log("275"); getUrbaToken(getResInfo);});	
}

function updateResToConfirmPresence(json) {//modification du champ "presenceConfirmedDate"
	json.presenceConfirmedDate=""+createDate()+"T00:00:00";
	getUrbaToken(sendPresenceConfirmation, json);
}

function sendPresenceConfirmation(jsonUpdateConfPres) {//confirmation de la reservation courante. Elle met à jour le champ "presenceConfirmedDate" dans l'API avec la date du jour.
	console.log(jsonUpdateConfPres);
	json=JSON.stringify(jsonUpdateConfPres);

	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token="+FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data:json
		}).done(function( msg ) {
		location.reload();
		});
}

function button_res() {
	if (FreebusyRoom.bResPushed) {
		$("#sub").hide();
		$("#sub li").hide();
		$(".menu_hour").hide();
		FreebusyRoom.bResPushed=false;
		document.getElementById("b_res_arrow").src = "arrow_d.png";
	}
	else {
		document.getElementById("b_res_arrow").src = "arrow_u.png";
		$("#sub").show();
		$("#sub li").show();
		$(".menu_hour").show();
		FreebusyRoom.bResPushed=true;
	}
}

function res_demand(minutes) {
		$("#b_res"+minutes).css({"background-color":"#38b54d"});
		if (FreebusyRoom.pushed==0) {
			$("#b_res"+minutes).prepend('<img src="load_green.gif">');
			FreebusyRoom.pushed=1;
		}
		FreebusyRoom.timeRes=Math.floor(minutes/60)+":"+minutes%60;
		getUrbaToken(sendRes);
		var st=createStartTime().replace(":00","");
		var en=createEndTime().replace(":00","");
		alert("Vous avez reserv\351 la salle "+FreebusyRoom.roomName+" de "+st+' \340 '+en);//\340=à \351=é
}
function construireLaFrise(){// juste dessiner le squelette de la frise.
	var i;
	var tmp1, tmp2;
	var startH, startMin;
	var endH, endMin;
	for (i=8;i<20;i++){
		$("#ligne1").append('<td width="8.33%" class="caseFrise heureFrise" colspan="4">'+i+'h</td>');
		$("#ligne2").append('<td width="8.33%" style="font-size:25%" class="caseFrise traitSeparation" colspan="4">&nbsp;</td>');
		for(var j=1; j<=4; j++){// division de chaque tranche d'heure en quatre (graduation selon le 1/4 d'heure)
		$("#ligne3").append('<td class="caseFrise" heigth="10px" id="case'+i+''+j+'"> &nbsp;</td>');
		$("#case"+i+""+j).css('background','white');
		}
	}
	var h=$(window).height();
	$(".heureFrise").css("font-size", ((12*h/1000)+10)+"px");
}
function remplirLaFrise(json){// remplissage de la frise avec les couleurs rouge/vert selon les occupations
	$.each(json, function(key, value){
		var all=[];
		all= value.startH.split(":");
		var starth= parseInt(all[0],10);//l'heure de debut de la resa
		var startm=parseInt(all[1],10);// les minutes de dï¿½but de la resa!
		all=value.endH.split(":");
		var endh=parseInt(all[0],10);// l'heure de fin
		var endm=parseInt(all[1],10);//les minutes de fin
		if(starth==endh){//si la resa a une duree inferieure a 1 heure
				var quartHeure;
				if(endm!=0)
					quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la resa
				else
					quartHeure=1;
				var l;
				var deb;
				if (startm!=0)
				deb=1+startm/15;//calcul du quart d'heure Ã  partir duquel commence la rÃ©sa
				else
				deb=1;
				for(l=deb;l<=quartHeure;l++){
				var idcasedebut="case"+starth+""+l;//l'id de la case Ã  colorier en rouge
				$("#"+idcasedebut).css('background','red');
				}
			}
		else{
		
			var k;
			for(k=starth;k<=endh;k++){
					if (k==endh){
						var quartHeure; // calcul du quart d'heure Ã  partir duquel commence la rÃ©sa
						if(endm!=0){
						
							quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la rÃ©sa
							}
						else
							quartHeure=0;// l'heure de fin de resa est du genre xh00
						var l;
						for(l=1;l<=quartHeure;l++){
						var idcasedebut="case"+k+""+l;//l'id de la case Ã  colorier en rouge
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
							var idcasedebut="case"+k+""+l;//l'id de la case Ã  colorier en rouge
							$("#"+idcasedebut).css('background','red');
							}
					}

				}
			}
	});

	setInterval(function(){afficherHeureSurFrise()},1000);
}
function afficherHeureSurFrise(){// pour afficher un curseur pour l'heure sur la frise
	var t;
	var uniteHeure=$(window).width()*0.0833;// calcul de la taille d'heure en pixel. 0.0833 est la largeur en pourcentage d'une unité d'heure.
	var uniteMinute=uniteHeure/60;// calcul d'une minute en pixel
	t = getTime();
	var t2=[];
	t2=t.split(":");
	var h=parseInt(t2[0],10);
	var m=parseInt(t2[1],10);
	var temp=h-8;
	var pos= temp*uniteHeure+m*uniteMinute-1;// calcul de la position en fonction de l'heure actuelle
	//console.log(pos);
	if(FreebusyRoom.state=="free")
		$("#frise").css('background-image','url(curseur-vert.png)');
	else
		if(FreebusyRoom.state=="busy")
			$("#frise").css('background-image','url(curseur-rouge.png)');
	$("#frise").css('background-position',pos);
	$("#frise").css('background-size','0.525% 100%');
	
}