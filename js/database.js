var personDatabase = {};
personDatabase.webdb = {};
personDatabase.webdb.db = null;

function init() {
  personDatabase.webdb.open();
  personDatabase.webdb.createTable();
  personDatabase.webdb.createLNTable();
  personDatabase.webdb.getAllLastNames(loadLastNames);
}

// Create/open the database
personDatabase.webdb.open = function() {
	var dbs = 3 * 1024 * 1024
	personDatabase.webdb.db = openDatabase("persons", "1.0", "DeveloperTest Database", dbs);
};

// Create person database
personDatabase.webdb.createTable = function() {
	var db = personDatabase.webdb.db;
	db.transaction(function(transaction){
		transaction.executeSql("CREATE TABLE IF NOT EXISTS persons (" +
			"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
			"firstName TEXT NOT NULL, middleName TEXT NOT NULL, lastName TEXT NOT NULL, email TEXT NOT NULL, birth TEXT NOT NULL);");
	});
};

// Saves persons after submit
var savePerson = function(firstName, middleName, lastName, email, birth, successCallback){
	var db = personDatabase.webdb.db;
	db.transaction(function(transaction){
		transaction.executeSql(("INSERT INTO persons (firstName, middleName, lastName, email, birth) VALUES (?, ?, ?, ?, ?);"), 
		[firstName, middleName, lastName, email, birth], function(transaction, results){successCallback(results);}, errCallback);
	});
};

// Loads persons based on last name
var loadPerson = function(lastName, successCallback){
	var db = personDatabase.webdb.db;
	db.transaction(function(transaction){
		transaction.executeSql(("SELECT * FROM persons WHERE lastName=?"), [lastName],
			function(transaction, results){successCallback(results);}, errCallback);
		});
};


// Document ready event
$(function(){
	var form = $("form");

	var updatePage = function(results){
		var list = $("#persons-list");
		list.empty();
		console.dir(results);
		if (results.rows.length==0){
			alert("No one with that last name is in the database.");
		} else {
			$.each(results.rows, function(rowIndex){
				var row = results.rows.item(rowIndex);
				list.append( "<p style='text-align:left'>First Name: " + row.firstName + ",<br> Middle Name: " + row.middleName + ",<br> Last Name: " + row.lastName + ",<br> Email: " + row.email + ",<br> Birthdate: " + row.birth + "</p>");
			});
		}
	};
 
	form.submit(function(event){
		event.preventDefault();
		savePerson($('#firstName').val(), $('#middleName').val(), $('#lastName').val(), $('#email').val(), $('#birth').val(), function(){
			alert($('#firstName').val() + "'s data has been saved!");
		});
	});
	
	$('#show-me').click(function(){loadPerson($('#where').val(), updatePage);});
});

// Provides an error if database could not be called appropriately.
var errCallback = function(){
	alert("Database error.");
};


//Attempted to display a second table list on load with last names created in the database however had conflicted with the original form with the design I had implemented.
//Unfortunately could not be solved within the 4 hour limit.
personDatabase.webdb.createLNTable = function() {
	var db = personDatabase.webdb.db;
	db.transaction(function(transaction){
		transaction.executeSql("CREATE TABLE IF NOT EXISTS lastName(ID INTEGER PRIMARY KEY ASC, lastName TEXT, added_on DATETIME)", []);
	});
};

personDatabase.webdb.addLastName = function() {
	var addLastName = function(lastNameText, successCallback){
		var db = personDatabase.webdb.db;
		db.transaction(function(transaction){
			var addedDate = new Date();
			transaction.executeSql("INSERT INTO lastName(lastName, added_on) VALUES (?, ?)",
			[lastNameText, addedDate], function(transaction, results){successCallback(results);}, errCallback);
		});
	};
};

function addLastName() {
	var lastName = document.getElementById("lastName");
	personDatabase.webdb.addLastName(lastName.value);
}

personDatabase.webdb.getAllLastNames = function(renderFunc) {
    var db = personDatabase.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM lastName", [], renderFunc,
          function(transaction, results){successCallback(results);}, errCallback);
    });
};

function renderLastName(row){
  return "<li>" + row.lastName  + " [<a href='javascript:void(0);'  onclick='deleteLastName(" + row.ID +");'>Delete</a>]</li>";
};

var loadLastNames = function(tx, rs){
	var rowOutput = "";
	var lastNameItems = document.getElementById("lastNameItems");
    for (var i=0; i < rs.rows.length; i++) {
      rowOutput += renderLastName(rs.rows.item(i));
    }

	lastNameItems.innerHTML = rowOutput;
};

personDatabase.webdb.onSuccess = function(tx, r) {
	personDatabase.webdb.getAllLastNames(loadLastNames);
};

personDatabase.webdb.deleteLastName = function() {
	var deleteLastName = function(id){
		var db = personDatabase.webdb.db;
		db.transaction(function(transaction){
			transaction.executeSql("DELETE FROM lastName WHERE ID=?", [id], 
				personDatabase.webdb.onSuccess,
				function(transaction, results){successCallback(results);}, errCallback);
		});
	};
};