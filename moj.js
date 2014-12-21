
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var mase = [];
var visine = [];
var steviloMas = 0;
var steviloVisin = 0;
var globalniItm = 0;
var stGrafov = 0;
var graf = 0;

// TABELA ZA TESTIRANJE
/*var tabelca = [ ["Eritreja", 19.85, "ERI"],
					["Nepal", 20.55, "NPL"],
					["Afganistan", 21.01, "AFG"],
					["Namibija", 22.0, "NAM"],
					["Kirgizistan", 22.90, "KG"],
					["Rusija", 23.25, "RUS"],
					["Uzbekistan", 23.80, "UZB"],
					["Nizozemska", 24.14, "NL"],
					["Albanija", 24.53, "AL"],
					["Slovenija", 25.38, "SVN"],
					["Argentina", 26.44, "ARG"],
					["Bahami", 27.09, "BHS"], 
					["ZDA", 27.82, "USA"],
					["Samoa", 28.34, "WSM"],
					["Tonga", 32.90, "TON"] ];*/
					
var svetovniItm = [];

$.getJSON("itmPoDrzavah.json", function(json) {
    console.log(json);
    console.log( "JSON Data: " + json.drzave[2].long );
    for(var i = 0; i < json.drzave.length; i++){
    	svetovniItm[i] = [];
    	svetovniItm[i][0] = json.drzave[i].long;
    	svetovniItm[i][1] = json.drzave[i].value;
    	svetovniItm[i][2] = json.drzave[i].name;
    }
    for(var i = 0; i < svetovniItm.length; i++){
		console.log("Država: " + svetovniItm[i][0] + ", koda: " + svetovniItm[i][2] + ", itm: " + svetovniItm[i][1]);
	}
});


function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim, vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    var seznamOpcij = document.getElementById("preberiEHROsebe");
		                    seznamOpcij.options[seznamOpcij.length] = new Option(ime + " " + priimek, ehrId);
		                    var seznamOpcij2 = document.getElementById("preberiObstojeciVitalniZnak");
		                    seznamOpcij2.options[seznamOpcij2.length] = new Option(ime + " " + priimek, ehrId);
		                    var seznamOpcij3 = document.getElementById("preberiEhrIdZaVitalneZnake");
		                    seznamOpcij3.options[seznamOpcij3.length] = new Option(ime + " " + priimek, ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim, vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}

function generirajPodatke(){
	var leto = steviloRand(1991, 2014);
	var mesec = steviloRand2(1, 12);
	
	if(mesec == 2 && ((leto % 400) == 0)){
		var dan = steviloRand2(1, 29);
	}
	else if(mesec == 2 && ((leto % 100) == 0)){
		var dan = steviloRand2(1, 28);
	}
	else if(mesec == 2 && ((leto % 4) == 0)){
		var dan = steviloRand2(1, 29);
	}
	else if(mesec == 2){
		var dan = steviloRand2(1, 28);
	}
	else if(mesec == 1 || mesec == 3 || mesec == 5 || mesec == 7 || mesec == 8 || mesec == 10 || mesec == 12){
		var dan = steviloRand2(1, 31);
	}
	else{
		var dan = steviloRand2(1, 30);
	}
	
	var ura = steviloRand2(0, 24);
	var minute = steviloRand2(0, 59);
	var visina = steviloRand(110, 220);
	
	if(visina < 150){
		var teza = steviloRand(35, 70);
	}
	else{
		var teza = steviloRand(70, 160);
	}
	var temp = steviloRand3(34, 39);
	var temperatura = Math.round(temp * 10 ) / 10;
	var sisTlak = steviloRand(50, 200);
	var diaTlak = steviloRand(40, sisTlak);
	
	var visinaM = visina / 100;
	var itm = teza / (visinaM * visinaM);
	if(itm < 26 && itm > 18.5){
		var nasicenost = steviloRand(95, 99);
	}
	else{
		var nasicenost = steviloRand(85, 94);
	}
	$("#dodajVitalnoDatumInUra").val(leto + "-" + mesec + "-" + dan + "T" + ura + ":" + minute);
	$("#dodajVitalnoTelesnaVisina").val(visina);
	$("#dodajVitalnoTelesnaTeza").val(teza);
	$("#dodajVitalnoTelesnaTemperatura").val(temperatura);
	$("#dodajVitalnoKrvniTlakSistolicni").val(sisTlak);
	$("#dodajVitalnoKrvniTlakDiastolicni").val(diaTlak);
	$("#dodajVitalnoNasicenostKrviSKisikom").val(nasicenost);
}

