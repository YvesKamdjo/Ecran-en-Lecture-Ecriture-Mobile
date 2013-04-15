var ecranEnLecture= new Object();
var refresh=false;
var bResPushed=false;
var timeRes="";

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
		  
function compareTime(time, ref) {
	var r=ref.split(":");
	var t=time.split(":");
	if (parseInt(t[0],10)<parseInt(r[0],10)) return false;
	else if ((parseInt(t[0],10)==parseInt(r[0],10))&&(parseInt(t[1],10)<parseInt(r[1],10))) return false;
	else return true;
	
}

function initDocument(){
	$("#sub").hide();
	$("#bouton").hide();
	$("#b_conf").hide();
	$("#link_back").css("width","10%");
	var w=$(window).width();
	var h=$(window).height();
	$("body").css("font-size",((w*h*1/1000000)+0.5)+"em");
	$("#entete").css("height",((w*h*1/5000000)+20)+"%");
	$("#entete").css("font-size",((w*h*1/1000000)+300)+"%");
	$("#hourPanel").css("top",40-(w*h*1/50000)+"%");
	$("#nom-salle").css("top",40-(w*h*1/50000)+"%");
	$("#b_res_arrow").css("width",((w*h*1/50000000)+0.6)+"em");
	$("#nom-salle").css("left",($("#entete").height())+"px");
	$(window).resize(function(){
		var w=$(window).width();
		var h=$(window).height();
		$("body").css("font-size",((w*h*1/1000000)+0.5)+"em");
		$("#b_res_arrow").css("width",((w*h*1/50000000)+0.6)+"em");
		$("#hourPanel").css("top",40-(w*h*1/50000)+"%");
		$("#nom-salle").css("top",40-(w*h*1/50000)+"%");
		$("#nom-salle").css("left",($("#entete").height())+"px");
		$("#entete").css("height",((w*h*1/1000000)+20)+"%");
		$("#link_img").css("height","100%");
	});
	getUrbaToken();
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
			jsonpCallback: 'fillResListforRoom',		
		})
		}
	catch(e){
	console.log(e);
	getRoomName();
	}
}

function fillResListforRoom(objJson) {
	var ligne=0;
	var roomID=getRoomID();
	var resList=[];
	
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
					var subject=objJson[ligne].fields[3].value;					
					var owner=objJson[ligne].fields[1].value;
					var ownerPhone=objJson[ligne].fields[2].value;
					resList[ligne]=[start,end,owner,ownerPhone,subject]
				}
			}
		ligne++;
	});
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
	if (list.length>0) {
		res=list[0];
		if (compareTime(res[0],now)) {
			var temps="jusqu'à "+start;
			$("body").css({"background-color":"#d7f0db"});
			$("body").css({"border-left":"10px solid #38b54d"});
			$("#nom-salle").css({"color":"#d7f0db"});
			$("#etat").append("Libre");
			$("#etat").css({"color":"#38b54d"});
			$("#etat-libre").css({"left":"2%"});
			$("#temps").html(temps);
			$("#bouton").show();
			$("#info-res-title").html("Prochaine réunion :");
		}
		else {
			var temps="jusqu'à "+end;
			$("body").css({"background-color":"#fad2d3"});
			$("body").css({"border-left":"10px solid #ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			$("#etat").append("Occupée");
			$("#etat-libre").css({"left":"20%"});
			$("#etat").css({"color":"#ed1b24"});
			$("#temps").html(temps);
			//$("#b_conf").show();
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
		$("#info-res-title").html("Pas de réservation prévue aujourd'hui");
		$("body").css({"background-color":"#d7f0db"});
		$("body").css({"border-left":"10px solid #38b54d"});
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
	var endTime=addTime(now,timeRes)+":00";
	console.log(endTime);
	return endTime;
}

function createJsonRes(){
	jsonToSend = '{"id":0,"date":"'+createDate()+'T00:00:00","startDate":"'+createDate()+'T'+createStartTime()+'","endDate":"'+createDate()+'T'+createEndTime()+'","fields":[{"name":"ecran","value":"écran","key":"Champ1"},{"name":null,"value":"écran","key":"Champ2"},{"name":null,"value":"","key":"Champ3"},{"name":null,"value":"","key":"Champ4"},{"name":null,"value":"","key":"Champ5"},{"name":null,"value":"","key":"Champ6"},{"name":null,"value":"","key":"Champ7"},{"name":null,"value":"","key":"Champ9"},{"name":null,"value":"","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"'+createDate()+'T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"Théo","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":'+getRoomID()+'}}'
	
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
	getTokenWrite();
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
		alert( "Salle Réservée " + msg );
		location.reload();
	});
}

function button_res() {
	if (bResPushed) {
		$("#sub").hide();
		bResPushed=false;
		document.getElementById("b_res_arrow").src = "arrow_d.png";
	}
	else {
		document.getElementById("b_res_arrow").src = "arrow_u.png";
		$("#sub").show();
		bResPushed=true;
	}
}

function res_demand(minutes) {
		$("#b_res"+minutes).css({"background-color":"#38b54d"});
		timeRes=Math.floor(minutes/60)+":"+minutes%60;
		getTokenWrite();
}
