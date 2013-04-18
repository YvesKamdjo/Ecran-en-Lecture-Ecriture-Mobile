var FreebusyRoom= new Object();

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

function initDocument(){
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
	$("#nom-salle").css("font-size",((w*h/500000)+1)+"em").css("left", (w*(1/322)+20)+"px").css("top", (w*(1/322)-8)+"px");
	$("#hourPanel").css("font-size",((w*h/500000)+1)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/1000000)+2)+"em").css("left", (w*(1/322)+15)+"px").css("top", (w*(1/1200)+3)+"px");
	$(window).resize(function(){
		var w=$(window).width();
		var h=$(window).height();
		console.log(w);
	$("body").css("font-size",((w*h/1000000)+0.5)+"em");
	$("#info-salle").css("top",(w*(-1/322)+10+"%"));
	$(".menu_hour").css("margin-top",(w*(-4/322)+25)+"%");
	$("#nom-salle").css("font-size",((w*h/500000)+1)+"em").css("left", (w*(1/322)+20)+"px").css("top", (w*(1/322)-8)+"px");
	$("#hourPanel").css("font-size",((w*h/500000)+1)+"em");
	$("#b_res_arrow").css("width",((w*h/5000000)+0.5)+"em").css("margin-left",((w*h/100000))+"%");
	$("#link_img").css("height", ((w*h/1000000)+2)+"em").css("left", (w*(1/322)+15)+"px").css("top", (w*(1/1200)+3)+"px");
	});
	getUrbaToken();
}

 function getUrbaToken(){
 $.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+FreebusyRoom.login+'&password='+FreebusyRoom.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidToken',			
	});	
}

function setValidToken(newToken){
	FreebusyRoom.validToken= newToken.Token;
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
	var roomID=getRoomID();
	$.ajax({
			url: 'http://demo.urbaonline.com/pjeecran/api/v1/resources/'+roomID+'?Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomName',		
		});
}
	
function fillRoomName(objJson){
	$("#nom-salle").append(objJson.displayName);
	getResInfo();
}

function getResInfo() {
	var startDate=createStartDate();
	var endDate=createEndDate();
	//var roomID=getRoomID();
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillResListforRoom',		
		});
}

function fillResListforRoom(objJson) {
	var ligne=0;
	var j=0;
	var jsonLocal=[];
	var roomID=getRoomID();
	var resList=[];
	$.each(objJson, function(key, value) {
			if (objJson[ligne].resource.id==roomID) {
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
					jsonLocal[j]={startH:start,endH:end};// récupération de l'heure de début et de fin dans un JSON
					j++;
					resList[ligne]=[start,end,owner,ownerPhone,subject]
				}
			}
		ligne++;
	});
	construireLaFrise();
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
	console.log(nowPlusTemp);
	if (list.length>0) {
		res=list[0];
		console.log(res[0]);
		console.log("comp"+compareTime(res[0],nowPlusTemp));
		if (compareTime(res[0],nowPlusTemp)) {
			var temps="jusqu'à "+res[0];
			var dureeLibre=substractTime(res[0],now);
			if (compareTime(dureeLibre,"1:00")) {
				$("#sub").append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(60)"> 60 minutes </div></li>');
			}
			if (compareTime(dureeLibre,"1:30")) {
				$("#sub").append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(90)"> 90 minutes </div></li>');
			}
			var w=$(window).width();
			$(".menu_hour").css("margin-top",(w*(-4/322)+25)+"%");
			$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
			$("#screenBorder").css({"background-color":"#38b54d"});
			$("#nom-salle").css({"color":"#d7f0db"});
			$("#etat").append("Libre").css({"color":"#38b54d"});
			$("#temps").html(temps);
			$("#bouton").show();
			$("#info-res-title").html("Prochaine réunion :");
		}
		else {
			var temps="jusqu'à "+res[1];
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat-libre").css({"width":"100%"});
			$("#etat").append("Occupée").css({"color":"#ed1b24"}).css({"padding-left":"30%"});
			$("#temps").html(temps).css({"padding-left":"30%"});
			$("#b_conf").show();
			$("#info-res-title").html("Réunion actuelle:");
		}
		
		var sujet="";
		if(res[4]) {sujet=' - '+'"'+res[4]+'"';}
		var duree="De "+res[0]+" à "+res[1]+sujet;
		$("#info-res-horaires").html(duree);
		
		var owner=res[2];
		var ownerPhone="";
		if(res[3]) var ownerPhone=" - "+res[3];
		var ownerInfo=owner+ownerPhone;
		$("#info-res-owner").html(ownerInfo);
	}
	else {
		$("#sub").append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(60)"> 60 minutes </div></li>');
		$("#sub").append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(90)"> 90 minutes </div></li>');
		var w=$(window).width();
		$(".menu_hour").css("margin-top",(w*(-4/322)+25)+"%");
		$("#info-res-title").html("Pas de réservation prévue aujourd'hui");
		$("body").css({"background-color":"#d7f0db"});
		$("#screenBorder").css({"background-color":"#38b54d"});
		$("#nom-salle").css({"color":"#d7f0db"});
		$("#etat").append("Libre");
		$("#etat").css({"color":"#38b54d"});
		$("#bouton").show();
		}
	setTimeout(function() {location.reload();}, 300000);
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
	jsonToSend = '{"id":0,"date":"'+createDate()+'T00:00:00","startDate":"'+createDate()+'T'+createStartTime()+'","endDate":"'+createDate()+'T'+createEndTime()+'","fields":[{"name":"ecran","value":"écran","key":"Champ1"},{"name":null,"value":"écran","key":"Champ2"},{"name":null,"value":"","key":"Champ3"},{"name":null,"value":"","key":"Champ4"},{"name":null,"value":"","key":"Champ5"},{"name":null,"value":"","key":"Champ6"},{"name":null,"value":"","key":"Champ7"},{"name":null,"value":"","key":"Champ9"},{"name":null,"value":"","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"'+createDate()+'T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"Théo","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":'+getRoomID()+'}}'
	
	return jsonToSend;
}

 function getTokenWrite(){
 $.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+FreebusyRoom.login+'&password='+FreebusyRoom.password,
		dataType : 'jsonp',
		jsonpCallback: 'setValidTokenWrite',			
	});	
}

