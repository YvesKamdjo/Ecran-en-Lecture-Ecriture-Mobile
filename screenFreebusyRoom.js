var FreebusyRoom= new Object();
FreebusyRoom.pushed=0;

function setIdentification(log, pass, url){
	FreebusyRoom.login=log;
	FreebusyRoom.password=pass;
	FreebusyRoom.url=url;
}

function createDuration(min){//créer une duree au format urba (impossible de demander moins de 30 min) ex:"2013-05-31T10:42:00,2013-05-31T11:12:00"
	var now= new Date();
	var hour = now.getHours(); 
	var minute = now.getMinutes();
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; }
	
	var later=addMinutes(now,min);
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

function cutLongRoomName(stringToCut) {//Coupe le nom de la salle quand trop long ex: sur un portable en portrait "Bureau des geeks" devient "Bureau d..."
	var shortedString=stringToCut;
	var w=$(window).width();
	var p=parseInt($("#nom-salle").css("font-size"),10);
	if (w>350) var nbCharacter=Math.floor(w/p);
	else var nbCharacter=Math.floor(0.7*w/p);
	if (nbCharacter<6) nbCharacter=5;
	n=stringToCut.length;
	if (n>nbCharacter) {
		if (stringToCut.charAt(nbCharacter)==" ") nbCharacter-=1;
		shortedString=stringToCut.substr(0,nbCharacter)+"...";
	}
	return shortedString;
}

function generalDisplay() {// gère l'apparence de la page
	var sel=$("#frise");
	var w=$(window).width();
	var h=$(window).height();

	if ((w*h)<1000000) $("body").css("font-size",((w*h/40000)+10)+"px");
	else $("body").css("font-size",40+"px");

	if (FreebusyRoom.roomName) $("#nom-salle").html(cutLongRoomName(FreebusyRoom.roomName));//raccourci le nom de la salle si besoin est
	
	if (h>w) {//si on est en mode portrait
		if (h<400) {
			sel.css("height","20%").css("padding-bottom","");
			$("body").css("font-size",((w*h/70000)+10)+"px");
			$("#info-salle").css("top", 1+"em");
			sel.css("height","22%").css("padding-bottom","");
			$("#sub").css("font-size","120%");
		}
		else if (h<600) {
			$("#info-salle").css("top", 1+"em");
			sel.css("height","22%").css("padding-bottom","");
			$("#sub").css("font-size","150%");
		}
		else {
			$("#info-salle").css("top", 1.5+"em");
			sel.css("height","15%");
			$("#sub").css("font-size","150%");
		}
		$("#b_conf").attr("class", "b_conf_h");
		$("#b_vide").attr("class", "b_vide_h");
		$("#entete").css("font-size", 180+"%");
		$("#bouton").attr("class", "b_res_h btn_res");
		$("#etat-libre").css("width", "70%");
		$("#info-res").css("bottom","25%").css("width", "80%").css("font-size", 115+"%").css("margin-left","");
	}
	else {// si on est en mode paysage
		if (w<350) $("#bouton").attr("class", "b_res_h btn_res");
		else $("#bouton").attr("class", "b_res_w btn_res");
	
		if (h<220) {
			$("#b_conf").css("float","").css("right", 35+"%").css("top", 40+"%");
			$("#b_vide").css("float","").css("top", 40+"%").css("bottom","");
		}
		else {
			$("#b_conf").css("float","right").css("right", 5+"%").css("top", 6+"em");
			$("#b_vide").css("float","right").css("top", "").css("bottom", 25+"%");
		}
		
		if (h<350) $("#info-res").css("font-size", 80+"%").css("margin-left","1em");
		else $("#info-res").css("font-size", 115+"%").css("margin-left","");
	
		if (h<600) {
			$("#info-salle").css("top", 0.2+"em");
			sel.css("height","").css("padding-bottom",0.5+"em");
			$("#sub").css("font-size","90%");
		}
		else {
			$("#info-salle").css("top", 1+"em");
			sel.css("height","").css("padding-bottom",1+"em");
			$("#sub").css("font-size","100%");
		}
		$("#entete").css("font-size", 200+"%");
		$("#b_conf").attr("class", "b_conf_w");
		$("#b_vide").attr("class", "b_vide_w");
		$("#etat-libre").css("width", "40%");
		$("#info-res").css("bottom","20%").css("width", "70%");

	}
}

