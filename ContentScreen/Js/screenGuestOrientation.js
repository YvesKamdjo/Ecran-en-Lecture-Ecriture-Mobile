var screenGuestOrientation= new Object();
var displayedRoomForGuest=[];

function setIdentification(log, pass,url){
	var l,p,u;//login password and URL
	l=getURLParameter("login");
	p=getURLParameter("password");
	u=getURLParameter("url");
	if(l=="null" || p=="null"){//Si les identifiants ne sont pas dans l'URL, alors on s'authentifie grace à ceux venus du fichier de conf
		screenGuestOrientation.login=log;
		screenGuestOrientation.password=pass;
	}
	else
	{
		screenGuestOrientation.login=l;
		screenGuestOrientation.password=p;
	}
	if(u=="null")
	screenGuestOrientation.url=url;
	else
	screenGuestOrientation.url=u;
	}


function getDMY() {
	var theDate=[];
	var mois = ["Janvier", "Février", "Mars", 
					"Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", 
					"Octobre", "Novembre", "Décembre"];
	var months = [ "January", "February", "March", "April", "May", "June",
							"July", "August", "September", "October", "November", "December" ];
	var myDate = new Date();
	var day = myDate.getDate(); 
	var year = myDate.getFullYear(); 
	if(screenGuestOrientation.lang=="fr"){
	var month = mois[myDate.getMonth()]; 
	theDate.push(day);
	theDate.push(month);
	theDate.push(year);
	}
	else if(screenGuestOrientation.lang=="en"){
		var month = months[myDate.getMonth()]; 
	theDate.push(day);
	theDate.push(month);
	theDate.push(year);
	}
	
	return theDate;
}
  
function showDate(){
	var date=getDMY();
	if(screenGuestOrientation.lang=="fr"){
		var theDate = 'Réunions du <span class="date">' + date[0] +" "+ date[1] +" "+ date[2] +'</span>';
	}
	else if(screenGuestOrientation.lang=="en"){
		var theDate = 'Bookings for <span class="date">' + date[0] +" "+ date[1] +", "+ date[2] +'</span>';
	}
	document.getElementById('title').innerHTML=theDate;
	setTimeout("showDate();",60000);
}
  
function getTimeFromUrbaFormat(date){// extrait l'heure dans une date au format URBA
	var t= date.split("T");
	var hhmm= t[1].split(":");
	return ""+hhmm[0]+":"+hhmm[1]; // l'heure au format hh:mm
}

function setDisplay() {
	var w=$(window).width();
	var h=$(window).height();
	$("#entete").css("height",(100/9)+"%");
	$(".refresh").css("height",(100/9)+"%");
	$("body").css("font-size",((w*h/1500000)+0.6)+"em");
	$("thead").css("height",20+"%");
	$("tbody").css("height",80+"%");
}

function initDocument(){
	//var i=0;
	setDefaultParameters();
	setUrlParameters();
	showTime();
	showDate();
	setLanguage();
	screenGuestOrientation.connectProtocol=window.location.protocol;//receperation du mode de protocole de connexion
	setDisplay();
	$(window).resize(function(){
		setDisplay();
	});
	getUrbaToken();
	getUrbaJson();
	displayNewJson(screenGuestOrientation.json);
}

function setDefaultParameters() {
	screenGuestOrientation.lang="fr";
	screenGuestOrientation.info1=0;
	screenGuestOrientation.timeNextBookings=120;
	screenGuestOrientation.refreshTime=300000;
	screenGuestOrientation.nbDisplayedRes=8;//nombre de réservations à montrer "par page"
	screenGuestOrientation.nbResToShow=screenGuestOrientation.nbDisplayedRes;//nombre de réservations à rafraîchir (quand ces deux nombres sont égaux, on rafraîchit les reservations page par page)
}

function setUrlParameters(){
//l'info de la première colonne (organisateur ou objet de la réunion)
	var info1=getURLParameter("infoToDisplay");
	if(info1!="null") screenGuestOrientation.info1=parseInt(info1,10); 
//langue
	var l=getURLParameter("lang");
	if(l!="null")
		screenGuestOrientation.lang=l;
//durée maximum entre l'heure actuelle et le début des prochaines réservations que l'on montre
	var tnb=getURLParameter("timeNextBookings");
	if (tnb!="null")
		screenGuestOrientation.timeNextBookings=tnb;
//nombre de lignes qui disparaissent/apparaissent lorsque toutes les réservations ne peuvent être affichées (rotation)
	var nrs=getURLParameter("timeNextBookings");
	if (nrs!="null")
		screenGuestOrientation.nbResToShow=nrs;
//temps en seconde avant chaque rafraîchissement, converti en millisecondes
	var rt=getURLParameter("refreshSec");
	if (rt!="null") {
		rt=parseInt(rt, 10)*1000;
		screenGuestOrientation.refreshTime=rt;
	}
//liste des ressources affichées
	var resources=getURLParameter("resources");//parametre URL pour lister les ressources à afficher
	if(resources!="null"){
		screenGuestOrientation.resourcesList=resources;//la liste des ressources groupees à afficher
		displayedRoomForGuest= resources.split(",");
	}
}