function steviloRand(min, max){
	var stevilo = Math.floor(Math.random() * (max - min + 1)) + min;
	return stevilo;
}

function steviloRand2(min, max){
	var stevilo = Math.floor(Math.random() * (max - min + 1)) + min;
	if (stevilo < 10){
		stevilo = "0" + stevilo;
	}
	return stevilo;
}

function steviloRand3(min, max){
	var stevilo = Math.random() * (max - min + 1) + min;
	return stevilo;
}

function napolniMase(karDobim){
	mase[steviloMas] = [];
	mase[steviloMas][0] = karDobim.time;
	mase[steviloMas][1] = karDobim.weight;
	steviloMas++;
}

function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim, vnesite zahtevan podatek!");
	} else {
		$("svg").remove();
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> osebe <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				
				
				// TELESNA TEMPERATURA
				if (tip == "telesna temperatura") {
					var AQL = 
						"select " +
    						"t/data[at0002]/events[at0003]/time/value as cas, " +
    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
						"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
						"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] ";
					$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna temperatura</th></tr>";
						        if(res){
						        	var rows = res.resultSet;
						        	for (var i in rows) {
						            	results += "<tr><td>" + rows[i].cas + "</td><td class='text-right'>" + rows[i].temperatura_vrednost + " " 	+ rows[i].temperatura_enota + "</td>";
						        	}
						        	results += "</table>";
						        	$("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
				
				// TELESNA MASA
				else if (tip == "telesna teža") {
					graf = 0;
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
				}
				
				// INDEKS TELESENE MASE
				else if(tip == "itm"){
					graf = 0;
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						        for (var i in res) {
						        	napolniMase(res[i]);
						        }
						        
						        $.ajax({
									url: baseUrl + "/view/" + ehrId + "/" + "height",
					    			type: 'GET',
					    			headers: {"Ehr-Session": sessionId},
					    			success: function (res) {
					    				if (res.length > 0) {
						        			for (var i in res) {
						        				visine[steviloVisin] = [];
						        				visine[steviloVisin][0] = res[i].time;
						        				var visina = Math.round(res[i].height * 10 ) / 10 / 100;
						        				visine[steviloVisin][1] = visina;
						        				steviloVisin++;
						        			}
						        			
						        			if(steviloMas > 0 && steviloVisin > 0){
												var rezultat = [];
												var steviloRezultatov = 0;
												var izpis = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Indeks telesne mase</th></tr>";
						
												// SPREHOD PO MERITVAH MASE (za vsako skupno meritev izračunaj ITM)
												for(var i = 0; i < steviloMas; i++){
													for(var j = 0; j < steviloVisin; j++){
														if(mase[i][0] == visine[j][0]){
															rezultat[steviloRezultatov] = [];
															rezultat[steviloRezultatov][0] = mase[i][0];
															var itm = Math.round((mase[i][1] / (visine[j][1] * visine[j][1])) * 10 ) / 10;
															rezultat[steviloRezultatov][1] = itm;
															izpis += "<tr><td>" + rezultat[steviloRezultatov][0] + "</td><td class='text-right'>" + rezultat[steviloRezultatov][1] + " kg/m^2" + "</td>";
															steviloRezultatov++;
															break;
														}
													}
												}
												izpis += "</table>";
												$("#rezultatMeritveVitalnihZnakov").append(izpis);
												mase = [];
												visine = [];
												rezultat = [];
												steviloMas = 0;
												steviloVisin = 0;
												steviloRezultatov = 0;
											}
					    				} else {
					    					$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    				}
					    			},
					    			error: function() {
					    				$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
										console.log(JSON.parse(err.responseText).userMessage);
					    			}
								});
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
				
				// INDEKS TELESNE MASE - GRAF
				if (tip == "itmGraf") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						        for (var i in res) {
						        	napolniMase(res[i]);
						        }
						        
						        $.ajax({
									url: baseUrl + "/view/" + ehrId + "/" + "height",
					    			type: 'GET',
					    			headers: {"Ehr-Session": sessionId},
					    			success: function (res) {
					    				if (res.length > 0) {
						        			for (var i in res) {
						        				visine[steviloVisin] = [];
						        				visine[steviloVisin][0] = res[i].time;
						        				var visina = Math.round(res[i].height * 10 ) / 10 / 100;
						        				visine[steviloVisin][1] = visina;
						        				steviloVisin++;
						        			}
						        			
						        			if(steviloMas > 0 && steviloVisin > 0){
												var rezultat = [];
												var steviloRezultatov = 0;
												var izpis = "<table class='table'><tr><th>Zadnje meritve</th></tr>";
												
												// SPREHOD PO MERITVAH MASE (za vsako skupno meritev izračunaj ITM)
												var stGumbov = 0;
												for(var i = 0; i < steviloMas; i++){
													for(var j = 0; j < steviloVisin; j++){
														if(mase[i][0] == visine[j][0]){
															if(stGumbov < 5){
																stGumbov++;
																rezultat[steviloRezultatov] = [];
																rezultat[steviloRezultatov][0] = mase[i][0];
																var itm = Math.round((mase[i][1] / (visine[j][1] * visine[j][1])) * 10 ) / 10;
																rezultat[steviloRezultatov][1] = itm;
																var id = "izbranaMeritevGraf" + stGumbov + itm;
																izpis += "<tr><td><button id='";
																izpis += id + "'type='button' class='btn btn-primary btn-sm' onclick='izrisiGraf(this.id)'>";
																izpis += rezultat[steviloRezultatov][0];
																izpis += "</button><span id='ujemanjeSporocilo";
																izpis += stGumbov + "'></span>";
																steviloRezultatov++;
																//document.getElementById(id).addEventListener("click", nastaviID(id));
																
																break;
															}
														}
													}
												}
												graf = 1;
												izpis += "</table>";
												$("#rezultatMeritveVitalnihZnakov").html(izpis);
												mase = [];
												visine = [];
												rezultat = [];
												steviloMas = 0;
												steviloVisin = 0;
												steviloRezultatov = 0;
												stGumbov = 0;
											}
					    				} else {
					    					$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    				}
					    			},
					    			error: function() {
					    				$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
										console.log(JSON.parse(err.responseText).userMessage);
					    			}
								});
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}	
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}

window.onresize = resize;

function resize(){
	if(stGrafov > 0 && graf == 1){
		izrisiGraf();
	}
}
// ujemanja:
//	0 - procentualno ujemanje
//	1 - država ujemanja
//	2 - ITM države ujemanja
//	3 - koda države ujemanja 
function izrisiGraf(rezItm){
	//console.log("Globalni itm: " + globalniItm);
	$("svg").remove();
	var mojItm = rezItm;
	var itm = 0;
	if (mojItm !== undefined) {
        // argument passed and not undefined
        if(mojItm.length <= 4){
		itm = rezItm;
		stGrafov++;
		}
		else{
			itm = mojItm.substring(19, 23);
			var stGumbov = mojItm.substring(18, 19);
			globalniItm = itm;
			stGrafov++;
		}
    } else {
        // argument not passed or undefined
        itm = globalniItm;
    }
	console.log(mojItm);
	
	
	console.log("Stevilo gumbov: " + stGumbov);
	
	//console.log("Stevilo grafov: " + stGrafov);
	
	var ujemanja = [];
	var ujem = 0;
	var tmp = 0;
	console.log("ITM: " + itm);
	for(var i = 0; i < svetovniItm.length; i++){
		ujemanja[i] = [];
		if(itm < svetovniItm[i][1]){
			ujem = itm / svetovniItm[i][1];
			tmp = Math.round(ujem * 1000 ) / 1000;
			ujemanja[i][0] = tmp;
			ujemanja[i][1] = svetovniItm[i][0];
			ujemanja[i][2] = svetovniItm[i][1];
			ujemanja[i][3] = svetovniItm[i][2];
		}
		else{
			ujem = svetovniItm[i][1] / itm;
			tmp = Math.round(ujem * 1000 ) / 1000;
			ujemanja[i][0] = tmp;
			ujemanja[i][1] = svetovniItm[i][0];
			ujemanja[i][2] = svetovniItm[i][1];
			ujemanja[i][3] = svetovniItm[i][2];
		}
	}
	sortiraj(ujemanja);
	for(var i = 0; i < ujemanja.length; i++){
		console.log("Ujemanje: " + ujemanja[i][0]*100 + " %, z državo: " + ujemanja[i][1]);
	}
	$("#ujemanjeSporocilo" + stGumbov).html("<span class='obvestilo label label-success fade-in'>ITM: " + itm + ". Največje ujemanje z državo: " + ujemanja[0][1] + "</span>");
	var data = [];
		
	for(var i = 0; i < svetovniItm.length; i++){
		data.push({name: ujemanja[i][3], value: ujemanja[i][0], long: ujemanja[i][1]});
	}
	/*var data = [
  		{name: "Locke",    value: 0.04},
  		{name: "Reyes",    value: 0.08},
  		{name: "Ford",     value: 0.15},
  		{name: "Jarrah",   value: 0.16},
  		{name: "Shephard", value: 0.23},
  		{name: "Kwon",     value: 0.42}
	];*/
	
	var w = window.innerWidth / 2 - 100;
	var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = w - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	//var formatPercent = d3.format(".0%");
	
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
    	.range([height, 0]);

	var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10, "%");
	
	/*var tip = d3.tip()
  		.attr('class', 'd3-tip')
  		.offset([-10, 0])
  		.html(function(d) {
    		return "<strong>" + d.name + "</strong> <span style='color:blue'>" + d.value + "</span>";
  		});
  	*/
  	
	var svg = d3.select("#rezultatMeritveVitalnihZnakov").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//svg.call(tip);
	
	  x.domain(data.map(function(d) { return d.long; }));
	  y.domain([0, d3.max(data, function(d) { return d.value; })]);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	      .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
            });

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	      svg.append("text")
        	.attr("x", (width / 2))             
        	.attr("y", 0 - (margin.top / 2))
        	.attr("text-anchor", "middle")  
        	.style("font-size", "14px") 
        	.style("text-decoration", "strong")  
        	.text("Ujemanje indeksa telesne mase s povprečjem v državah po svetu")
	    	.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")


	  svg.selectAll(".bar")
	      .data(data)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return x(d.long); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.value); })
	      .attr("height", function(d) { return height - y(d.value); })
		  //.on('mouseover', tip.show)
      	  //.on('mouseout', tip.hide);
      
      /*svg.selectAll(".bartext")
		.data(data)
		.enter()
		.append("text")
		.attr("class", "bartext")
		.attr("text-anchor", "middle")
		//.attr("fill", "white")
		.attr("x", function(d,i) {
    		return x(d.name);
		})
		.attr("y", function(d,i) {
		   return y(d.value);
		})
		.text(function(d){
	 		return d.long;
		})
		.attr("transform", "rotate(-90)");*/
		
	function type(d) {
	  d.value = +d.value;
	  return d;
	}
}