function setBackLinkUrl(){// etablit le lien entre l'interface des salles et l'interface recapitulative
	var screen=jaaulde.utils.cookies.get('screenList');
	var href="screenFreebusy.html?lang="+FreebusyRoom.lang+"&defaultPage="+FreebusyRoom.home+"&touchScreenType="+screen;
	var resources=jaaulde.utils.cookies.get('resourcesList');	
	if(resources){//tiens compte si les salles ont été regroupées, par exemple par étage,...
		href+="&listResourccesDisplayed="+resources;
		}
	
	return href;
}

function initDocument(){//initialisation
	setUrlParameters();//récupère les paramètres url
	pingServeur();//vérification de l'heure
	setlanguage();
	$("#link_back").attr("href",setBackLinkUrl());//donne la bonne adresse au lien vers la liste des salles (avec les bons paramètres)
	FreebusyRoom.getBookingToStop="false";
	if ((FreebusyRoom.tactile=="readonly")||(FreebusyRoom.btnList=="false")) $("#link_back").hide();//cache le bouton de retour si les paramètres le demandent
	FreebusyRoom.vacancy=false;
	FreebusyRoom.bResPushed=false;
	FreebusyRoom.timeRes="";
	showTime();//montre l'heure
	$(".btn_res").hide();
	$("#sub").hide();
	$("#sub li").hide();
	$(".menu_hour").hide();
	$("#b_conf").hide();
	generalDisplay();//met en place le design de la page
	saveParamInCookies();//sauve les paramètres dans des cookies pour qu'ils puissent être réutilisés depuis la liste des salles
	
	$(window).resize(function(){// en cas de redimensionnement de la fenêtre, l'affichage s'adapte
		generalDisplay();
		afficherHeureSurFrise();
	});
	construireLaFrise();
	getUrbaToken(getRoomInfo);
	
	if ((FreebusyRoom.home!=FreebusyRoom.ID)&&(FreebusyRoom.home!="none")) {//si la page par défaut n'est pas la page actuelle...
		inactivityTimeout();//on commence le compte à rebours pour y retourner en cas d'inactivité
	}
}

function inactivityTimeout() {//si la page est inactive plus de 2 min, on retourne à la page par défaut
	var homeTimeout = setTimeout(function(){returnHome();}, 120000);
	console.log("inactivity");
	document.onmousemove = function(){
		clearTimeout(homeTimeout);
		homeTimeout = setTimeout(function(){returnHome();}, 120000);
	}

	document.ontouchmove = function(){
		clearTimeout(homeTimeout);
		homeTimeout = setTimeout(function(){returnHome();}, 120000);
	}
}