function setLanguage(){//changement de langue
switch(screenGuestOrientation.lang){
	case "fr":
		$("#entete td").eq(0).html("D&eacutebut");
		$("#entete td").eq(2).html("Salle");
		screenGuestOrientation.enCours="en cours";
		$("title").html('Orientation des visiteurs');
		screenGuestOrientation.loginError="Le nom d'utilisateur ou le mot de passe est incorrect. Veuillez vérifier le fichier de configuration.";
	break;
	case "en":
		$("#entete td").eq(0).html("Start time");
		$("#entete td").eq(2).html("Room name");
		screenGuestOrientation.enCours="In progress";
		$("title").html('Guest Orientation');
		screenGuestOrientation.loginError="The user name or password is incorrect. Please check the configuration file.";
	break;
}
}

function refreshScreen(){
		getUrbaToken();
		screenGuestOrientation.json=[];
		getUrbaJson();
		displayNewJson(screenGuestOrientation.json);
}

 function getUrbaToken(){
	$.ajax({
		url : screenGuestOrientation.connectProtocol+screenGuestOrientation.url+'authentication/getToken?login='+screenGuestOrientation.login+'&password='+screenGuestOrientation.password,
		dataType : 'jsonp',
		async : false,
		jsonpCallback: 'setValidToken',
		statusCode: {
		  404: function() {
			alert('Could not contact server.');
			window.location.reload();
		  },
		  500: function() {
			alert('A server-side error has occurred.');
			invalidPWorID();
			window.location.reload();
		  }
		},
	})
}

function invalidPWorID() {
	alert(screenGuestOrientation.loginError);
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
			url : screenGuestOrientation.connectProtocol+screenGuestOrientation.url+'api/v1/bookings?StartDate='+startDate+"&endDate="+endDate+'&Token='+screenGuestOrientation.validToken,
			dataType : 'jsonp',
			async : false,
			jsonpCallback: 'fillNewJson',
		statusCode: {
		  404: function() {
			//alert('Could not contact server.');
			window.location.reload();
		  },
		  500: function() {
			//alert('A server-side error has occurred.');
			window.location.reload();
		  }
		},			
		})
}
	
function fillNewJson(objJson){
	var intervalInMin=getTimeInterval();
	var tmp=displayedRoomForGuest.join(' ');// liste des ID à afficher
	intervalInMin=parseInt(intervalInMin, 10);
	interval=""+Math.floor(intervalInMin/60)+":"+intervalInMin%60;
	var j=0;
	var newJson = [];
	var stH="";
	var endH="";
	var begun;
	var now=getTime();
	$.each(objJson, function(key, value) {
		stH=getTimeFromUrbaFormat(value.startDate);
		endH=getTimeFromUrbaFormat(value.endDate);
		if (j==0) $("#entete td").eq(1).html(value.fields[screenGuestOrientation.info1].displayName);
		var startMinusInterval=substractTime(stH, interval);
		if (compareTime(endH,now) && compareTime(now,startMinusInterval)) { // formation d'un nouveau JSON
			if(displayedRoomForGuest.length>0){// s'il y a des salles à afficher alors,
				if( tmp.indexOf(value.resource.id)!=-1){//on verifie si elles font partie des bon id et on affiche 
					newJson[j] = {"heuresDeResa": stH, "organisateurs": value.fields[screenGuestOrientation.info1].value, "salles": value.resource.displayName};
					j=j+1;
				}
			}
			else {
				newJson[j] = {"heuresDeResa": stH, "organisateurs": value.fields[screenGuestOrientation.info1].value, "salles": value.resource.displayName};
				j=j+1;
			}
		}
			
	});

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
	if(screenGuestOrientation.timeNextBookings){
		return screenGuestOrientation.timeNextBookings;
	}
	else 
		return 120;
}