function sortiraj(tabela){
	for(var i = 0; i < tabela.length-1 ; i++){
		var maks = tabela[i][0];
		var maksD = tabela[i][1];
		var maksDi = tabela[i][2];
		var maksK = tabela[i][3];
		var iMaks = i;
		
		for(var j = i+1; j < tabela.length; j++){
			if(tabela[j][0] > maks){
				maks = tabela[j][0];
				maksD = tabela[j][1];
				maksDi = tabela[j][2];
				maksK = tabela[j][3];
				iMaks = j;
			}
		}
		tabela[iMaks][0] = tabela[i][0];
		tabela[iMaks][1] = tabela[i][1];
		tabela[iMaks][2] = tabela[i][2];
		tabela[iMaks][3] = tabela[i][3];
		tabela[i][0] = maks;
		tabela[i][1] = maksD;
		tabela[i][2] = maksDi;
		tabela[i][3] = maksK;
	}
}

$(document).ready(function() {
	$('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});
	$('#preberiPredlogoBolnika').change(function() {
		$("#kreirajSporocilo").html("");
		var podatki = $(this).val().split(",");
		$("#kreirajIme").val(podatki[0]);
		$("#kreirajPriimek").val(podatki[1]);
		$("#kreirajDatumRojstva").val(podatki[2]);
	});
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
	});
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
	$('#preberiEHROsebe').change(function() {
		$("#ehrIdKreiranega").val($(this).val());
	});
});