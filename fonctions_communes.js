var Common={};//variable globale pour ce fichier
function getTime(){// retourne l'heure au format "hh:mm"
	var myDate = new Date(); 
	var hour = myDate.getHours(); 
	var minute = myDate.getMinutes(); 
	var theTime;
	 
	if (hour < 10) { hour = "0" + hour; } 
	if (minute < 10) { minute = "0" + minute; } 
	
	theTime = "" + hour + ":" + minute;
	
	return theTime;
}
function showTime(){//écrit l'heure dans l'élément d'id 'hourpanel', se rafraichit toutes les secondes
	var t;
	t = getTime();
	document.getElementById('hourPanel').innerHTML=t;
	setTimeout("showTime();",1000);
}

function addTime(time1, time2) {//ajoute deux heures au format "hh:mm" et retourne la somme dans le même format
	var t1=time1.split(":");//récupération des hh, mm et ss
	var t2=time2.split(":");
	var t3=[];
	var time3="";
	
	minutes=parseInt(t1[1], 10)+parseInt(t2[1], 10);//addition des minutes
	reste=Math.floor(minutes/60);//conversion eventuelle en heure si minutes est supérieur ou égal à 60
	t3[1]=minutes%60;
	if (t3[1]<10) t3[1]="0"+t3[1];
	
	heures=parseInt(t1[0], 10)+parseInt(t2[0], 10)+reste;
	t3[0]=heures;
	if (t3[0]<10) t3[0]="0"+t3[0];
	
	time3=t3[0]+":"+t3[1];
	return time3;
}
function substractTime(t1, t2) {// soustrait deux heures au format "hh:mm" et retourne la différence dans le même format
	console.log(t1);
	var time1=[];
	var time2=[];
	var time1=t1.split(":");
	var time2=t2.split(":");
//conversion des deux heures en minutes
	var minutes1=60*parseInt(time1[0],10)+parseInt(time1[1],10);
	var minutes2=60*parseInt(time2[0],10)+parseInt(time2[1],10);
//soustraction des minutes et conversion au format "hh:mm"
	var minutes3=minutes1-minutes2;
	var min=minutes3%60;
	if (min<10) min="0"+min;
	var duree=Math.floor(minutes3/60)+":"+min;
	return duree;
}
function compareTime(time, ref) {//prend deux heures au format "hh:mm" et revoie "true" si la première est supérieure à la seconde, "false" sinon
	var r=ref.split(":");
	var t=time.split(":");
	if (parseInt(t[0],10)<parseInt(r[0],10)) return false;
	else if ((parseInt(t[0],10)==parseInt(r[0],10))&&(parseInt(t[1],10)<parseInt(r[1],10))) return false;
	else return true;
	
}