function displayNewJson(SortedJson){
	var ligne=0;
	var items = [];
	//screenGuestOrientation.nbResToShow=nombre de réservations à rafraîchir (quand ces deux nombres sont égaux, on rafraîchit les reservations page par page)
	if (screenGuestOrientation.nbResToShow>screenGuestOrientation.nbDisplayedRes) screenGuestOrientation.nbResToShow=screenGuestOrientation.nbDisplayedRes;
	var today= new Date();
	now=getTime();
	$('.refresh').remove(); // on réinitialise la page (toutes les réservations précédentes sont supprimées afain de ne pas avoir de doublons)
	$('#entete').show(); // on remet l'entête (au cas où elle aurait été cachée quand il n'y a pas de réservation)
	$.each(SortedJson, function(key, value) {// pour chaque élément du json, on ajoute une ligne sur la page
		addRes(SortedJson, items, ligne)
		ligne++;
	});
	
	if (ligne==0) {// s'il n'y a pas de réservation,  
		$('#entete').hide();//on cache l'entête
		displayNoRes(items);//et on affiche une ligne indiquant qu'il n'y a pas de réservation
		setTimeout("refreshScreen();", screenGuestOrientation.refreshTime);
	}
	else {// s'il y a des réservations
	
	//on regarde si le nombre de réservation est un multiple du nombre de réservation que l'on montre en une fois
		var l=(ligne-screenGuestOrientation.nbDisplayedRes)%screenGuestOrientation.nbResToShow;
	//sinon, on rajoute un certain nombre de lignes vides afin d'obtenir des pages complètes	
		if (!l==0) {
			ligne=addBlancLines(items,ligne); 
		}
		
	// s'il y a plus d'une page	
		if (ligne>screenGuestOrientation.nbDisplayedRes){
			
		//on cache toutes les lignes des pages suivantes
			for (i=screenGuestOrientation.nbDisplayedRes; i<ligne; i++) {
				$('#'+i).hide(0);
			}
			
		//calcul du nombre de page total et initialisation du numéro de page
			var nbPagesTotal=Math.ceil((ligne-screenGuestOrientation.nbDisplayedRes)/screenGuestOrientation.nbResToShow);
			var page=1;
		//on écrit le nombre de page sur le nombre de page total sur l'écran
			$("#page").html(page);
			$("#nbPages").html("/"+(nbPagesTotal+1));
			$("#pages").show();			
			turnPages(page, nbPagesTotal, ligne);//"tourne les pages" et rafraichi l'écran quand le nbCycle est atteint
		}
		else {
		$("#pages").hide();
		setTimeout("refreshScreen();", screenGuestOrientation.refreshTime);
		}
	}
}

function addRes(SortedJson, items, ligne) {
	if (ligne%2==0) p=1;
	if (ligne%2==1) p=2;
	var h=(SortedJson[ligne].heuresDeResa).split(":");
	items.push('<td class="heure">'+h[0]+"h"+h[1]+'</td>');
	items.push('<td class="organisateur">'+SortedJson[ligne].organisateurs+'</td>');                           
	items.push('<td class="salle">'+SortedJson[ligne].salles+'</td>');
	if (!compareTime(SortedJson[ligne].heuresDeResa,now)) 
		items.push('<td class="debut">'+screenGuestOrientation.enCours+'</td>');//screenGuestOrientation.enCours=en cours ou In Progress
	else 
		items.push('<td class="debut"></td>');		
	$('<tr>', {
	   'class': 'ligne'+p+' refresh',
	   'id': ligne,
	   html: items.join('')
	   }).appendTo('table');
	   items.length = 0; 
}

function displayNoRes(items) {//quand il n'y a pas de réservation
	if (screenGuestOrientation.lang=="en") items.push('<td colspan="4" class="noRes">No booking scheduled at the moment</td>');
	if (screenGuestOrientation.lang=="fr") items.push('<td colspan="4" class="noRes">Aucune réservation prévue pour l\'instant</td>');
	$('<tr>', {
	   'class': 'ligne1 refresh',
	   html: items.join('')
	   }).appendTo('table');
	   items.length = 0;
	   
	for (l=1; l<8; l++) {
		items.push('<td colspan="4">&nbsp;</td>');
		$('<tr>', {
		   'class': 'ligne1 refresh',
		   html: items.join('')
		   }).appendTo('table');	 
			items.length = 0;
	}
}

function turnPages(page, nbPagesTotal, ligne) {
	var time=screenGuestOrientation.nbResToShow*800+3000;
	var nbCycles=Math.ceil(screenGuestOrientation.refreshTime/(nbPagesTotal*time));
	if ((nbCycles<3)&&(nbPagesTotal<3)) nbCycles=3;
	var interval = setInterval(function(){//toutes les 8s (toujours complètement arbitraire)
		
		if (page<=nbPagesTotal){// s'il y a toujours des pages à afficher, on passe à la suivante
			nextRes(page, ligne);
			page++;
			$("#page").html(page);
		}
		else {// sinon on repasse à la première page
			if (nbCycles>0) {
				showFirstPage();
				page=1;
				$("#page").html(page);
				nbCycles--;
			}
			else if (nbCycles==0) {// si on a fait tous les cycles, on rafraichit tout
				clearInterval(interval);
				refreshScreen();
			}
		}
	}, time);
}

function addBlancLines(items,ligne) {//rajoute le nombre de lignes vide permettant d'obtenir un multiple de 8
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
	return ligne;
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
	
	//on cache toutes les lignes - sans exception (ça prend moins de temps)
	for (i=0;i<intervalStart;i++) {//on montre toutes les lignes qui appartiennent à la page que l'on veut montrer
		$('#'+i).hide(0);
	}
	for (i=previousEnd;i<intervalEnd;i++) {//on montre toutes les lignes qui appartiennent à la page que l'on veut montrer
		$('#'+i).show(0);
		//$('#'+i).animateHighlight('#ffa500',1000);
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
	}
}