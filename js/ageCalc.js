function ageCount() {
    var date1 = new Date();
    var birth = document.getElementById("birth").value;
    var date2 = new Date(birth);
    var rx = /^\d{1,2}\/\d{1,2}\/\d{4}$/;     
    if (rx.test(birth)) {
        var y1 = date1.getFullYear();           
        var y2 = date2.getFullYear();
        //getting birth year            
        var age = y1 - y2;
        //calculating age                       
        document.getElementById("ageId").value = age;
        return true;
    } else {
        alert("(dd/mm/yyyy) format required.");
        return false;
    }

}