function setValidTokenWrite(newToken){
	FreebusyRoom.validToken= newToken.Token;
	sendRes();
}

function sendRes(){
	var jsonRes=createJsonRes();

	$.ajax({
		type: "POST",
		url: "http://demo.urbaonline.com/pjeecran/api/v1/Bookings?Token=" +FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data: jsonRes
		}).done(function( msg ) {
		alert( "Salle Réservée " + msg );
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
		getTokenWrite();
}
function construireLaFrise(){
	var i;
	var tmp1, tmp2;
	var startH, startMin;
	var endH, endMin;
	for (i=8;i<20;i++){
	$("#ligne1").append('<td width="8.33%" class="caseFrise" colspan="4">'+i+'h</td>');
	$("#ligne2").append('<td width="8.33%" class="caseFrise traitSeparation" colspan="4">&nbsp;</td>');
	for(var j=1; j<=4; j++){
	$("#ligne3").append('<td class="caseFrise" heigth="10px" id="case'+i+''+j+'"> &nbsp;</td>');
	$("#case"+i+""+j).css('background','white');
	}
}
}
function remplirLaFrise(json){
	$.each(json, function(key, value){
		var all=[];
		all= value.startH.split(":");
		var starth= all[0];
		var startm=all[1];
		all=value.endH.split(":");
		var endh=all[0];
		var endm=all[1];
		//console.log(endh);
		if(starth==endh){//si c'est dans la même heure
			
				var quartHeure;
				if(endm!="00")
					quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la résa
				else
					quartHeure=1;
				var l;
				var deb;
				if (startm!="00")
				deb=1+startm/15;
				else
				deb=1;
				console.log(quartHeure);
				for(l=deb;l<=quartHeure;l++){
				var idcasedebut="case"+starth+""+l;//l'id de la case à colorier en rouge
				$("#"+idcasedebut).css('background','red');
				}
			}
		else{
		//console.log(starth);
		
		var k;
		for(k=starth;k<=endh;k++){
				if (k==endh){
					var quartHeure; // calcul du quart d'heure à partir duquel commence la résa
					console.log(endm);
					if(endm!="00"){
					
						quartHeure= endm/15; // calcul du quart d'heure jusqu'auquel se termine la résa
						}
					else
						quartHeure=1;
					var l;
					console.log(quartHeure);
					for(l=1;l<=quartHeure;l++){
					var idcasedebut="case"+k+""+l;//l'id de la case à colorier en rouge
					$("#"+idcasedebut).css('background','red');
					}
				}
				else{
					var l;
					var deb;
					if(startm!="00")
						deb=1+startm/15;
					else
						deb=1;
					for(l=deb;l<=4;l++){
					var idcasedebut="case"+k+""+l;//l'id de la case à colorier en rouge
					$("#"+idcasedebut).css('background','red');
					}
			}
		}
	}
	});
}