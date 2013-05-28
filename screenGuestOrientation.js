var screenGuestOrientation= new Object();
var refresh=false;

function setIdentification(log, pass){
	screenGuestOrientation.login=log;
	screenGuestOrientation.password=pass;
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
  
function getTimeFromUrbaFormat(date){// extrait l'heure dans une date au format URBA
	var t= date.split("T");
	var hhmm= t[1].split(":");
	return ""+hhmm[0]+":"+hhmm[1]; // l'heure au format hh:mm
}

function initDocument(){
	var i=0;
	setUrlParameters();
	setLanguage();
	var w=$(window).width();
	var h=$(window).height();
	$("#entete").css("height",((h-25*h/100)/10)+"px");
	$(".refresh").css("height",((h-25*h/100)/10)+"px");
	$("#hourPanel").css("font-size",((w*h/1000000)+2)+"em");
	$(".tableau").css("font-size",((w*h/1000000)+1)+"em");
	$("#title").css("font-size",((w*h/1000000)+1)+"em");
	$(window).resize(function(){
		var w=$(window).width();
		var h=$(window).height();
		$("#entete").css("height",((h-25*h/100)/10)+"px");
		$(".refresh").css("height",((h-25*h/100)/10)+"px");
		$("#hourPanel").css("font-size",((w*h/1000000)+2)+"em");
		$(".tableau").css("font-size",((w*h/1000000)+1)+"em");
		$("#title").css("font-size",((w*h/1000000)+1)+"em");
	});
	
	getUrbaToken();
	getUrbaJson();
	displayNewJson(screenGuestOrientation.json);
}

function setUrlParameters(){
screenGuestOrientation.lang="fr";//langue par defaut c'est le français
screenGuestOrientation.lang=getURLParameter("lang");
}
function setLanguage(){
switch(screenGuestOrientation.lang){
	case "fr":
		$("#entete td").eq(0).html("Début");
		$("#entete td").eq(1).html("Organisateur");
		$("#entete td").eq(1).html("Salle");
	break;
	case "en":
		$("#entete td").eq(0).html("Start time");
		$("#entete td").eq(1).html("Owner");
		$("#entete td").eq(1).html("Room name");
	break;
}
}

function refreshScreen(){
		getUrbaToken();
}

 function getUrbaToken(){
	$.ajax({
		url : 'http://demo.urbaonline.com/pjeecran/authentication/getToken?login='+screenGuestOrientation.login+'&password='+screenGuestOrientation.password,
		dataType : 'jsonp',
		async : false,
		jsonpCallback: 'setValidToken',			
	})	
}

function setValidToken(newToken){
	screenGuestOrientation.validToken= newToken.Token;
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

function getUrbaJson(){
	var startDate=createStartDate();
	var endDate=createEndDate();
	$.ajax({
			url : 'http://demo.urbaonline.com/pjeecran/api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+screenGuestOrientation.validToken,
			dataType : 'jsonp',
			async : false,
			jsonpCallback: 'fillNewJson',		
		})
}
	
function fillNewJson(objJson){
	var intervalInMin=getTimeInterval();
	intervalInMin=parseInt(intervalInMin, 10);
	interval=""+Math.floor(intervalInMin/60)+":"+intervalInMin%60;
	try {
		var j=0;
		var newJson = [];
		var stH="";
		var endH="";
		var begun;
		var now=getTime();
		$.each(objJson, function(key, value) {
			stH=getTimeFromUrbaFormat(value.startDate);
			endH=getTimeFromUrbaFormat(value.endDate);
			var startMinusInterval=substractTime(stH, interval);
			if (compareTime(endH,now) && compareTime(now,startMinusInterval)) {// formation d'un nouveau JSON
				newJson[j] = {"heuresDeResa": stH, "organisateurs": value.fields[0].value, "salles": value.resource.displayName};
				j=j+1;
			}
		});
	}

	catch(e){
	console.log(e);
	getUrbaJson();
	}
	sortNewJson(newJson,"heuresDeResa");
}

function sortNewJson(jsonToSort, prop) {
    jsonToSort = jsonToSort.sort(function(a, b) {
        var A=a[prop].split(":");
		var B=b[prop].split(":");
		var x="";
		var y="";
		x=A[0]+""+A[1];
		y=B[0]+""+B[1];
		return parseInt(x, 10)-parseInt(y, 10);
    });
	screenGuestOrientation.json=jsonToSort;
}

function getTimeInterval(){//permet de récupérer l'intervalle de temps pendant lequel les réservations suivantes peuvent commencer
	var query= document.location.search;
	var tmp1=[];
	var tmp=[];
	if (query.indexOf("?")>=0){
		tmp1= query.split("?");
		if (tmp1[1].indexOf("&")>=0){
			tmp=tmp1[1].split("&");
			var timeInt=false;
			for (i=0;i<tmp.length;i++) {
				var t=[];
				t=tmp[i].split("=");
				if(t[0]=="timeNextBookings"){
					var timeNextBookings= t[1];
					timeInt=true;
					return timeNextBookings;
				}
			}
			if (!timeInt) return 120;
		}
		else {
			tmp=tmp1[1].split("=");
			if(tmp[0]=="timeNextBookings"){
				var timeNextBookings= tmp[1];
				return timeNextBookings;
			}
			else return 120;
		}
	}
	else return 120;
}

function getnbLinesToUpdate(){//permet de récupérer l'intervalle de temps pendant lequel les réservations suivantes peuvent commencer
	var query= document.location.search;
	var tmp1=[];
	var tmp=[];
	if (query.indexOf("?")>=0){
		tmp1= query.split("?");
		if (tmp1[1].indexOf("&")>=0){
			tmp=tmp1[1].split("&");
			var nbLineUp=false;
			for (i=0;i<tmp.length;i++) {
				var t=[];
				t=tmp[i].split("=");
				if(t[0]=="nbLinesToUpdate"){
					var nbLinesToUpdate= t[1];
					nbLineUp=true;
					return nbLinesToUpdate;
				}
			}
			if (!nbLineUp) return "";
		}
		else {
			tmp=tmp1[1].split("=");
			if(tmp[0]=="nbLinesToUpdate"){
				var nbLinesToUpdate= tmp[1];
				return nbLinesToUpdate;
			}
			else return "";
		}
	}
	else return "";
}

function displayNewJson(SortedJson){
	var ligne=0;
	var items = [];
	screenGuestOrientation.nbDisplayedRes=8;//nombre de réservations à montrer "par page"
	screenGuestOrientation.nbResToShow=getnbLinesToUpdate();//nombre de réservations à rafraîchir (quand ces deux nombres sont égaux, on rafraîchit les reservations page par page)
	if ((screenGuestOrientation.nbResToShow=="")||(screenGuestOrientation.nbResToShow>screenGuestOrientation.nbDisplayedRes)) screenGuestOrientation.nbResToShow=screenGuestOrientation.nbDisplayedRes;
	var today= new Date();
	now=getTime();
	$('.refresh').remove(); // on réinitialise la page (toutes les réservations précédentes sont supprimées afain de ne pas avoir de doublons)
	$('#entete').show(); // on remet l'entête (au cas où elle aurait été cachée quand il n'y a pas de réservation)
	$.each(SortedJson, function(key, value) {// pour chaque élément du json, on ajoute une ligne sur la page
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
	
	if (ligne==0) {// s'il n'y a pas de réservation, on cache l'entête et on affiche une ligne indiquant qu'il n'y a pas de réservation
		$('#entete').hide();
		items.push('<td colspan="4" class="noRes">Aucune réservation prévue pour l\'instant</td>');
		for (i=1; i<screenGuestOrientation.nbDisplayedRes; i++) {
			items.push('<td colspan="4">&nbsp;</td>');
		}		
		$('<tr>', {
		   'class': 'ligne1 refresh',
		   html: items.join('')
		   }).appendTo('table');
		   items.length = 0;
		   setTimeout("refreshScreen();", 300000)
	}
	else {// s'il y a des réservations
//--------------il doit y avoir une erreur dans le paragraphe suivant:
		var l=(ligne-screenGuestOrientation.nbDisplayedRes)%screenGuestOrientation.nbResToShow;
		if (!l==0) {//on rajoute un certain nombre de lignes vides afin d'obtenir des pages complètes
			do {
			items.push('<td colspan="4">&nbsp;</td>');
			$('<tr>', {
			   'class': 'ligne1 refresh',
			   'id': ligne,
			   html: items.join('')
			   }).appendTo('table');
			   items.length = 0;
			   ligne++;
			   l=(ligne-screenGuestOrientation.nbDisplayedRes)%screenGuestOrientation.nbResToShow;
			}while (!l==0)
		}
		
		var nbCycles=5;// nombre complètement arbitraire de cycles de rafraichissement
	
		if (ligne>screenGuestOrientation.nbDisplayedRes){// s'il y a plus d'une page
			for (i=screenGuestOrientation.nbDisplayedRes; i<ligne; i++) {//on cache toutes les lignes des pages suivantes
				$('#'+i).hide(0);
			}
			var nbRefreshToShowAll=Math.ceil((ligne-screenGuestOrientation.nbDisplayedRes)/screenGuestOrientation.nbResToShow);
			console.log(nbRefreshToShowAll);
			var k=1;
			var interval = setInterval(function(){//toutes les 10s (toujours complètement arbitraire)
				if (k<=nbRefreshToShowAll){// s'il y a toujours des pages à afficher, on passe à la suivante
					console.log("nextRes");
					nextRes(k, ligne);
					k++;
				}
				else {// sinon on repasse à la première page
					if (nbCycles>0) {
						console.log("showfirst");
						showFirstPage();
						k=1;
						nbCycles--;
					}
					else if (nbCycles==0) {// si on a fait tous les cycles, on rafraichit tout
						clearInterval(interval);
						refreshScreen();
					}
				}
			}, 5000);
		}
	}
}

function nextRes(iteration) {// fonction qui "tourne la page"

	$.fn.animateHighlight = function(highlightColor, duration) {//la super fonction qui fait un flash coloré
		var highlightBg = highlightColor || "#FFFF9C";
		var animateMs = duration || 1500;
		var originalBg = this.css("backgroundColor");
		this.stop().css("background-color", highlightBg).animate({backgroundColor: originalBg}, animateMs);
	};
//on définit les lignes qui appartiennent à cette page
	var intervalStart=iteration*screenGuestOrientation.nbResToShow;
	var intervalEnd=(iteration*screenGuestOrientation.nbResToShow)+screenGuestOrientation.nbDisplayedRes;
	var previousEnd=((iteration-1)*screenGuestOrientation.nbResToShow)+screenGuestOrientation.nbDisplayedRes;
	
	//$(".refresh").hide(0);//on cache toutes les lignes - sans exception (ça prend moins de temps)
	for (i=0;i<intervalStart;i++) {//on montre toutes les lignes qui appartiennent à la page que l'on veut montrer
		$('#'+i).hide(0);
	}
	for (i=previousEnd;i<intervalEnd;i++) {//on montre toutes les lignes qui appartiennent à la page que l'on veut montrer
		$('#'+i).show(0);
		$('#'+i).animateHighlight('#ffa500',1000);
	}
}

function showFirstPage() {
	$.fn.animateHighlight = function(highlightColor, duration) {
		var highlightBg = highlightColor || "#FFFF9C";
		var animateMs = duration || 1500;
		var originalBg = this.css("backgroundColor");
		this.stop().css("background-color", highlightBg).animate({backgroundColor: originalBg}, animateMs);
	};

	$(".refresh").hide(0);//on cache toutes les lignes
	for (i=0;i<screenGuestOrientation.nbDisplayedRes;i++) {//on montre les premières
		$('#'+i).show(0);
			$('#'+i).animateHighlight('#ffa500',1000);	
	}
}