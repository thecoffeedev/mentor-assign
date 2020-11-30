function makeMentorRows(data, status) {
    let table = document.getElementById("mentors_table")
    table.innerHTML = ""
    let thead = document.createElement("thead")
    let trh = document.createElement('tr')
    let trh0 = document.createElement('th')
    trh0.scope = "col"
    trh0.innerHTML = " "
    let trh1 = document.createElement('th')
    trh1.scope = "col"
    trh1.innerHTML = "ID"
    let trh2 = document.createElement('th')
    trh2.scope = "col"
    trh2.innerHTML = "Name"
    let trh3 = document.createElement('th')
    trh3.scope = "col"
    trh3.innerHTML = "Mentees"
    if (status != 0){
        trh.append(trh0, trh1, trh2, trh3)
    }else{
        trh.append(trh1, trh2, trh3)
    }
    thead.append(trh)

    let tbody = document.createElement("tbody")
    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement("tr");
        let th0 = document.createElement("td")
        th0.innerHTML = "<input type='radio' name='mentors_radio' value='" + data[i].mentor_id + "'>"
        let th1 = document.createElement("th");
        th1.scope = "row";
        th1.innerHTML = data[i].mentor_id;
        let th2 = document.createElement("td");
        th2.innerHTML = data[i].mentor_name;
        let th3 = document.createElement("td");
        th3.innerHTML = '<a href="#" class="badge badge-info" onclick="getStudentsList('+data[i].mentor_id+')">Show students</a>';
        if(status == 1 || status == 2){
            tr.append(th0, th1, th2, th3);
        }else{
            tr.append(th1, th2, th3);
        }
        tbody.appendChild(tr);
    }
    table.append(thead, tbody)
}

let makeStudentRows = function (data, status){
    let table = document.getElementById("students_table")
    table.innerHTML = ""
    let thead = document.createElement("thead")
    let trh = document.createElement('tr')
    let trh0 = document.createElement('th')
    trh0.scope = "col"
    trh0.innerHTML = " "
    let trh1 = document.createElement('th')
    trh1.scope = "col"
    trh1.innerHTML = "ID"
    let trh2 = document.createElement('th')
    trh2.scope = "col"
    trh2.innerHTML = "Name"
    let trh3 = document.createElement('th')
    trh3.scope = "col"
    trh3.innerHTML = "Mentor Id"
    if (status != 0){
        trh.append(trh0, trh1, trh2, trh3)
    }else{
        trh.append(trh1, trh2, trh3)
    }
    thead.append(trh)

    let tbody = document.createElement("tbody");
    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement("tr");
        let th0 = document.createElement("td")
        if (status === 1){
            th0.innerHTML = "<input type='checkbox' name='students_box' value='" + data[i].student_id + "'>"
        }else if(status == 2){
            th0.innerHTML = "<input type='radio' name='students_radio' value='" + data[i].student_id + "'>"
        }
        let th1 = document.createElement("th");
        th1.scope = "row";
        th1.innerHTML = data[i].student_id;
        let th2 = document.createElement("td");
        th2.innerHTML = data[i].student_name;
        let th3 = document.createElement("td");
        th3.innerHTML = data[i].mentor_id || "<strong>-</strong>";
        if(status == 1 || status == 2){
            tr.append(th0, th1, th2, th3);
        }else{
            tr.append(th1, th2, th3);
        }
        tbody.appendChild(tr);
    }
    table.append(thead, tbody)
}

let action = 0
let url = "http://localhost:3000"
function getData(num) {
    fetch(`${url}/mentors-list`)
        .then((res) => res.json())
        .then((res) => makeMentorRows(res.result, num));
    fetch(`${url}/students-list`)
    .then((res) => res.json())
    .then((res) => makeStudentRows(res.result, num))
    .catch((err) => {
        throw(err);
    })
}
getData(0);

let assignMentor = () => {
    action = 2
    getData(2)
    document.getElementById("assignMentor").disabled = true
    document.getElementById("assignStudents").disabled = false
    document.getElementById("alert-msg").innerHTML = "<strong>NOTE :</strong> You can select one student and can change or assign a mentor..."
}

let assignStudents = () => {
    action = 1
    getData(1)
    fetch(`${url}/idle-students`)
    .then((res) => res.json())
    .then((res) => makeStudentRows(res.result, 1))
    .catch((err) => {
        throw(err)
    })
    document.getElementById("assignStudents").disabled = true
    document.getElementById("assignMentor").disabled = false
    document.getElementById("alert-msg").innerHTML = "<strong>NOTE :</strong> You can select multiple idle students and can assign to one mentor..."
}

let dfView = () => {
    action = 0
    getData(0);
    document.getElementById("assignStudents").disabled = false
    document.getElementById("assignMentor").disabled = false
    document.getElementById("alert-msg").innerHTML = "<strong>Hello !!!</strong>"
}

let getStudentsList = (id) => {
    fetch(`${url}/students-under-mentor/${id}`)
    .then((res) => res.json())
    .then((res) => makeStudentRows(res.result, 0))
    .catch((err) => {
        throw(err)
    })
}

let assignButton = () => {
    if (action == 1){
        let mt_id = parseInt(document.querySelector('input[name="mentors_radio"]:checked').value);
        let checkboxes = document.getElementsByName("students_box")
        let valids = [];
        for (var checkbox of checkboxes) {
            if (checkbox.checked)
              valids.push(+checkbox.value);
        }
        fetch(`${url}/assign-mentor`, {
            method: "PUT",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "mentor_id": mt_id,
                "students_id": valids
            })
        })
        .then((res) => res.json())
        .then((res) => dfView())
        .catch((err) => {
            throw(err)
        })
    }else{
        let st_id = parseInt(document.querySelector('input[name="students_radio"]:checked').value);
        let mt_id = parseInt(document.querySelector('input[name="mentors_radio"]:checked').value);
        fetch(`${url}/assign-student`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_id: st_id,
                mentor_id: mt_id
            })
        })
        .then((res) => res.json())
        .then((res) => dfView())
        .catch((err) => {
            throw(err)
        })
    }

}

let addMentor = () => {
    let mt_id = parseInt(prompt("mentor_id: "))
    let mt_name = prompt("mentor_name: ")
    fetch(`${url}/create-mentor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mentor_id: mt_id,
            mentor_name: mt_name
        })
    }).then((res) => res.json)
    .then((res) => dfView())
    .catch((err) => {
        throw(err)
    })
}

let addStudent = () => {
    let st_id = parseInt(prompt("student_id: "))
    let st_name = prompt("student_name: ")
    let mt_id = parseInt(prompt("mentor_id: ")) || null
    fetch(`${url}/create-student`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            student_id: st_id,
            student_name: st_name,
            mentor_id: mt_id,
        })
    }).then((res) => res.json)
    .then((res) => dfView())
    .catch((err) => {
        throw(err)
    })
}