var ecranEnLecture= new Object();
var refresh=false;

function setIdentification(log, pass){
	ecranEnLecture.login=log;
	ecranEnLecture.password=pass;
}

function getDocumentReady(){
	$(document).ready(function() {
		getUrbaToken();
	});
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
	console.log(error);

	}	
}
// teste de git extension{}

function setValidToken(newToken){
	try { 
	ecranEnLecture.validToken= newToken.Token;
	}
	catch(e){
	console.log(e);
	getUrbaToken();
	}
	console.log(newToken.Token);
	
}

function creerListeSalles(){
var creation=[];
creation[0]='<ul id="liste-salle" data-role="listView" data-inset="true" data-divider-theme="d">';
creation[1]='<li data-role="list-divider" id="salles-libres">Libres</li>';
creation[2]='<li data-role="list-divider" id="salles-occupees">Occupées</li></ul>';
$('#container').append(creation.join(''));
}

function ajouterSallesBusy(){
}