function returnHome() {//liens vers la page par défaut
	var linkHome="";
	if (FreebusyRoom.home=="list") linkHome=setBackLinkUrl();
	else linkHome=document.location.protocol+"//"+document.location.host+""+document.location.pathname+'?resource='+FreebusyRoom.home+"&hideOwner=false&hidePhone=false&hideSubject=false&screen=capacitive&presenceConfirmation=true&lang=fr&defaultPage="+FreebusyRoom.home;
	window.location.href = linkHome;
}

 function getUrbaToken(function1, param1){// récupération d'un token dans le but de faire un appel ajax à l'api
 $.ajax({
		url : FreebusyRoom.connectProtocol+FreebusyRoom.url+'authentication/getToken?login='+FreebusyRoom.login+'&password='+FreebusyRoom.password,
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

function createStartDate() {//minuit le matin du jour même en format urba
	var today= new Date();
	startDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T00:00:00";
	return startDate;
}

function createEndDate() {//minuit le soir du jour même en format urba
	var today= new Date();
	endDate=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"T23:59:59";
	return endDate;
}

function setUrlParameters(){//permet de recuperer les parametres dans l'URL pour filtrer les info ï¿½ afficher
	FreebusyRoom.lang="fr";// par defaut on utilise le français!
	FreebusyRoom.tactile="capacitive";//par defaut c'est capacitif
	FreebusyRoom.connectProtocol=window.location.protocol;//receperation du mode de protocole de connexion
	var id=getURLParameter("resource");
	if(id!="null")
		FreebusyRoom.ID= id;
	var h=getURLParameter("hideOwner");
	if(h!="null")
		FreebusyRoom.hideOwner= h;
	var hi=getURLParameter("hidePhone");
	if(hi!="null")
		FreebusyRoom.hidePhone= hi;
	var hid=getURLParameter("hideSubject");
	if(hid!="null")
		FreebusyRoom.hideSubject= hid;
	var scre=getURLParameter("touchScreenType");
	if(scre!="null")
		FreebusyRoom.tactile= scre;
	var conf=getURLParameter("confirmationButton");
	if(conf!="null")
	FreebusyRoom.btnConf= conf;
	var l=getURLParameter("lang");
	if(l!="null")
		FreebusyRoom.lang=l
	var h=getURLParameter("defaultPage")
	if (h!="null") 
		FreebusyRoom.home=h;
	else 
		FreebusyRoom.home="none";
	var list=getURLParameter("roomListButton")
	if (list!="null") 
		FreebusyRoom.btnList=list;
}
function langForHoursChecking(lang,serv,device){
	if(lang=="fr")
		return "Attention l'heure de cet appareil doit etre verifiee. Serveur="+serv+" GMT Ecran="+device+" GMT";
	else if(lang=="en")
		return "Caution: You must check the time set for this device. Server="+serv+" GMT Device="+device+" GMT";
}
function setlanguage(){// permet de changer de langue d'affichage
	switch(FreebusyRoom.lang){
		case "fr":
			//FreebusyRoom.mHeure="Attention l'heure de cet appareil doit etre verifiee!";
			FreebusyRoom.mReunionAct="R&eacuteunion actuelle:";
			FreebusyRoom.mAutreReun="Pas d'autre r&eacuteservation pr&eacutevue aujourd'hui"
			$("#b_res").contents().filter("span").html('R&eacuteserver');
			$("#b_vide").contents().filter("span").html('Signaler<br>comme vide');
			$("#b_conf").contents().filter("span").html('Confirmer <br>ma presence');
			FreebusyRoom.freeOrLibre="Libre";
			FreebusyRoom.occOrBusy="Occup\351";
			FreebusyRoom.mProchOrNext="Prochaine r&eacuteunion :";
			FreebusyRoom.jusquOrUntil="jusqu\'&agrave ";
			FreebusyRoom.indisOrUnav="Indisponible";//FreebusyRoom.indispoOrUnav="Indisponible"
		break;
		case "en":
			//FreebusyRoom.mHeure="Caution: You must check the time set for this device";//message pour l'heure!
			FreebusyRoom.mReunionAct="Current booking:";
			FreebusyRoom.mAutreReun="There are no other bookings planned today";
			$("#b_res").contents().filter("span").text('Book');
			$("#b_vide").contents().filter("span").html('Report <br>As free');
			$("#b_conf").contents().filter("span").html('Confirm my <br>booking');
			FreebusyRoom.freeOrLibre="Free";
			FreebusyRoom.occOrBusy="Busy";
			FreebusyRoom.mProchOrNext="Next booking :";
			FreebusyRoom.jusquOrUntil="Until  ";
			FreebusyRoom.indisOrUnav="Unavailable";
		break;
	}
}

function bookingConfirmationMess(roomName,st,en,lang){//genere le message de confirmation lors d'une reservation.
	if(lang=="fr")
		return 'Vous avez reserv&eacute; la salle '+roomName+' jusqu\'&agrave; '+en;
	else if(lang=="en")
		return 'You have booked the room '+roomName+' until '+en;
}

function deOrFromAndAOrTo(debut,fin){//traduction français<=>anglais
	if(FreebusyRoom.lang=="fr")
		return "De "+debut+" &Agrave "+fin;
	else if(FreebusyRoom.lang=="en")
		return "From "+debut+" To "+fin;
}

function getRoomInfo(){// récupère les informations de la salle
	$.ajax({
			url: FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/resources/'+FreebusyRoom.ID+'?Token='+FreebusyRoom.validToken,
			dataType : 'jsonp',
			jsonpCallback: 'fillRoomInfo',	
			crossDomain: 'true'
		});
}

function getFreeRoomList(){// récupère la liste des salles libres
	$.ajax({
			type: "GET",
			url : FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/resources?free=between,'+createDuration(30)+'&Token='+FreebusyRoom.validToken,
			dataType:  'jsonp',
			jsonpCallback: 'checkRoomVacancy',
			error: function(jqXHR, textStatus, errorThrown) {
			  console.log(textStatus, errorThrown);
			}
		}).fail(function() {console.log("211"); getUrbaToken(getFreeRoomList);});
}

function checkRoomVacancy(objJson) {//vérifie si la salle est dans la liste des salles libres
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
	var w=$(window).width();
	var h=$(window).height();
	$("title").html('Salle '+objJson.displayName);
	if (h>w) var roomName=cutLongRoomName(objJson.displayName,10);
	else var roomName=cutLongRoomName(objJson.displayName,20);
	$("#nom-salle").html(roomName);
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
	var w=new Date(server.dateString);
	var serverTime=w.toUTCString();
	var tmpTime=serverTime.replace(" GMT","");
	var tmpServ=Date.parse(tmpTime);//conversion en milliseconds
	var tempo= new Date();
	var all=tempo.toUTCString();//la date locale est convertie au temps UTC ce qui permet de gérer les changements d'heures
	var local=all.replace(" GMT","");
	var tmpLocal=Date.parse(local);//conversion en milliseconds
	if(Math.abs(tmpLocal-tmpServ)>900000)//s'il y a un décalage d'aumoins 15 minutes=900000 ms alors signaler!
		alert(langForHoursChecking(FreebusyRoom.lang,text[4],nt[4]));//"Attention l'heure de cet appareil doit etre verifiee!"= mHeure
}

function getResInfo() {//récupère les réservations
	var startDate=createStartDate();
	var endDate=createEndDate();
	var geturl=$.ajax({
			url : FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+FreebusyRoom.validToken,
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

function getOrder(id) {//les prestations associées à la réservation
	$.ajax({	
		type: "GET",
		url : FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/orders/'+id+'?Token='+FreebusyRoom.validToken,
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

function sortResList(list) {//tri des réservation par ordre chronologique
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

function fillResInfos(list) {//rempli les infos liées à la réservation sur la page
	var now=getTime();
	var sub=$("#sub");
	var etat=$("#etat");
	var nowPlusTemp=addTime(now,"0:30");
	
	FreebusyRoom.state="free";//marque la salle comme libre!
	if (list.length>0) {
		res=list[0];
		if (compareTime(res[0],nowPlusTemp)) {//Si la prochaine rï¿½servation est dans plus d'une demi-heure
			if (FreebusyRoom.vacancy) {//Si la salle appartient bien ï¿½ la liste des salles libres
//-----------Salle libre--------------
				var temps=FreebusyRoom.jusquOrUntil+res[0];
				var dureeLibre=substractTime(res[0],now);
				if (compareTime("0:45",dureeLibre)) {
					$("#b_res60").attr("onClick","res_demand(30)");
				}
				if ((compareTime(dureeLibre,"1:15"))&&($("#b_res60").length==0)) {
					sub.append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(75)"> 1 h </div></li>');
				}
				if ((compareTime(dureeLibre,"1:45"))&&($("#b_res90").length==0)) {
					sub.append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(105)"> 1 h 30 </div></li>');
				}
				if ((compareTime(dureeLibre,"2:15"))&&($("#b_res120").length==0)) {
					sub.append('<li><div type="button" id="b_res120" class="menu_hour" onClick="res_demand(135)"> 2 h </div></li>');
				}
				var w=$(window).width();
				$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
				$("#screenBorder").css({"background-color":"#38b54d"});
				$("#nom-salle").css({"color":"#d7f0db"});
				etat.html(FreebusyRoom.freeOrLibre).css({"color":"#38b54d"});
				$("#temps").html(temps);
				if (FreebusyRoom.tactile!="readonly") $(".btn_res").show();
				else $(".btn_res").hide();
				$("#info-res-title").html(FreebusyRoom.mProchOrNext);//mProchOrNext="Prochaine r&eacuteunion :"
				$(".loadgif").hide();
				$("#b_conf").hide();
				$("#b_vide").hide();				
				
				var sujet="";
				if(FreebusyRoom.hideSubject=="false")
					if(res[4]) {sujet=' - '+'"'+res[4]+'"';}
					var fin=res[1]+sujet;
				var duree=deOrFromAndAOrTo(res[0],fin);//deOrFromAndAOrTo(debut,fin);
				$("#info-res-horaires").html(duree);
				if (FreebusyRoom.hideOwner=="false") {
					var owner=res[2];
				}
				var ownerPhone="";
				if (FreebusyRoom.hidePhone=="false") {
					if(res[3]) var ownerPhone=" - "+res[3];
				}
				var ownerInfo=owner+ownerPhone;
				if (ownerInfo!="undefined")
					$("#info-res-owner").html(ownerInfo);
					
				if (res[5]!=0)
				$('#info-res-presta').html('<img src="prestation.png" style="width:1em;vertical-align:-15%;"> Prestations li\351es');	
			}
			else {//La salle n'appartient pas ï¿½ la liste des salles libres
//-------Salle indisponible--------------
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			etat.html(FreebusyRoom.indisOrUnav).css({"color":"#ed1b24"});//FreebusyRoom.indisOrUnav="Indisponible"
			$(".loadgif").hide();
			$("#b_conf").hide();
			$("#b_vide").hide();
			$(".btn_res").hide();
			}
		}
		else {//la reservation commence dans moins d'une demi-heure ou a commence
//------Salle occupee----------------
			var temps=FreebusyRoom.jusquOrUntil+getNextFreeTime();//FreebusyRoom.jusquOrUntil="jusqu'&agrave;  "
			$('#info-res-presta').html('');
			$("#entete").css({"background-color":"#233a40"});
			var resStartTimePlusTemp=addTime(res[0],"0:15");
			FreebusyRoom.resId=res[7];
			FreebusyRoom.state="busy";//marque la salle comme occupï¿½e!!!
			$("body").css({"background-color":"#fad2d3"});
			$("#screenBorder").css({"background-color":"#ed1b24"});
			$("#nom-salle").css({"color":"#fad2d3"});
			etat.html(FreebusyRoom.occOrBusy).css({"color":"#ed1b24"});
			$("#temps").html(temps);
			if (FreebusyRoom.tactile!="readonly") {
				if(compareTime(resStartTimePlusTemp, now)) {
					$("#b_vide").hide();
					}
				else {
					$("#b_vide").show();
				}
			}
			else $("#b_vide").hide();
			if (res[6]) $("#b_conf").hide();
			else if ((!res[6])&&(FreebusyRoom.tactile!="readonly")&&(FreebusyRoom.btnConf=="true")&&(compareTime(now,res[0]))) $("#b_conf").show();
			$("#info-res-title").html(FreebusyRoom.mReunionAct);//"R&eacuteunion actuelle:"= mReunionAct
			$(".loadgif").hide();
			$(".btn_res").hide();
			
			var sujet="";
			if(FreebusyRoom.hideSubject=="false")
				if(res[4]) {sujet=' - '+'"'+res[4]+'"';}
				var fin=res[1]+sujet;
			var duree=deOrFromAndAOrTo(res[0],fin);//deOrFromAndAOrTo(debut,fin);
			$("#info-res-horaires").html(duree);
			if (FreebusyRoom.hideOwner=="false") {
				var owner=res[2];
			}
			var ownerPhone="";
			if (FreebusyRoom.hidePhone=="false") {
				if(res[3]) var ownerPhone=" - "+res[3];
			}
			var ownerInfo=owner+ownerPhone;
			if (ownerInfo!="undefined")
				$("#info-res-owner").html(ownerInfo);
				
			if (res[5]!=0) {
			$('#info-res-presta').html('<img src="prestation.png" style="width:1em;vertical-align:-15%;"> Prestations li\351es');
				
			}
		}
	}
	else {//il n'y a pas de reservation d'ici la fin de la journï¿½e
		if (FreebusyRoom.vacancy) {//si la salle est libre (et non-indisponible)
//-------Salle libre-----------
			if ($("#b_res60").length==0) sub.append('<li><div type="button" id="b_res60" class="menu_hour" onClick="res_demand(75)"> 1 h </div></li>');
			if ($("#b_res90").length==0) sub.append('<li><div type="button" id="b_res90" class="menu_hour" onClick="res_demand(105)"> 1 h 30 </div></li>');
			if ($("#b_res120").length==0) sub.append('<li><div type="button" id="b_res120" class="menu_hour" onClick="res_demand(135)"> 2 h </div></li>');
			var w=$(window).width();
			$('#info-res-presta').html('');
			$("body").css({"background-color":"#d7f0db"});//.css({"outline-left":"10px solid #38b54d"});
			$("#screenBorder").css({"background-color":"#38b54d"});
			$("#nom-salle").css({"color":"#d7f0db"});
			etat.html(FreebusyRoom.freeOrLibre).css({"color":"#38b54d"});
			if (FreebusyRoom.tactile!="readonly") $(".btn_res").show();
			else $(".btn_res").hide();
			$("#info-res-title").html(FreebusyRoom.mAutreReun);//"Pas d'autre r&eacuteservation pr&eacutevue aujourd'hui"=mAutreReun
			$(".loadgif").hide();
			$("#b_vide").hide();
			$("#b_conf").hide();
		}
		else {//si la salle est indisponible
//-------Salle indisponible-----------
		FreebusyRoom.state="busy";
		$('#info-res-presta').html('');
		$("body").css({"background-color":"#fad2d3"});
		$("#screenBorder").css({"background-color":"#ed1b24"});
		$("#nom-salle").css({"color":"#fad2d3"});
		etat.html(FreebusyRoom.indisOrUnav).css({"color":"#ed1b24"}).css({"padding-left":"19%"});
		$(".loadgif").hide();
		$("#b_vide").hide();
		$(".btn_res").hide();
		$("#b_conf").hide();
		}
	}
	setTimeout(function() {window.location.reload();},3600000);
	setTimeout(function() {refresh();},300000);
}

function refresh() {//fonction de rafraichissement
	//location.reload();
	getUrbaToken(getFreeRoomList);
	generalDisplay();
}

function createDate() {//renvois la date d'aujourd'hui au format urba
	var today= new Date();
	var year=today.getFullYear();
	var month=today.getMonth()+1;
	var day=today.getDate();
	
	if (month<10) month="0"+month;
	if (day<10) day="0"+day;
	var theDate=""+year+"-"+month+"-"+day;
	
	return theDate;
}

function createStartTime(){//faire commencer au quart d'heure précédent
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

function createJsonRes(){//json de réservation
	jsonToSend = '{"id":0,"date":"'+createDate()+'T00:00:00","startDate":"'+createDate()+'T'+createStartTime()+'","endDate":"'+createDate()+'T'+createEndTime()+'","fields":[{"name":"ecran","value":"Ecran","key":"Champ1"},{"name":null,"value":"Ecran","key":"Champ2"},{"name":null,"value":"","key":"Champ3"},{"name":null,"value":"","key":"Champ4"},{"name":null,"value":"","key":"Champ5"},{"name":null,"value":"","key":"Champ6"},{"name":null,"value":"","key":"Champ7"},{"name":null,"value":"","key":"Champ9"},{"name":null,"value":"","key":"Champ8"}],"status":null,"idReserveur":null,"idResaliee":null,"visit":{"id":0,"startDate":"'+createDate()+'T23:00:00","fields":[],"attendees":[{"id":0,"login":"tdieu","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dieu","surname":"ThÃ©o","mail":"theodieu@vdm.fr","department":"DSI"},{"id":0,"login":"hdumans","creationDate":null,"modificationDate":null,"statut":null,"fields":[],"name":"Dumans","surname":"Henriette","mail":"HenrietteDumans@vdm.fr","department":"Boucherie"}],"organisatorName":"Guillaume Allain","place":"salle 33","duration":200},"owner":null,"creator":null,"UID":"a85ebf5f-8051-4b9c-9ed9-0d8e6d02bc45","resource":{"id":'+FreebusyRoom.ID+'},"presenceConfirmedDate":"'+createDate()+'T00:00:00'+'"}'
	
	return jsonToSend;
}

function sendRes(){//envois de la réservation
	var jsonRes=createJsonRes();
	$.ajax({
		type: "POST",
		url: FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/Bookings?Token='+FreebusyRoom.validToken,
		contentType: 'application/json; charset=utf-8',
		data: jsonRes
		}).done(function( msg ) {
		location.reload();
	});
}

function getBookingToStop(){//recupère la resa à terminer!
	var clic; //variable qui permet de savoir lequel des boutons a été cliqué!
	$("body").append($('<span id="blockDiv"></span>'));
	var blockDiv=$("#blockDiv");
	blockDiv.css({
		"position": "absolute","left": "0",
		"right": "0","height": "100%",
		"width": "100%","z-index": "999",
		"background-color": "rgba(0, 0, 0, 0.8)"
	});
	blockDiv.append($('<span id="confirmerStop"></span>'));
	var sel=$("#confirmerStop");
	if(FreebusyRoom.lang=="fr"){
		sel.html('Souhaitez-vous vraiment lib&eacuterer cette r&eacuteservation?<br><input type="button" value=" OUI " size="44"></input>&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value=" NON "></input>');
	}
	else if(FreebusyRoom.lang="en"){
		sel.html('Do you really want to vacate this room?<br><input type="button" value="YES" size="44"></input>&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value="NO"></input>');
	}
	sel.css({		"width":"60%","heigth":"40%","position":"absolute",
					"border-radius":"5px","margin":"0 auto",
					"background":"#5e8894","display":"block",
					"left":"20%","top":"15%","text-align":"center","z-index":"2",
					"font-size":"1.55em","font-weight":"600","color":"#ffffff"});

	$("#confirmerStop input:first").click(function(){
		sel.remove();
		blockDiv.remove();
		$.ajax({
				type: "GET",
				url: FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/Bookings/'+FreebusyRoom.resId+"?Token="+FreebusyRoom.validToken,
				dataType : 'jsonp',
				jsonpCallback:"changeEndTime"
				})
	}).css({"border-radius": "0.1em", "margin":"0.5em", "padding":"0.1em 1em","font-size":"1.00em","font-weight":"bold"});//"-moz-box-shadow": "2px 2px 1px #888","-webkit-box-shadow": "2px 2px 1px #888",
	$("#confirmerStop input:last").click(function(){
		FreebusyRoom.getBookingToStop="false";
		sel.remove();
		blockDiv.remove();
	}).css({"border-radius": "0.1em", "margin":"0.5em",
			"padding":"0.1em 1em","font-size":"1.00em","font-weight":"bold"});
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
		url: FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/Bookings/'+FreebusyRoom.resId+'?Token='+FreebusyRoom.validToken+'&httpmethod=PUT',
		contentType: 'application/json; charset=utf-8',
		data : json
		}).done(function(msg){
			location.reload();
			});
}

function getRes() {
	console.log(FreebusyRoom.connectProtocol);
	var geturl=$.ajax({
		url : FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/bookings/'+FreebusyRoom.resId+'?&Token='+FreebusyRoom.validToken,
		dataType : 'jsonp',
		jsonpCallback: 'updateResToConfirmPresence'
	}).fail(function() {console.log("275"); getUrbaToken(getResInfo);});	
}

function updateResToConfirmPresence(json) {//modification du champ "presenceConfirmedDate"
	json.presenceConfirmedDate=""+createDate()+"T00:00:00";
	getUrbaToken(sendPresenceConfirmation, json);
}

function sendPresenceConfirmation(jsonUpdateConfPres) {//confirmation de la reservation courante. Elle met à jour le champ "presenceConfirmedDate" dans l'API avec la date du jour.

	json=JSON.stringify(jsonUpdateConfPres);

	$.ajax({
		type: "POST",
		url: FreebusyRoom.connectProtocol+FreebusyRoom.url+'api/v1/Bookings/'+FreebusyRoom.resId+"?Token="+FreebusyRoom.validToken+"&httpmethod=PUT",
		contentType: 'application/json; charset=utf-8',
		data:json
		}).done(function( msg ) {
		location.reload();
		});
}

function button_res() {
var sub=$("#sub");
	if (FreebusyRoom.bResPushed) {
		sub.hide();
		$("#sub li").hide();
		$(".menu_hour").hide();
		FreebusyRoom.bResPushed=false;
		document.getElementById("b_res_arrow").src = "arrow_d.png";
	}
	else {
		document.getElementById("b_res_arrow").src = "arrow_u.png";
		sub.show();
		$("#sub li").show();
		$(".menu_hour").show();
		FreebusyRoom.bResPushed=true;
	}
}

function res_demand(minutes) {
		$("#sub").hide();
		FreebusyRoom.timeRes=Math.floor(minutes/60)+":"+minutes%60;
		//affichage de la popup pour signifier la resa
			var st=createStartTime().replace(":00","");
			var en=createEndTime().replace(":00","");
			var sel=$('#forfade');
			sel.html(bookingConfirmationMess(FreebusyRoom.roomName,st,en,FreebusyRoom.lang));//bookingConfirmationMess(roomName,stH,endH)='Vous avez reserv&eacute; la salle '+FreebusyRoom.roomName+' de '+st+' &agrave; '+en
			sel.css({"width":"50%","heigth":"30%","position":"absolute",
				"border-radius":"5px","margin":"0 auto",
				"background":"#5e8894","display":"block",
				"left":"25%","top":"35%","text-align":"center","z-index":"2",
				"font-size":"2em","font-weight":"600","color":"#ffffff"});
			sel.fadeIn(30000,function () {
			setTimeout(function() {sel.fadeOut(5000);},1500);
			}); 
			setTimeout(function() {
				getUrbaToken(sendRes);
			}, 2000);
					//fin popup
}

function construireLaFrise(){// juste dessiner le squelette de la frise.
	var i;
	var tmp1, tmp2;
	var startH, startMin;
	var endH, endMin;
	var lig1=$("#ligne1");
	var lig2=$("#ligne2");
	for (i=8;i<20;i++){
		var percent= 100/12;
		lig1.append('<td width=percent+"%" class="caseFrise heureFrise" colspan="4">'+i+'h</td>');
		lig2.append('<td width=percent+"%" style="font-size:25%" class="caseFrise traitSeparation" colspan="4">&nbsp;</td>');
		var selection=$("#ligne3");
		selection.css({"position":"relative","z-index":"10"});
		for(var j=1; j<=4; j++){// division de chaque tranche d'heure en quatre (graduation selon le 1/4 d'heure)
		selection.append('<td class="caseFrise" heigth="10px" id="case'+i+''+j+'"> &nbsp;</td>');
		$("#case"+i+""+j).css({'background':'white'});
		}
	}
}

function getNextFreeTime() {// cherche la prochaine plage de temps libre suffisante pour pouvoir réserver
	var freeFifteenMinutes=[];
	var now=[];
	now=getTime().split(":");
	var hour=parseInt(now[0],10);
	var min=parseInt(now[1],10);
	var quarter;
	if (min<15) quarter=1;
	else if (min<30) quarter=2;
	else if (min<45) quarter=3;
	else quarter=4;
	var i=hour;

	while (i<20) {// parcour la frise à la recherche de cette plage horaire
		var I=i+'';
		if (i==hour) j=quarter;
		else j=1;
		while (j<5) {
			var J=j+'';
			if (freeFifteenMinutes.length<2){
				if ($("#case"+I+J).css("background-color")=="rgb(255, 255, 255)") {
					var minutes=(j-1)*15;
					if (minutes==0) minutes=minutes+'0';
					freeFifteenMinutes.push(I+":"+minutes);
				}
				else freeFifteenMinutes.length=0;
			}
			j++;
		}
		i++;
	}
	if (!freeFifteenMinutes[0]) freeFifteenMinutes[0]="la fin de la journ&eacutee" ;
	return freeFifteenMinutes[0];
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
					$("#"+idcasedebut).css({'background':'red'});
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
							$("#"+idcasedebut).css({'background':'red'});
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
							$("#"+idcasedebut).css({'background':'red'});
							}
						}
						else{
							for(l=1;l<=4;l++){
								var idcasedebut="case"+k+""+l;//l'id de la case Ã  colorier en rouge
								$("#"+idcasedebut).css({'background':'red'});
								}
						}

					}
				}
	});
		setInterval(function(){afficherHeureSurFrise()},1000);
}
function afficherHeureSurFrise(){// pour afficher un curseur pour l'heure sur la frise
	var t;
	var sel=$("#frise");
	var uniteHeure=$(window).width()/12;// calcul de la taille de l'heure en pixel. La division par 12 parce qu'il y a 12 tranches horaires (de 8h à 20h).
	var uniteMinute=uniteHeure/60;// calcul d'une minute en pixel
	t = getTime();
	var t2=[];
	t2=t.split(":");
	var h=parseInt(t2[0],10);
	var m=parseInt(t2[1],10);
	if(h<20){//après 20heures local, la frise n'affiche plus le curseur
		var temp=h-8;
		var pos= temp*uniteHeure+m*uniteMinute-1;//calcul de la position en fonction de l'heure actuelle en pixel
		if(FreebusyRoom.state=="free")
			sel.css('background-image','url(curseur-vert.png)');
		else
			if(FreebusyRoom.state=="busy")
				sel.css('background-image','url(curseur-rouge.png)');
		sel.css('background-position',pos);
		sel.css('background-size','1% 100%');
		grisageFrise(pos+4);
	}
}

function grisageFrise(pos){//pos= position de la frise à chaque minute
var select=$("#ligne3");
var position= select.position();
var h= select.height();
	$("#grisage").css({//,
	"z-index":"13","position": "absolute","height": h, "left":position.left,"opacity":"0.6",
	"top":position.top,"background": "rgba(0, 0, 0, 0.5)","left": "0","width":pos});
}

function saveParamInCookies(){//permet de sauvegarder certains parametre dans les cookies
	paramCookie=""+FreebusyRoom.tactile+","+FreebusyRoom.hideOwner+","+FreebusyRoom.hidePhone+","+FreebusyRoom.hideSubject+","+FreebusyRoom.btnConf;
	jaaulde.utils.cookies.set('FBRconf',paramCookie);
}
